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
from datetime import datetime, timedelta



# Local imports
from config import app, db, api
from models import User, User_Client, Event, User_Notification, User_Parameters 
from models import User_Temp_Params, User_Notes, User_Reports, User_Client_Contacts, User_Client_Notes
from models import Event, EventInstance, EventException

# Ensure CORS is enabled
CORS(app)

# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'



# User Authentication Routes
class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.password == data['password']:  # Replace with password hashing check
            session['user_id'] = user.id
            session.permanent = True  # Ensure the session persists
            app.permanent_session_lifetime = timedelta(minutes=30)
            return user.to_dict(), 200
        return {'error': 'Unauthorized'}, 401

class Logout(Resource):
    def post(self):
        session.pop('user_id', None)
        return {'message': 'Logged out'}, 200

api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')

# Helper function to validate session
def is_logged_in():
    return 'user_id' in session



# User Events Routes
# User Events Routes
class UserEvents(Resource):
    def get(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user = User.query.get_or_404(id)
        return jsonify([event.to_dict() for event in user.events])

    def post(self, id):
        if not is_logged_in() or session['user_id'] != id:
            return {'error': 'Forbidden'}, 403

        user = User.query.get_or_404(id)
        event_data = request.get_json()

        # Fetch user parameters and temporary parameters
        user_params = User_Parameters.query.filter_by(user_id=id).all()
        temp_params = User_Temp_Params.query.filter_by(user_id=id).all()
        valid_event_data = validate_event_data(event_data, user_params, temp_params)

        event = Event(user_id=user.id, **valid_event_data)
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

        # Fetch user parameters and temporary parameters
        user_params = User_Parameters.query.filter_by(user_id=id).all()
        temp_params = User_Temp_Params.query.filter_by(user_id=id).all()
        valid_event_data = validate_event_data(event_data, user_params, temp_params)

        for key, value in valid_event_data.items():
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

# Validates Event against parameters before posting
def validate_event_data(event_data, user_params, temp_params):
    event_start_time = datetime.strptime(event_data['start_time'], '%Y-%m-%dT%H:%M:%S')
    event_end_time = event_start_time + timedelta(minutes=event_data['duration'])

    # Apply temporary parameters first (if they exist)
    for param in temp_params:
        if param.date.date() == event_start_time.date():
            if param.is_start_mandatory and event_start_time < param.start_time:
                event_start_time = param.start_time
            if param.is_end_mandatory and event_end_time > param.end_time:
                event_end_time = param.end_time

    # Apply user parameters
    for param in user_params:
        day_of_week = param.day_of_week
        if event_start_time.strftime('%A') == day_of_week:
            param_start_date = param.start_date
            param_end_date = param.end_date if param.end_date else datetime.max
            if param_start_date <= event_start_time <= param_end_date:
                if param.is_start_mandatory and event_start_time < param.start_time:
                    event_start_time = param.start_time
                if param.is_end_mandatory and event_end_time > param.end_time:
                    event_end_time = param.end_time

    event_data['start_time'] = event_start_time.strftime('%Y-%m-%dT%H:%M:%S')
    event_data['end_time'] = event_end_time.strftime('%Y-%m-%dT%H:%M:%S')
    return event_data
class UserClientEvents(Resource):
    def get(self, id):
        # show all client events
        user_client = User_Client.query.get_or_404(id)
        return jsonify([event.to_dict() for event in user_client.events])

    def post(self, id):
        # post a client event
        user_client = User_Client.query.get_or_404(id)
        event_data = request.get_json()
        event = Event(user_client_id=user_client.id, **event_data)
        db.session.add(event)
        db.session.commit()
        return event.to_dict(), 201

api.add_resource(UserClientEvents, '/user_clients/<int:id>/events')

class UserClientEvent(Resource):
    def get(self, id, event_id):
        # show single client event
        event = Event.query.get_or_404(event_id)
        return event.to_dict()

    def patch(self, id, event_id):
        # update a single client event
        event = Event.query.get_or_404(event_id)
        event_data = request.get_json()
        for key, value in event_data.items():
            setattr(event, key, value)
        db.session.commit()
        return event.to_dict()

    def delete(self, id, event_id):
        # delete a single client event
        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return '', 204

api.add_resource(UserClientEvent, '/user_clients/<int:id>/events/<int:event_id>')

# Event Instances Routes
# EventInstances: Handles operations related to all instances of a specific event.
class EventInstances(Resource):
    def get(self, event_id):
        event = Event.query.get_or_404(event_id)
        return jsonify([instance.to_dict() for instance in event.instances])

    def post(self, event_id):
        event = Event.query.get_or_404(event_id)
        instance_data = request.get_json()
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
        exception_data = request.get_json()
        exception = EventException(event_instance_id=instance.id, **exception_data)
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
        exception_data = request.get_json()
        for key, value in exception_data.items():
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
        user_params = User_Parameters.query.filter_by(user_id=user_id).all()
        return jsonify([param.to_dict() for param in user_params])

    def post(self, user_id):
        data = request.get_json()
        start_date = data.get('start_date', datetime.now())
        end_date = data.get('end_date', None)
        
        new_param = User_Parameters(
            day_of_week=data['day_of_week'],
            start_time=data['start_time'],
            is_start_mandatory=data['is_start_mandatory'],
            end_time=data['end_time'],
            is_end_mandatory=data['is_end_mandatory'],
            is_endpoint=data['is_endpoint'],
            endpoint_address=data.get('endpoint_address'),
            endpoint_city=data.get('endpoint_city'),
            endpoint_state=data.get('endpoint_state'),
            endpoint_zip=data.get('endpoint_zip'),
            is_shortest=data['is_shortest'],
            is_quickest=data['is_quickest'],
            is_highways=data['is_highways'],
            is_tolls=data['is_tolls'],
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        
        db.session.add(new_param)
        db.session.commit()
        return new_param.to_dict(), 201


api.add_resource(UserParameters, '/users/<int:id>/user_parameters')

class UserParameter(Resource):
    def get(self, id, param_id):
        # get a specified user parameter
        param = User_Parameters.query.get_or_404(param_id)
        return param.to_dict()

    def patch(self, id, param_id):
        # update specified user parameter
        param = User_Parameters.query.get_or_404(param_id)
        param_data = request.get_json()
        for key, value in param_data.items():
            setattr(param, key, value)
        db.session.commit()
        return param.to_dict()

    def delete(self, id, param_id):
        # delete user parameter
        param = User_Parameters.query.get_or_404(param_id)
        db.session.delete(param)
        db.session.commit()
        return '', 204

api.add_resource(UserParameter, '/users/<int:id>/user_parameters/<int:param_id>')

class UserNotes(Resource):
    def get(self, id):
        # display all user notes
        user = User.query.get_or_404(id)
        return jsonify([note.to_dict() for note in user.notes])

    def post(self, id):
        # add a user note
        user = User.query.get_or_404(id)
        note_data = request.get_json()
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
        # view all user temp params
        user = User.query.get_or_404(id)
        return jsonify([param.to_dict() for param in user.temp_params])

    def post(self, id):
        # add a user temp param
        user = User.query.get_or_404(id)
        param_data = request.get_json()
        param = User_Temp_Params(user_id=user.id, **param_data)
        db.session.add(param)
        db.session.commit()
        return param.to_dict(), 201

api.add_resource(UserTempParams, '/users/<int:id>/user_temp_params')

class UserTempParam(Resource):
    def get(self, id, param_id):
        # get a specific temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        return param.to_dict()

    def patch(self, id, param_id):
        # update a temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        param_data = request.get_json()
        for key, value in param_data.items():
            setattr(param, key, value)
        db.session.commit()
        return param.to_dict()

    def delete(self, id, param_id):
        # delete a temp param
        param = User_Temp_Params.query.get_or_404(param_id)
        db.session.delete(param)
        db.session.commit()
        return '', 204

api.add_resource(UserTempParam, '/users/<int:id>/user_temp_params/<int:param_id>')








if __name__ == '__main__':
    app.run(port=5555, debug=True)

