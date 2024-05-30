from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

#Added components: Review for pipfile
from datetime import datetime, time, timedelta
from sqlalchemy import DateTime, func, ForeignKey
from sqlalchemy.orm import validates, relationship
import dateutil.rrule as rrulestr

import re



from config import db


# Custom serialization functions for time and date_time

def serialize_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value

def serialize_time(value):
    if isinstance(value, time):
        return value.isoformat()
    return value






# Models go here!
#Establish User Class
class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    city = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)
    zip = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())
    push_notifications = db.Column(db.Boolean, nullable=False)
    geolocation_on = db.Column(db.Boolean, nullable=False)
    username = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)

    # Relationships
    events = db.relationship("Event", back_populates="user")
    notifications = db.relationship("User_Notification", back_populates="user")
    parameters = db.relationship("User_Parameters", back_populates="user")
    temp_params = db.relationship("User_Temp_Params", back_populates="user")
    notes = db.relationship("User_Notes", back_populates="user")
    reports = db.relationship("User_Reports", back_populates="user")

    # Association proxies
    user_clients = association_proxy("events", "user_client")

    # Serialization rules
    serialize_only = ('id', 'first_name', 'last_name', 'address', 'city', 'state', 'zip', 'phone', 'email', 'date_created', 'push_notifications', 'geolocation_on', 'username', 'password')

    serialize_rules = ("-events", "-notifications.user", "-parameters.user", "-temp_params.user", "-notes.user", "-reports.user")
    
    def to_dict(self):
        user_dict = super().to_dict()
        user_dict['date_created'] = serialize_datetime(self.date_created)
        return user_dict
    
    
    
    

    # Validations
    @validates("first_name", "last_name", "address", "city", "state", "zip", "password")
    def validate_not_empty(self, key, value):
        if not value or value == "":
            raise ValueError(f"{key} cannot be empty")
        return value

    @validates("push_notifications", "geolocation_on")
    def validate_boolean(self, key, value):
        if not isinstance(value, bool):
            raise ValueError("Must be a boolean value")
        return value

    @validates("email")
    def validate_email(self, key, value):
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, value):
            raise ValueError("Invalid email format")

        existing_user = User.query.filter(User.email == value).first()
        if existing_user and existing_user.id != self.id:
            raise ValueError(f"{key.capitalize()} must be unique")


        return value

    @validates("phone")
    def validate_phone(self, key, value):
        phone_regex = r"^\+?1?[-\s(]?\d{3}[-\s)]?\s?\d{3}[-\s]?\d{4}$"
        if not re.match(phone_regex, value):
            raise ValueError("Invalid phone number format")
        return value

    @validates("username")
    def validate_username_unique(self, key, value):
        existing_user = User.query.filter(User.username == value).first()
        if existing_user and existing_user.id != self.id:
            raise ValueError(f"{key.capitalize()} must be unique")


        if not value:
            raise ValueError(f"{key} cannot be empty")

        return value
    
#Establish User_Client Class    
class User_Client(db.Model, SerializerMixin):
    __tablename__ = "user_clients"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=False)        
    address_line_1 = db.Column(db.String, nullable=False)
    address_line_2 = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)
    zip = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    geolocation = db.Column(db.String, nullable=True)
    geolocation_distance = db.Column(db.Integer, nullable=True)
    address_notes = db.Column(db.String, nullable=True)
    is_notified = db.Column(db.Boolean, nullable=False)
    notify_contact = db.Column(db.Boolean, nullable=False)
    notification_period = db.Column(db.Integer, nullable=True)

    # relationships with events
    events = db.relationship("Event", back_populates="user_client")
    

    # relationships with user_client_contacts and user_client_notes
    client_contacts = db.relationship("User_Client_Contacts", back_populates="user_client", cascade="all, delete-orphan")
    client_notes = db.relationship("User_Client_Notes", back_populates="user_client", cascade="all, delete-orphan")

    # association proxies
    users = association_proxy("events", "user")
    
    # serialization rules
    serialize_only = ('id', 'first_name', 'last_name', 'address_line_1', 'address_line_2', 'city', 'state', 'zip', 'phone', 'email', 'geolocation', 'geolocation_distance', 'address_notes', 'is_notified', 'notify_contact', 'notification_period')

    
    serialize_rules = ("-events.user_client", "-client_contacts.user_client", "-client_notes.user_client", "-users")


    # validates that the password isn't empty
    @validates("last_name", "address", "city", "state", "zip")
    def validate_password_not_empty(self, key, value):
        if not value or value == "":
            raise ValueError(f"{key} cannot be empty")
        return value

    # # # validates that the is_notified and notifiy_contact is a boolean value
    @validates("is_notified", "notify_contact")
    def validate_is_admin(self, key, value):
        if not isinstance(value, bool):
            raise ValueError("Must be a boolean value")
        return value

    # # # validates that the users email is valid upon entry
    @validates("email")
    def validate_email(self, key, value):
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, value):
            raise ValueError("Invalid email format")

        existing_user = User.query.filter(User.email == value).first()
        if existing_user:
            raise ValueError(f"{key.capitalize()} must be unique")

        return value

    # # validates that the user's phone number is in the correct format upon entry
    @validates("phone")
    def validate_phone(self, key, value):
        phone_regex = r"^\+?1?[-\s(]?\d{3}[-\s)]?\s?\d{3}[-\s]?\d{4}$"
        if not re.match(phone_regex, value):
            raise ValueError("Invalid phone number format")
        return value
    
    
    
    

#Establish Event Class - Join table between User and User_Client
# Define dictionaries for type and status mapping
EVENT_TYPE_MAP = {
    1: "Client Visit",
    2: "Personal Event",
    3: "Client Unavailable"
}

EVENT_STATUS_MAP = {
    1: "Pending",
    2: "Confirmed",
    3: "Conflict",
    4: "Completed",
    5: "Canceled"
}

# Define Event class
class Event(db.Model, SerializerMixin):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True, unique=True)
    type = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Integer, nullable=False)
    start = db.Column(db.DateTime, nullable=False, index=True)
    end = db.Column(db.DateTime, nullable=False)
    is_fixed = db.Column(db.Boolean, nullable=False)
    priority = db.Column(db.Integer, nullable=True)
    is_recurring = db.Column(db.Boolean, nullable=False)
    recurrence_rule = db.Column(db.Text, nullable=True)
    notify_client = db.Column(db.Boolean, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    is_completed = db.Column(db.Boolean, nullable=False)
    is_endpoint = db.Column(db.Boolean, nullable=False)
    address = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=True)
    state = db.Column(db.String, nullable=True)
    zip = db.Column(db.String, nullable=True)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user_client_id = db.Column(db.Integer, db.ForeignKey("user_clients.id"), nullable=True)
    
    parent_event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=True)
    
    # Relationships
    user = db.relationship("User", back_populates="events")
    user_client = db.relationship("User_Client", back_populates="events")
    notifications = db.relationship("User_Notification", back_populates="event", cascade="all, delete-orphan")
    instances = db.relationship("EventInstance", back_populates="event", cascade="all, delete-orphan")
    parent_event = db.relationship("Event", remote_side=[id], backref="child_events")

    # Serialization rules
    serialize_only = ('id', 'type', 'status', 'start', 'end', 'is_fixed', 'priority', 'is_recurring', 'recurrence_rule', 'notify_client', 'notes', 'is_completed', 'is_endpoint', 'address', 'city', 'state', 'zip', 'date_created', 'user_id', 'user_client_id', 'parent_event_id')
    serialize_rules = ("-user.events", "-instances", "-notifications.event")

    def to_dict(self):
        event_dict = {
            'id': self.id,
            'type': self.type,
            'status': self.status,
            'start': self.start.isoformat(),
            'end': self.end.isoformat(),
            'date_created': self.date_created.isoformat(),
            'is_fixed': self.is_fixed,
            'priority': self.priority,
            'is_recurring': self.is_recurring,
            'recurrence_rule': self.recurrence_rule,
            'notify_client': self.notify_client,
            'notes': self.notes,
            'is_completed': self.is_completed,
            'is_endpoint': self.is_endpoint,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip': self.zip,
            'user_client_id': self.user_client_id,
            'parent_event_id': self.parent_event_id,  # Include parent_event_id in the dictionary
            'client_name': f"{self.user_client.first_name} {self.user_client.last_name}" if self.user_client else "No Client",
        }
        return event_dict



    # Validations
    
    # @validates('start', 'end', 'date_created')
    # def validate_start_time_format(self, key, start_time):
    #     if not isinstance(start_time, datetime):
    #         raise ValueError("Start/End time must be a valid time object")
    #     return start_time

    # @validates('type')
    # def validate_type(self, key, value):
    #     assert value in EVENT_TYPE_MAP, "Invalid event type"
    #     return value

    # @validates('status')
    # def validate_status(self, key, value):
    #     assert value in EVENT_STATUS_MAP, "Invalid event status"
    #     return value

# Define EventInstance class
# Define EventInstance class
class EventInstance(db.Model, SerializerMixin):
    __tablename__ = "event_instances"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    instance_start = db.Column(db.DateTime, nullable=False)
    instance_end = db.Column(db.DateTime, nullable=False)
    modified = db.Column(db.Boolean, default=False)

    # Relationships
    event = db.relationship("Event", back_populates="instances")
    exceptions = db.relationship("EventException", back_populates="event_instance", cascade="all, delete-orphan")

    # Serialization rules
    serialize_only = ('id', 'event_id', 'instance_date', 'start', 'end', 'modified')
    serialize_rules = ("-event.instances", "-exceptions.event_instance")
    
    def to_dict(self):
        instance_dict = super().to_dict()
        instance_dict['instance_start'] = serialize_datetime(self.instance_start)
        instance_dict['instance_end'] = serialize_datetime(self.isntance_end)
        return instance_dict
    
    # Validations
    @validates('instance_start')
    def validate_instance_start(self, key, instance_start):
        if not isinstance(instance_start, datetime):
            raise ValueError("Instance date must be a valid datetime object")
        return instance_start

    @validates('instance_end')
    def validate_instance_start(self, key, instance_end):
        if not isinstance(instance_end, datetime):
            raise ValueError("Instance date must be a valid datetime object")
        return instance_end
    
    
# Define EventException class    
class EventException(db.Model, SerializerMixin):
    __tablename__ = "event_exceptions"

    id = db.Column(db.Integer, primary_key=True)
    event_instance_id = db.Column(db.Integer, db.ForeignKey('event_instances.id'), nullable=False)
    exception_date = db.Column(db.DateTime, nullable=True)
    new_start_time = db.Column(db.Time, nullable=True)
    new_duration = db.Column(db.Integer, nullable=True)
    cancelled = db.Column(db.Boolean, default=False)

    # Relationships
    event_instance = db.relationship("EventInstance", back_populates="exceptions")

    # Serialization rules
    serialize_only = ('id', 'event_instance_id', 'exception_date', 'new_start_time', 'new_duration', 'cancelled')

    serialize_rules = ("-event_instance.exceptions",)
    
    def to_dict(self):
        exception_dict = super().to_dict()
        exception_dict['exception_date'] = serialize_datetime(self.exception_date)
        exception_dict['new_start_time'] = serialize_time(self.new_start_time)
        return exception_dict

    # Validations
    @validates('exception_date')
    def validate_exception_date(self, key, exception_date):
        if exception_date and not isinstance(exception_date, datetime):
            raise ValueError("Exception date must be a valid datetime object")
        return exception_date

    @validates('new_start_time')
    def validate_new_start_time(self, key, new_start_time):
    
        if not isinstance(new_start_time, time):
            raise ValueError("Start time must be a valid time object")
        return new_start_time

    @validates('new_duration')
    def validate_new_duration(self, key, new_duration):
        if new_duration and (not isinstance(new_duration, int) or new_duration <= 0):
            raise ValueError("New duration must be a positive integer")
        return new_duration

    


#Establish User_Notifications Class.   Has a one to many relationship with Users.  
#Also needs to use the Event_id

# Define a dictionary mapping integer values to string representations for type and reason
NOTIFICATION_TYPE_MAP = {
    1: "Text",
    2: "Email",
    3: "Both"
}

NOTIFICATION_REASON_MAP = {
    1: "Schedule Conflict",
    2: "Schedule Change"
}

# Define User_Notification class   

class User_Notification(db.Model, SerializerMixin):
    __tablename__ = "user_notifications"

    id = db.Column(db.Integer, primary_key=True, unique=True)
    type = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Integer, nullable=False)
    notification_period = db.Column(db.Integer, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())
    
    # One-to-many relationship with Users
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship("User", back_populates="notifications")

    # Event_id
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    event = db.relationship("Event")
    
    # Serialization rules
    serialize_only = ('id', 'type', 'reason', 'notification_period', 'date_created', 'event_id')

    serialize_rules = ("-user.notifications", "-event.notifications")
    
    def to_dict(self):
        user_notification_dict = super().to_dict()
        user_notification_dict['date_created'] = serialize_datetime(self.date_created)
        return user_notification_dict

    
    
    #Type Validation    
    @validates('type')
    def validate_type(self, key, value):
        assert value in NOTIFICATION_TYPE_MAP, "Invalid event type"
        return value
    
    #Status Validation
    @validates('reason')
    def validate_status(self, key, value):
        assert value in NOTIFICATION_REASON_MAP, "Invalid event reason"
        return value
    
    
#Establish User_Parameters Class.   Has a one to many relationship with Users.  
    
    
class User_Parameters(db.Model, SerializerMixin):
    __tablename__ = "user_parameters"

    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.String, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    is_start_mandatory = db.Column(db.Boolean, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_end_mandatory = db.Column(db.Boolean, nullable=False)
    is_endpoint = db.Column(db.Boolean, nullable=False)
    endpoint_address = db.Column(db.String, nullable=True)
    endpoint_city = db.Column(db.String, nullable=True)
    endpoint_state = db.Column(db.String, nullable=True)
    endpoint_zip = db.Column(db.String, nullable=True)
    is_shortest = db.Column(db.Boolean, nullable=False)
    is_quickest = db.Column(db.Boolean, nullable=False)
    is_highways = db.Column(db.Boolean, nullable=False)
    is_tolls = db.Column(db.Boolean, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False, default=func.now())
    end_date = db.Column(db.DateTime, nullable=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    
    user = db.relationship("User", back_populates="parameters")
    
    # Serialization rules
    serialize_only = ('id', 'day_of_week', 'start_time', 'is_start_mandatory', 'end_time', 'is_end_mandatory', 'is_endpoint', 'endpoint_address', 'endpoint_city', 'endpoint_state', 'endpoint_zip', 'is_shortest', 'is_quickest', 'is_highways', 'is_tolls', 'start_date', 'end_date')
    serialize_rules = ("-user.parameters",)

    def to_dict(self):
        params_dict = super().to_dict()
        params_dict['start_time'] = serialize_time(self.start_time)
        params_dict['end_time'] = serialize_time(self.end_time)
        params_dict['start_date'] = serialize_datetime(self.start_date)
        params_dict['end_date'] = serialize_datetime(self.end_date) if self.end_date else None
        return params_dict


    # Validations
    @validates('day_of_week')
    def validate_day_of_week(self, key, value):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        if value not in valid_days:
            raise ValueError("Invalid day of the week")
        return value

    @validates('start_time', 'end_time')
    def validate_datetime(self, key, value):
        if not isinstance(value, time):
            raise ValueError(f"{key.capitalize()} must be a valid datetime object")
        return value

    @validates('is_start_mandatory', 'is_end_mandatory', 'is_endpoint', 'is_shortest', 'is_quickest', 'is_highways', 'is_tolls')
    def validate_boolean(self, key, value):
        if not isinstance(value, bool):
            raise ValueError(f"{key.capitalize()} must be a boolean value")
        return value
    
    
#Establish User_Temp_Params Class.   Has a one to many relationship with Users.  
    

class User_Temp_Params(db.Model, SerializerMixin):
    __tablename__ = "user_temp_params"

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    is_start_mandatory = db.Column(db.Boolean, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_end_mandatory = db.Column(db.Boolean, nullable=False)
    is_endpoint = db.Column(db.Boolean, nullable=False)
    endpoint_address = db.Column(db.String, nullable=True)
    endpoint_city = db.Column(db.String, nullable=True)
    endpoint_state = db.Column(db.String, nullable=True)
    endpoint_zip = db.Column(db.String, nullable=True)
    is_shortest = db.Column(db.Boolean, nullable=False)
    is_quickest = db.Column(db.Boolean, nullable=False)
    is_highways = db.Column(db.Boolean, nullable=False)
    is_tolls = db.Column(db.Boolean, nullable=False)
    nullify_fixed = db.Column(db.Boolean, nullable=False)
    nullify_priority = db.Column(db.Boolean, nullable=False)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship("User", back_populates="temp_params")
    
    #serialixze rules
    serialize_only = ('id', 'date', 'start_time', 'is_start_mandatory', 'end_time', 'is_end_mandatory', 'is_endpoint', 'endpoint_address', 'endpoint_city', 'endpoint_state', 'endpoint_zip', 'is_shortest', 'is_quickest', 'is_highways', 'is_tolls', 'nullify_fixed', 'nullify_priority')

    serialize_rules = ("-user.temp_params",)
    
    def to_dict(self):
        temp_params_dict = super().to_dict()
        temp_params_dict['date'] = serialize_datetime(self.date)
        temp_params_dict['start_time'] = serialize_time(self.start_time)
        temp_params_dict['end_time'] = serialize_time(self.end_time)
        
        return temp_params_dict

    
    # Validations
    @validates('start_time', 'end_time')
    def validate_time(self, key, value):
        if not isinstance(value, time):
            raise ValueError(f"{key.capitalize()} must be a valid datetime object")
        return value
    
    @validates('date')
    def validate_datetime(self, key, value):
        if not isinstance(value, datetime):
            raise ValueError(f"{key.capitalize()} must be a valid datetime object")
        return value

    @validates('is_start_mandatory', 'is_end_mandatory', 'is_endpoint', 'is_shortest', 'is_quickest', 'is_highways', 'is_tolls', 'nullify_fixed', 'nullify_priority')
    def validate_boolean(self, key, value):
        if not isinstance(value, bool):
            raise ValueError(f"{key.capitalize()} must be a boolean value")
        return value
    
    
    
#Establish User_Notes Class.   Has a one to many relationship with Users.  


USER_NOTE_TYPE_MAP = {
    1: "General",
    2: "Schedule",
    3: "Clients"
}

class User_Notes(db.Model, SerializerMixin):
    __tablename__ = "user_notes"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Integer, nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship("User", back_populates="notes")
    
    # Serialization rules
    serialize_only = ('id', 'type', 'content', 'date_created', 'user_id')

    serialize_rules = ("-user.notes",)
    
    def to_dict(self):
        user_notes_dict = super().to_dict()
        user_notes_dict['date_created'] = serialize_datetime(self.date_created)
        return user_notes_dict

    # Validations
    @validates('type')
    def validate_type(self, key, value):
        if value not in USER_NOTE_TYPE_MAP:
            raise ValueError("Invalid note type")
        return value

    @validates('content')
    def validate_content(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Content cannot be empty")
        return value

    
    
#Establish User_Reports Class.   Has a one to many relationship with Users.  

    
REPORT_NAME_MAP = {
    1: "Visits by Date",
    2: "Mileage",
    3: "Print Calendar"
}    


class User_Reports(db.Model, SerializerMixin):
    __tablename__ = "user_reports"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Integer, nullable=False)

    report_content = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship("User", back_populates="reports")
    
    # Serialization rules  
    serialize_only = ('id', 'name', 'report_content', 'date_created', 'user_id')

    serialize_rules = ("-user.reports",)
    
    def to_dict(self):
        user_reports_dict = super().to_dict()
        user_reports_dict['date_created'] = serialize_datetime(self.date_created)
        return user_reports_dict

    # Validations
    @validates('name')
    def validate_name(self, key, value):
        if value not in REPORT_NAME_MAP:
            raise ValueError("Invalid report name")
        return value

    @validates('report_content')
    def validate_report_content(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Report content cannot be empty")
        return value



    
#Establish User_Client_Contacts Class.   Has a one to many relationship with User Cients.  

    
CONTACT_TYPE_MAP = {
    1: "POA",
    2: "Family",
    3: "Friend",
    4: "Medical"
}



class User_Client_Contacts(db.Model, SerializerMixin):
    __tablename__ = "user_client_contacts"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_notified = db.Column(db.Boolean, nullable=True)

    
    user_client_id = db.Column(db.Integer, db.ForeignKey('user_clients.id'), nullable=False)
    
    user_client = db.relationship("User_Client", back_populates="client_contacts")
    
# Serialization rules
    serialize_only = ("id", "type", "name", "phone", "email", "notes", "is_notified", "user_client_id")
    serialize_rules = ("-user_client.client_contacts", "-user_client.client_notes")

    # Validations
    @validates('type')
    def validate_type(self, key, value):
        if value not in CONTACT_TYPE_MAP:
            raise ValueError("Invalid contact type")
        return value

    @validates('name')
    def validate_name(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Name cannot be empty")
        return value

    @validates('phone')
    def validate_phone(self, key, value):
        if value:
            phone_regex = r"^\+?1?[-\s(]?\d{3}[-\s)]?\s?\d{3}[-\s]?\d{4}$"
            if not re.match(phone_regex, value):
                raise ValueError("Invalid phone number format")
        return value

    @validates('email')
    def validate_email(self, key, value):
        if value:
            email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
            if not re.match(email_regex, value):
                raise ValueError("Invalid email format")
        return value

    

    
    
#Establish User_Client_Notes Class.   Has a one to many relationship with User Clients.  
    

CLIENT_NOTE_TYPE_MAP = {
    1: "General",
    2: "Schedule"
}


class User_Client_Notes(db.Model, SerializerMixin):
    __tablename__ = "user_client_notes"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=func.now())

    user_client_id = db.Column(db.Integer, db.ForeignKey('user_clients.id'), nullable=False)
    
    user_client = db.relationship("User_Client", back_populates="client_notes")

# Serialization rules
    
    serialize_only = ('id', 'type', 'content', 'date_created', 'user_client_id')

    serialize_rules = ("-user_client.client_contacts", "-user_client.client_notes")

    
    def to_dict(self):
        client_notes_dict = super().to_dict()
        client_notes_dict['date_created'] = serialize_datetime(self.date_created)
        return client_notes_dict

    

    @validates('content')
    def validate_content(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Content cannot be empty")
        return value