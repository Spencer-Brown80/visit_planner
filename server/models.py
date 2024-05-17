from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

#Added components: Review for pipfile
from datetime import datetime
from sqlalchemy import DateTime, func, ForeignKey
from sqlalchemy.orm import validates, relationship
import re



from config import db

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
    date_created = db.Column(DateTime, nullable=False, default=func.now())
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
    serialize_rules = ("-events", )

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
        if existing_user:
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
        if existing_user:
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
    

    # association proxies
    users = association_proxy("events", "user")
    

    # serialization rules
    serialize_rules = ("-events", )

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
    date = db.Column(DateTime, nullable=False)
    start_time = db.Column(DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
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
    date_created = db.Column(DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user_client_id = db.Column(db.Integer, db.ForeignKey("user_clients.id"), nullable=True)

    # Relationships
    user = db.relationship("User", back_populates="events")
    user_client = db.relationship("User_Client", back_populates="events")
    notifications = relationship("User_Notification", back_populates="event")
    instances = db.relationship("EventInstance", back_populates="event", cascade="all, delete-orphan")

    # Serialization rules
    serialize_rules = ("-user.events", "-user_client.events", "-instances", "-exceptions")

    # Validations
    @validates('date')
    def validate_date(self, key, date):
        if not isinstance(date, datetime):
            raise ValueError("Date must be a valid datetime object")
        return date

    @validates('start_time')
    def validate_start_time_format(self, key, start_time):
        try:
            datetime_str = f"{self.date.strftime('%Y-%m-%d')} {start_time.strftime('%I:%M %p')}"
            datetime.strptime(datetime_str, '%Y-%m-%d %I:%M %p')
            return start_time
        except ValueError:
            raise ValueError("Start time must be in correct datetime format")

    @validates('type')
    def validate_type(self, key, value):
        assert value in EVENT_TYPE_MAP, "Invalid event type"
        return value

    @validates('status')
    def validate_status(self, key, value):
        assert value in EVENT_STATUS_MAP, "Invalid event status"
        return value

# Define EventInstance class
class EventInstance(db.Model, SerializerMixin):
    __tablename__ = "event_instances"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    instance_date = db.Column(DateTime, nullable=False)
    start_time = db.Column(DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    modified = db.Column(db.Boolean, default=False)

    # Relationships
    event = db.relationship("Event", back_populates="instances")
    exceptions = db.relationship("EventException", back_populates="event_instance", cascade="all, delete-orphan")

    # Serialization rules
    serialize_rules = ("-event.instances", "-exceptions.event_instance")

    # Validations
    @validates('instance_date')
    def validate_instance_date(self, key, instance_date):
        if not isinstance(instance_date, datetime):
            raise ValueError("Instance date must be a valid datetime object")
        return instance_date

    @validates('start_time')
    def validate_start_time(self, key, start_time):
        try:
            datetime.strptime(start_time, '%H:%M:%S')
            return start_time
        except ValueError:
            raise ValueError("Start time must be in correct time format")

    @validates('duration')
    def validate_duration(self, key, duration):
        if not isinstance(duration, int) or duration <= 0:
            raise ValueError("Duration must be a positive integer")
        return duration

# Define EventException class
class EventException(db.Model, SerializerMixin):
    __tablename__ = "event_exceptions"

    id = db.Column(db.Integer, primary_key=True)
    event_instance_id = db.Column(db.Integer, db.ForeignKey('event_instances.id'), nullable=False)
    exception_date = db.Column(DateTime, nullable=True)
    new_start_time = db.Column(DateTime, nullable=True)
    new_duration = db.Column(db.Integer, nullable=True)
    cancelled = db.Column(db.Boolean, default=False)

    # Relationships
    event_instance = db.relationship("EventInstance", back_populates="exceptions")

    # Serialization rules
    serialize_rules = ("-event_instance.exceptions",)

    # Validations
    @validates('exception_date')
    def validate_exception_date(self, key, exception_date):
        if exception_date and not isinstance(exception_date, datetime):
            raise ValueError("Exception date must be a valid datetime object")
        return exception_date

    @validates('new_start_time')
    def validate_new_start_time(self, key, new_start_time):
        if new_start_time:
            try:
                datetime.strptime(new_start_time, '%H:%M:%S')
                return new_start_time
            except ValueError:
                raise ValueError("New start time must be in correct time format")
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

class User_Notification(db.Model, SerializerMixin):
    __tablename__ = "user_notifications"

    id = db.Column(db.Integer, primary_key=True, unique=True)
    type = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Integer, nullable=False)
    notification_period = db.Column(db.Integer, nullable=False)
    date_created = db.Column(DateTime, nullable=False, default=func.now())
    
    # One-to-many relationship with Users
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="notifications")

    # Event_id
    event_id = db.Column(db.Integer, ForeignKey('events.id'), nullable=False)
    event = relationship("Event")
    
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
    start_time = db.Column(DateTime, nullable=False)
    is_start_mandatory = db.Column(db.Boolean, nullable=False)
    end_time = db.Column(DateTime, nullable=False)
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
    start_date = db.Column(DateTime, nullable=False, default=func.now())
    end_date = db.Column(DateTime, nullable=True)
    
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    
    
    user = relationship("User", back_populates="parameters")
    
    # Serialization rules
    serialize_rules = ("-user",)

    # Validations
    @validates('day_of_week')
    def validate_day_of_week(self, key, value):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        if value not in valid_days:
            raise ValueError("Invalid day of the week")
        return value

    @validates('start_time', 'end_time')
    def validate_datetime(self, key, value):
        if not isinstance(value, datetime):
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
    date = db.Column(DateTime, nullable=False)
    start_time = db.Column(DateTime, nullable=False)
    is_start_mandatory = db.Column(db.Boolean, nullable=False)
    end_time = db.Column(DateTime, nullable=False)
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
    
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    
    user = relationship("User", back_populates="temp_params")
    
    # Validations
    @validates('date', 'start_time', 'end_time')
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
    date_created = db.Column(DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    
    user = relationship("User", back_populates="notes")
    
    # Serialization rules
    serialize_rules = ("-user",)

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
    date_created = db.Column(DateTime, nullable=False, default=func.now())

    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    
    user = relationship("User", back_populates="reports")
    
    # Serialization rules
    serialize_rules = ("-user",)

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
    phone = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    notes = db.Column(db.Text, nullable=False)
    is_notified = db.Column(db.Boolean, nullable=False)

    
    user_client_id = db.Column(db.Integer, ForeignKey('user_clients.id'), nullable=False)
    
    user_client = relationship("User_Client", back_populates="client_contacts")
    
# Serialization rules
    serialize_rules = ("-user_client",)

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

    @validates('notes')
    def validate_notes(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Notes cannot be empty")
        return value

    @validates('is_notified')
    def validate_is_notified(self, key, value):
        if not isinstance(value, bool):
            raise ValueError("Must be a boolean value")
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
    date_created = db.Column(DateTime, nullable=False, default=func.now())

    user_client_id = db.Column(db.Integer, ForeignKey('user_clients.id'), nullable=False)
    
    user_client = relationship("User_Client", back_populates="client_notes")

# Serialization rules
    serialize_rules = ("-user_client",)

    # Validations
    @validates('type')
    def validate_type(self, key, value):
        if value not in CLIENT_NOTE_TYPE_MAP:
            raise ValueError("Invalid note type")
        return value

    @validates('content')
    def validate_content(self, key, value):
        if not value or value.strip() == "":
            raise ValueError("Content cannot be empty")
        return value