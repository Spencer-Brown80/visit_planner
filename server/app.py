#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.exc import IntegrityError

import os
from datetime import datetime, timedelta, time, timezone
from dateutil.parser import isoparse
from dateutil.rrule import rrulestr
import logging
logging.basicConfig(level=logging.DEBUG)

# Local imports
from config import app, db, api
from models import User, User_Client, Event, User_Notification, User_Parameters
from models import User_Temp_Params, User_Notes, User_Reports, User_Client_Contacts, User_Client_Notes
from models import Event, EventInstance, EventException

# Set secret key for session management
app.secret_key = b"Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K"
app.permanent_session_lifetime = timedelta(minutes=30)

# Helper function to validate session
def is_logged_in():
    return 'user_id' in session

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def index():
    return "<h1>Project Server</h1>"

# Signup Routes
class Signup(Resource):
    def post(self):
        request_json = request.get_json()
        first_name = request_json.get("first_name")
        last_name = request_json.get("last_name")
        username = request_json.get("username")
        password = request_json.get("password")
        phone = request_json.get("phone")
        email = request_json.get("email")

        user = User(
            first_name=first_name,
            last_name=last_name,
            username=username,
            password=password,
            phone=phone,
            email=email,
        )

        try:
            db.session.add(user)
            db.session.commit()
            session["user_id"] = user.id  # session is a dictionary that stores user_id
            return user.to_dict(), 201

        except IntegrityError:
            return {"error": "422 Unprocessable Entity"}, 422

api.add_resource(Signup, "/signup", endpoint="signup")

# CheckSession Routes
class CheckSession(Resource):
    def get(self):
        user_id = session["user_id"]
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200
        return {}, 401

api.add_resource(CheckSession, "/check_session", endpoint="check_session")

# Login Routes
class Login(Resource):
    def post(self):
        request_json = request.get_json()
        username = request_json.get("username")
        password = request_json.get("password")
        user = User.query.filter(User.username == username).first()

        if user and user.password == password:
            session["user_id"] = user.id  # session is a dictionary that stores user_id
            return user.to_dict(), 200
        return {"error": "401 Unauthorized"}, 401

api.add_resource(Login, "/login", endpoint="login")

# Logout Routes
class Logout(Resource):
    def delete(self):
        if session.get("user_id"):
            session["user_id"] = None
            return {}, 204
        return {}, 401

api.add_resource(Logout, "/logout", endpoint="logout")

# Find overlapping events
def find_overlapping_events(event, all_events):
    overlapping_events = []
    for e in all_events:
        if e.id != event.id and e.start < event.end and e.end > event.start:
            overlapping_events.append(e)
    return overlapping_events

class UserEvents(Resource):
    def get(self, user_id):
        try:
            user = User.query.get_or_404(user_id)
            date_str = request.args.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                events = Event.query.filter_by(user_id=user.id).filter(
                    Event.start >= datetime.combine(date, datetime.min.time()),
                    Event.start < datetime.combine(date, datetime.max.time())
                ).all()
            else:
                events = Event.query.filter_by(user_id=user.id).all()

            events_with_clients = [event.to_dict() for event in events]
            return jsonify(events_with_clients)
        except Exception as e:
            app.logger.error(f"Error fetching events for user {user_id}: {str(e)}")
            return {"error": str(e)}, 500

    def post(self, user_id):
        data = request.get_json()
        event = Event(
            type=data['type'],
            status=data['status'],
            start=isoparse(data['start']),
            end=isoparse(data['end']),
            is_fixed=data['is_fixed'],
            priority=data['priority'],
            is_recurring=data['is_recurring'],
            recurrence_rule=data['recurrence_rule'],
            notify_client=data['notify_client'],
            notes=data['notes'],
            is_completed=data['is_completed'],
            is_endpoint=data['is_endpoint'],
            address=data['address'],
            city=data['city'],
            state=data['state'],
            zip=data['zip'],
            user_id=user_id,
            user_client_id=data['user_client_id']
        )
        db.session.add(event)
        db.session.commit()

        if event.is_recurring and event.recurrence_rule:
            recurring_events = generate_recurring_events(event)
            for recurring_event_data in recurring_events:
                existing_event = Event.query.filter_by(start=recurring_event_data['start'], parent_event_id=event.id).first()
                if not existing_event:
                    recurring_event = Event(**recurring_event_data)
                    db.session.add(recurring_event)
            db.session.commit()

        return (event.to_dict()), 201

def generate_recurring_events(event):
    max_end_date = event.start + timedelta(days=180)
    rule = rrulestr(event.recurrence_rule, dtstart=event.start)
    occurrences = rule.between(event.start, max_end_date, inc=True)  # Generate all occurrences

    existing_events = Event.query.filter(Event.parent_event_id == event.id).all()
    existing_occurrences = {e.start for e in existing_events}

    recurring_events = []
    for occurrence in occurrences:
        if occurrence > event.start and occurrence not in existing_occurrences:
            recurring_event = {
                'start': occurrence,
                'end': occurrence + (event.end - event.start),  # Adjust end time
                'type': event.type,
                'status': event.status,
                'is_fixed': event.is_fixed,
                'priority': event.priority,
                'is_recurring': False,  # Each generated event is not recurring itself
                'recurrence_rule': event.recurrence_rule,  # Include the recurrence rule
                'notify_client': event.notify_client,
                'notes': event.notes,
                'is_completed': event.is_completed,
                'is_endpoint': event.is_endpoint,
                'address': event.address,
                'city': event.city,
                'state': event.state,
                'zip': event.zip,
                'user_id': event.user_id,
                'user_client_id': event.user_client_id,
                'parent_event_id': event.id  # Link to the original event
            }
            recurring_events.append(recurring_event)
    return recurring_events

def parse_datetime(dt_str):
    try:
        return isoparse(dt_str)
    except ValueError:
        return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")


class UserEvent(Resource):
    def patch(self, id, event_id):
        data = request.get_json()
        logging.debug(f"PATCH request received with data: {data}")

        event = Event.query.get_or_404(event_id)
        logging.debug(f"Existing event: {event.to_dict()}")

        update_series = data.get('update_series', False)
        ignore_conflicts = data.get('ignore_conflicts', True)

        if not ignore_conflicts:
            all_events = Event.query.filter_by(user_id=event.user_id).all()
            conflicting_events = find_overlapping_events(event, all_events)
            if conflicting_events:
                return ({
                    'error': 'conflict',
                    'conflicts': [e.to_dict() for e in conflicting_events]
                }), 409

        if update_series:
            future_events = Event.query.filter(Event.parent_event_id == event.parent_event_id, Event.start >= event.start).all()
            for future_event in future_events:
                db.session.delete(future_event)

            logging.debug(f"Before conversion - Start: {data.get('start')}, End: {data.get('end')}")
            event.start = isoparse(data.get('start', event.start.isoformat())).replace(tzinfo=timezone.utc) - timedelta(hours=4)
            event.end = isoparse(data.get('end', event.end.isoformat())).replace(tzinfo=timezone.utc) - timedelta(hours=4)
            logging.debug(f"After conversion - Start: {event.start}, End: {event.end}")

            event.type = data.get('type', event.type)
            event.status = data.get('status', event.status)
            event.is_fixed = data.get('is_fixed', event.is_fixed)
            event.priority = data.get('priority', event.priority)
            event.is_recurring = data.get('is_recurring', event.is_recurring)
            event.recurrence_rule = data.get('recurrence_rule', event.recurrence_rule)
            event.notify_client = data.get('notify_client', event.notify_client)
            event.notes = data.get('notes', event.notes)
            event.is_completed = data.get('is_completed', event.is_completed)
            event.is_endpoint = data.get('is_endpoint', event.is_endpoint)
            event.address = data.get('address', event.address)
            event.city = data.get('city', event.city)
            event.state = data.get('state', event.state)
            event.zip = data.get('zip', event.zip)
            event.user_client_id = data.get('user_client_id', event.user_client_id)

            db.session.commit()

            recurring_events = generate_recurring_events(event)
            for recurring_event_data in recurring_events:
                recurring_event = Event(**recurring_event_data)
                db.session.add(recurring_event)
            db.session.commit()
        else:
            logging.debug(f"Before conversion - Start: {data.get('start')}, End: {data.get('end')}")
            event.start = isoparse(data.get('start', event.start.isoformat())).replace(tzinfo=timezone.utc) - timedelta(hours=4)
            event.end = isoparse(data.get('end', event.end.isoformat())).replace(tzinfo=timezone.utc) - timedelta(hours=4)
            logging.debug(f"After conversion - Start: {event.start}, End: {event.end}")

            event.type = data.get('type', event.type)
            event.status = data.get('status', event.status)
            event.is_fixed = data.get('is_fixed', event.is_fixed)
            event.priority = data.get('priority', event.priority)
            event.is_recurring = data.get('is_recurring', event.is_recurring)
            event.recurrence_rule = data.get('recurrence_rule', event.recurrence_rule)
            event.notify_client = data.get('notify_client', event.notify_client)
            event.notes = data.get('notes', event.notes)
            event.is_completed = data.get('is_completed', event.is_completed)
            event.is_endpoint = data.get('is_endpoint', event.is_endpoint)
            event.address = data.get('address', event.address)
            event.city = data.get('city', event.city)
            event.state = data.get('state', event.state)
            event.zip = data.get('zip', event.zip)
            event.user_client_id = data.get('user_client_id', event.user_client_id)
            event.parent_event_id = None  # Remove parent ID

            db.session.commit()
        
        return '', 200

    def delete(self, id, event_id):
        event = Event.query.get_or_404(event_id)
        update_series = request.args.get('update_series', 'false').lower() == 'true'
        
        if update_series:
            future_events = Event.query.filter(Event.parent_event_id == event.parent_event_id, Event.start >= event.start).all()
            for future_event in future_events:
                db.session.delete(future_event)
        else:
            db.session.delete(event)
        
        db.session.commit()
        return '', 204


api.add_resource(UserEvents, '/users/<int:user_id>/events')
api.add_resource(UserEvent, '/users/<int:id>/events/<int:event_id>')











class Users(Resource):
    def get(self):
        # return all users (Admin-not working)
        return jsonify([user.to_dict() for user in User.query.all()])
    
    

    def post(self):
        # add a user at login
        user_data = request.get_json()
        
        # Ensure date_created is a datetime object
        user_data['date_created'] = datetime.now()
        
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        return user.to_dict(), 201

api.add_resource(Users, '/users')

class UserProfile(Resource):
    def get(self, id):
        # display user profile
        user = User.query.get_or_404(id)
        return user.to_dict()

    def patch(self, id):
        # edit user profile
        user = User.query.get_or_404(id)
        user_data = request.get_json()
        
        # Remove date_created from the update data if present
        user_data.pop('date_created', None)
        
        # Check for unique constraints before setting new values
        if 'email' in user_data and user_data['email'] != user.email:
            existing_user = User.query.filter(User.email == user_data['email']).first()
            if existing_user and existing_user.id != user.id:
                return {'error': 'Email must be unique'}, 400

        if 'username' in user_data and user_data['username'] != user.username:
            existing_user = User.query.filter(User.username == user_data['username']).first()
            if existing_user and existing_user.id != user.id:
                return {'error': 'Username must be unique'}, 400

        
        for key, value in user_data.items():
            setattr(user, key, value)
        db.session.commit()
        return user.to_dict()

    def delete(self, id):
        # delete user (Admin-not working)
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return '', 204

api.add_resource(UserProfile, '/users/<int:id>')

class UserClients(Resource):
    def get(self):
        # view client list
        return jsonify([client.to_dict() for client in User_Client.query.all()])

    def post(self):
        # add a client
        client_data = request.get_json()
        client = User_Client(**client_data)
        db.session.add(client)
        db.session.commit()
        return client.to_dict(), 201

api.add_resource(UserClients, '/user_clients')

class UserClientProfile(Resource):
    def get(self, id):
        # view selected client profile
        client = User_Client.query.get_or_404(id)
        return client.to_dict()

    def patch(self, id):
        # update selected client profile
        client = User_Client.query.get_or_404(id)
        client_data = request.get_json()
        for key, value in client_data.items():
            setattr(client, key, value)
        db.session.commit()
        return client.to_dict()

    def delete(self, id):
        # delete client
        client = User_Client.query.get_or_404(id)
        db.session.delete(client)
        db.session.commit()
        return '', 204

api.add_resource(UserClientProfile, '/user_clients/<int:id>')

class UserParameters(Resource):
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return jsonify([param.to_dict() for param in user.parameters])

    def post(self, user_id):
        param_data = request.get_json()
        
        # Ensure proper format for start_date and start_time
        if 'start_date' in param_data:
            param_data['start_date'] = datetime.fromisoformat(param_data['start_date'])
        if 'start_time' in param_data:
            param_data['start_time'] = time.fromisoformat(param_data['start_time'])
        # Ensure proper format for end_date and end_time, allowing for null values
        if 'end_date' in param_data and param_data['end_date']:
            param_data['end_date'] = datetime.fromisoformat(param_data['end_date'])
        else:
            param_data['end_date'] = None
            
        if 'end_time' in param_data and param_data['end_time']:
            param_data['end_time'] = time.fromisoformat(param_data['end_time'])
        else:
            param_data['end_time'] = None
            
        param_data['user_id'] = user_id
        
        new_param = User_Parameters(**param_data)
        
        db.session.add(new_param)
        db.session.commit()
        return new_param.to_dict(), 201

api.add_resource(UserParameters, '/users/<int:user_id>/user_parameters')

class UserParameter(Resource):
    def get(self, user_id, param_id):
        # get a specified user parameter
        user_param = User_Parameters.query.get_or_404(param_id)
        return user_param.to_dict()

    def patch(self, user_id, param_id):
        # update specified user parameter
        param = User_Parameters.query.get_or_404(param_id)
        param_data = request.get_json()
        
        if 'start_date' in param_data:
            param_data['start_date'] = datetime.fromisoformat(param_data['start_date'])
        if 'start_time' in param_data:
            param_data['start_time'] = time.fromisoformat(param_data['start_time'])
        # Ensure proper format for end_date and end_time, allowing for null values
        if 'end_date' in param_data and param_data['end_date']:
            param_data['end_date'] = datetime.fromisoformat(param_data['end_date'])
        else:
            param_data['end_date'] = None
            
        if 'end_time' in param_data and param_data['end_time']:
            param_data['end_time'] = time.fromisoformat(param_data['end_time'])
        else:
            param_data['end_time'] = None
            
        for key, value in param_data.items():
            setattr(param, key, value)
        db.session.commit()
        return param.to_dict()

    def delete(self, user_id, param_id):
        # delete user parameter
        param = User_Parameters.query.get_or_404(param_id)
        db.session.delete(param)
        db.session.commit()
        return '', 204

api.add_resource(UserParameter, '/users/<int:user_id>/user_parameters/<int:param_id>')

class UserNotes(Resource):
    def get(self, id):
        # display all user notes
        user = User.query.get_or_404(id)
        return jsonify([note.to_dict() for note in user.notes])

    def post(self, id):
        # add a user note
        user = User.query.get_or_404(id)
        note_data = request.get_json()
        
        # Ensure proper format for date_created
        if 'date_created' in note_data:
            note_data['date_created'] = datetime.fromisoformat(note_data['date_created'])
        
        # Remove user_id if it exists in note_data to avoid conflict
        if 'user_id' in note_data:
            del note_data['user_id']
        
        note = User_Notes(user_id=user.id, **note_data)
        db.session.add(note)
        db.session.commit()
        return note.to_dict(), 201

api.add_resource(UserNotes, '/users/<int:id>/user_notes')

class UserNote(Resource):
    def get(self, id, note_id):
        # view a selected note
        note = User_Notes.query.get_or_404(note_id)
        return note.to_dict()

    def patch(self, id, note_id):
        # update selected note
        note = User_Notes.query.get_or_404(note_id)
        note_data = request.get_json()
        
        # Ensure proper format for date_created
        if 'date_created' in note_data:
            note_data['date_created'] = datetime.fromisoformat(note_data['date_created'])
        
        for key, value in note_data.items():
            setattr(note, key, value)
        db.session.commit()
        return note.to_dict()

    def delete(self, id, note_id):
        # delete note
        note = User_Notes.query.get_or_404(note_id)
        db.session.delete(note)
        db.session.commit()
        return '', 204

api.add_resource(UserNote, '/users/<int:id>/user_notes/<int:note_id>')

class UserNotifications(Resource):
    def get(self, id):
        # view all notifications
        user = User.query.get_or_404(id)
        return jsonify([notification.to_dict() for notification in user.notifications])

    def post(self, id):
        # add a notification
        user = User.query.get_or_404(id)
        notification_data = request.get_json()
        
        # Ensure proper format for date_created
        if 'date_created' in notification_data:
            notification_data['date_created'] = datetime.fromisoformat(notification_data['date_created'])
        
        # Remove user_id if it exists in notification_data to avoid conflict
        if 'user_id' in notification_data:
            del notification_data['user_id']
        
        notification = User_Notification(user_id=user.id, **notification_data)
        db.session.add(notification)
        db.session.commit()
        return notification.to_dict(), 201

api.add_resource(UserNotifications, '/users/<int:id>/user_notifications')

class UserNotification(Resource):
    def get(self, id, notification_id):
        # view all user notifications
        notification = User_Notification.query.get_or_404(notification_id)
        return notification.to_dict()

    def delete(self, id, notification_id):
        # delete a user notification
        notification = User_Notification.query.get_or_404(notification_id)
        db.session.delete(notification)
        db.session.commit()
        return '', 204

api.add_resource(UserNotification, '/users/<int:id>/user_notifications/<int:notification_id>')

class UserReports(Resource):
    def get(self, id):
        # view all user reports
        user = User.query.get_or_404(id)
        return jsonify([report.to_dict() for report in user.reports])

    def post(self, id):
        # post a report
        user = User.query.get_or_404(id)
        report_data = request.get_json()
        report = User_Reports(user_id=user.id, **report_data)
        db.session.add(report)
        db.session.commit()
        return report.to_dict(), 201

api.add_resource(UserReports, '/users/<int:id>/user_reports')

class UserReport(Resource):
    def get(self, id, report_id):
        # get a specific user report
        report = User_Reports.query.get_or_404(report_id)
        return report.to_dict()

    def delete(self, id, report_id):
        # delete a user report
        report = User_Reports.query.get_or_404(report_id)
        db.session.delete(report)
        db.session.commit()
        return '', 204

api.add_resource(UserReport, '/users/<int:id>/user_reports/<int:report_id>')

class UserClientContacts(Resource):
    def get(self, id):
        # view all client contacts
        user_client = User_Client.query.get_or_404(id)
        return jsonify([contact.to_dict() for contact in user_client.client_contacts])

    def post(self, id):
        # add a client contact
        user_client = User_Client.query.get_or_404(id)
        contact_data = request.get_json()
        
        # Ensure user_client_id is not in contact_data to avoid conflict
        if 'user_client_id' in contact_data:
            del contact_data['user_client_id']
        
        contact = User_Client_Contacts(user_client_id=user_client.id, **contact_data)
        db.session.add(contact)
        db.session.commit()
        return contact.to_dict(), 201

api.add_resource(UserClientContacts, '/user_clients/<int:id>/user_client_contacts')

class UserClientContact(Resource):
    def get(self, id, contact_id):
        # get a specific client contact
        contact = User_Client_Contacts.query.get_or_404(contact_id)
        return contact.to_dict()

    def patch(self, id, contact_id):
        # update client contact info
        contact = User_Client_Contacts.query.get_or_404(contact_id)
        contact_data = request.get_json()
        for key, value in contact_data.items():
            setattr(contact, key, value)
        db.session.commit()
        return contact.to_dict()

    def delete(self, id, contact_id):
        # delete client contact
        contact = User_Client_Contacts.query.get_or_404(contact_id)
        db.session.delete(contact)
        db.session.commit()
        return '', 204

api.add_resource(UserClientContact, '/user_clients/<int:id>/user_client_contacts/<int:contact_id>')


class UserClientNotes(Resource):
    def get(self, id):
        # view all client notes
        user_client = User_Client.query.get_or_404(id)
        return jsonify([note.to_dict() for note in user_client.client_notes])

    def post(self, id):
        # add a client note
        user_client = User_Client.query.get_or_404(id)
        note_data = request.get_json()
        # Ensure proper format for date_created
        if 'date_created' in note_data:
            note_data['date_created'] = datetime.fromisoformat(note_data['date_created'])
        
        # Remove user_client_id if it exists in note_data to avoid conflict
        if 'user_client_id' in note_data:
            del note_data['user_client_id']
        
        note = User_Client_Notes(user_client_id=user_client.id, **note_data)
        db.session.add(note)
        db.session.commit()
        return note.to_dict(), 201

api.add_resource(UserClientNotes, '/user_clients/<int:id>/user_client_notes')

class UserClientNote(Resource):
    def get(self, id, note_id):
        # get a specific client note
        note = User_Client_Notes.query.get_or_404(note_id)
        return note.to_dict()

    def patch(self, id, note_id):
        # update client note
        note = User_Client_Notes.query.get_or_404(note_id)
        note_data = request.get_json()
        # Ensure proper format for date_created
        if 'date_created' in note_data:
            note_data['date_created'] = datetime.fromisoformat(note_data['date_created'])
        
        
        for key, value in note_data.items():
            setattr(note, key, value)
        db.session.commit()
        return note.to_dict()

    def delete(self, id, note_id):
        # delete client note
        note = User_Client_Notes.query.get_or_404(note_id)
        db.session.delete(note)
        db.session.commit()
        return '', 204

api.add_resource(UserClientNote, '/user_clients/<int:id>/user_client_notes/<int:note_id>')

class UserTempParams(Resource):
    def get(self, id):
        # View all user temp params
        user = User.query.get_or_404(id)
        return jsonify([param.to_dict() for param in user.temp_params])

    def post(self, id):
        # Add a user temp param
        user = User.query.get_or_404(id)
        param_data = request.get_json()
        
        # Ensure proper format for date and time fields
        if 'date' in param_data:
            param_data['date'] = datetime.fromisoformat(param_data['date'])
        if 'start_time' in param_data:
            param_data['start_time'] = time.fromisoformat(param_data['start_time'])
        
        if 'end_time' in param_data and param_data['end_time']:
            param_data['end_time'] = time.fromisoformat(param_data['end_time'])
        else:
            param_data['end_time'] = None
        
        param = User_Temp_Params(user_id=user.id, **param_data)
        db.session.add(param)
        db.session.commit()
        return param.to_dict(), 201

api.add_resource(UserTempParams, '/users/<int:id>/user_temp_params')

class UserTempParam(Resource):
    def get(self, id, param_id):
        # Get a specific temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        return param.to_dict()

    def patch(self, id, param_id):
        # Update a temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        param_data = request.get_json()
        
        # Ensure proper format for date and time fields
        if 'date' in param_data:
            param_data['date'] = datetime.fromisoformat(param_data['date'])
        if 'start_time' in param_data:
            param_data['start_time'] = time.fromisoformat(param_data['start_time'])
        
        if 'end_time' in param_data and param_data['end_time']:
            param_data['end_time'] = time.fromisoformat(param_data['end_time'])
        else:
            param_data['end_time'] = None
        for key, value in param_data.items():
            setattr(param, key, value)
        db.session.commit()
        return param.to_dict()

    def delete(self, id, param_id):
        # Delete a temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        db.session.delete(param)
        db.session.commit()
        return '', 204

api.add_resource(UserTempParam, '/users/<int:id>/user_temp_params/<int:param_id>')