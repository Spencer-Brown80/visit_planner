#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

#Review below imports for pipfile
import os
from datetime import datetime, timedelta, time



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

# User Authentication Routes
class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.password == data['password']:  # Replace with password hashing check
            session['user_id'] = user.id
            session.permanent = True  # Ensure the session persists
            return user.to_dict(), 200
        return {'error': 'Unauthorized'}, 401

class Logout(Resource):
    def post(self):
        session.pop('user_id', None)
        return {'message': 'Logged out'}, 200

api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')

# Example route requiring login
@app.route('/protected')
def protected():
    if not is_logged_in():
        return {'error': 'Unauthorized'}, 401
    return {'message': 'This is a protected route'}, 200







# User Events Routes
# User Events Routes
class UserEvents(Resource):
    def get(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user = User.query.get_or_404(id)
        events = [event.to_dict() for event in user.events]
        return jsonify(events)
    
    
     
        

    def post(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user = User.query.get_or_404(id)
        event_data = request.get_json()

        # Ensure proper format for start_time and date
        if 'start_time' in event_data:
            event_data['start_time'] = time.fromisoformat(event_data['start_time'])
        if 'date' in event_data:
            event_data['date'] = datetime.fromisoformat(event_data['date'])
        # Convert date_created to datetime if provided
        if 'date_created' in event_data:
            event_data['date_created'] = datetime.fromisoformat(event_data['date_created'])

        event = Event(user_id=user.id, **event_data)
        db.session.add(event)
        db.session.commit()
        return event.to_dict(), 201

api.add_resource(UserEvents, '/users/<int:id>/events')

class UserEvent(Resource):
    def get(self, id, event_id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        return event.to_dict()

    def patch(self, id, event_id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        event_data = request.get_json()

        # Ensure proper format for start_time and date
        if 'start_time' in event_data:
            event_data['start_time'] = time.fromisoformat(event_data['start_time'])
        if 'date' in event_data:
            event_data['date'] = datetime.fromisoformat(event_data['date'])
        # Convert date_created to datetime if provided
        if 'date_created' in event_data:
            event_data['date_created'] = datetime.fromisoformat(event_data['date_created'])

        for key, value in event_data.items():
            setattr(event, key, value)
        db.session.commit()
        return event.to_dict()

    def delete(self, id, event_id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return '', 204

api.add_resource(UserEvent, '/users/<int:id>/events/<int:event_id>')


class UserClientEvents(Resource):
    def get(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user_client = User.query.get_or_404(id)
        events = [event.to_dict() for event in user_client.events]
        return jsonify(events)
    
    def post(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user_client = User.query.get_or_404(id)
        event_data = request.get_json()

        # Ensure proper format for start_time and date
        if 'start_time' in event_data:
            event_data['start_time'] = time.fromisoformat(event_data['start_time'])
        if 'date' in event_data:
            event_data['date'] = datetime.fromisoformat(event_data['date'])
        # Convert date_created to datetime if provided
        if 'date_created' in event_data:
            event_data['date_created'] = datetime.fromisoformat(event_data['date_created'])

        event = Event(user_client_id=user_client.id, **event_data)
        db.session.add(event)
        db.session.commit()
        return event.to_dict(), 201
    
    
    
    

api.add_resource(UserClientEvents, '/user_clients/<int:id>/events')

class UserClientEvent(Resource):
    def get(self, id, event_id):
        # show single client event
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        return event.to_dict()

    def patch(self, id, event_id):
        # update a single client event
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        event_data = request.get_json()

        # Ensure proper format for start_time and date
        if 'start_time' in event_data:
            event_data['start_time'] = time.fromisoformat(event_data['start_time'])
        if 'date' in event_data:
            event_data['date'] = datetime.fromisoformat(event_data['date'])
        # Convert date_created to datetime if provided
        if 'date_created' in event_data:
            event_data['date_created'] = datetime.fromisoformat(event_data['date_created'])

        for key, value in event_data.items():
            setattr(event, key, value)
        db.session.commit()
        return event.to_dict()

    def delete(self, id, event_id):
        # delete a single client event
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return '', 204

api.add_resource(UserClientEvent, '/user_clients/<int:id>/events/<int:event_id>')

# Event Instances Routes
# EventInstances: Handles operations related to all instances of a specific event.
class EventInstances(Resource):
    def get(self, event_id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403
        event = Event.query.get_or_404(event_id)
        return jsonify([instance.to_dict() for instance in event.instances])

    def post(self, event_id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403
        event = Event.query.get_or_404(event_id)
        instance_data = request.get_json()
        
        # Ensure proper format for instance_date and start_time
        if 'instance_date' in instance_data:
            instance_data['instance_date'] = datetime.fromisoformat(instance_data['instance_date'])
        if 'start_time' in instance_data:
            instance_data['start_time'] = time.fromisoformat(instance_data['start_time'])

        instance_data.pop('event_id', None)  # Ensure 'event_id' is not in instance_data


        instance = EventInstance(event_id=event.id, **instance_data)
        db.session.add(instance)
        db.session.commit()
        return instance.to_dict(), 201

api.add_resource(EventInstances, '/events/<int:event_id>/instances')


# EventInstanceResource: Handles operations on a single instance of an event.
class EventInstanceResource(Resource):
    def get(self, event_id, instance_id):

        instance = EventInstance.query.get_or_404(instance_id)
        return instance.to_dict()

    def patch(self, event_id, instance_id):

        instance = EventInstance.query.get_or_404(instance_id)
        instance_data = request.get_json()
        
        # Ensure proper format for instance_date and start_time
        if 'instance_date' in instance_data:
            instance_data['instance_date'] = datetime.fromisoformat(instance_data['instance_date'])
        if 'start_time' in instance_data:
            instance_data['start_time'] = time.fromisoformat(instance_data['start_time'])

        
        for key, value in instance_data.items():
            setattr(instance, key, value)
        db.session.commit()
        return instance.to_dict()

    def delete(self, event_id, instance_id):        
        instance = EventInstance.query.get_or_404(instance_id)
        db.session.delete(instance)
        db.session.commit()
        return '', 204

api.add_resource(EventInstanceResource, '/events/<int:event_id>/instances/<int:instance_id>')

# Event Exceptions Routes
# EventExceptions: Handles operations related to all exceptions of a specific event instance.

class EventExceptions(Resource):
    def get(self, event_id, instance_id):
        instance = EventInstance.query.get_or_404(instance_id)
        return jsonify([exception.to_dict() for exception in instance.exceptions])

    def post(self, event_id, instance_id):
        instance = EventInstance.query.get_or_404(instance_id)
        event_data = request.get_json()
        
        # Ensure proper format for start_time and date
        if 'new_start_time' in event_data:
            event_data['new_start_time'] = time.fromisoformat(event_data['new_start_time'])
        if 'exception_date' in event_data:
            event_data['exception_date'] = datetime.fromisoformat(event_data['exception_date'])
        
        # Remove event_instance_id from event_data if it exists to avoid conflict
        event_data.pop('event_instance_id', None)
        
        exception = EventException(event_instance_id=instance.id, **event_data)
        db.session.add(exception)
        db.session.commit()
        return exception.to_dict(), 201

api.add_resource(EventExceptions, '/events/<int:event_id>/instances/<int:instance_id>/exceptions')





# EventExceptionResource: Handles operations on a single exception of an event instance.

class EventExceptionResource(Resource):
    def get(self, event_id, instance_id, exception_id):
        exception = EventException.query.get_or_404(exception_id)
        return exception.to_dict()

    def patch(self, event_id, instance_id, exception_id):
        exception = EventException.query.get_or_404(exception_id)
        event_data = request.get_json()
        
        # Ensure proper format for start_time and date
        if 'new_start_time' in event_data:
            event_data['new_start_time'] = time.fromisoformat(event_data['new_start_time'])
        if 'exception_date' in event_data:
            event_data['exception_date'] = datetime.fromisoformat(event_data['exception_date'])
        
        for key, value in event_data.items():
            setattr(exception, key, value)
        db.session.commit()
        return exception.to_dict()

    def delete(self, event_id, instance_id, exception_id):
        exception = EventException.query.get_or_404(exception_id)
        db.session.delete(exception)
        db.session.commit()
        return '', 204

api.add_resource(EventExceptionResource, '/events/<int:event_id>/instances/<int:instance_id>/exceptions/<int:exception_id>')



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

