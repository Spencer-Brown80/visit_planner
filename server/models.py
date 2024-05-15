from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

#Added components: Review for pipfile
from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import validates
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
    date_created = db.Column(DateTime, nullable=False, default=datetime.utcnow)
    push_notifications = db.Column(db.Boolean, nullable=False)
    geolocation_on = db.Column(db.Boolean, nullable=False)
    username = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)

    # relationships with events
    events = db.relationship("Event", back_populates="user")
    

    # association proxies
    user_clients = association_proxy("events", "user_client")
    

    # serialization rules
    serialize_rules = ("-events", )

    # validates that the password isn't empty
    @validates("first_name", "last_name", "address", "city", "state", "zip", "password")
    def validate_password_not_empty(self, key, value):
        if not value or value == "":
            raise ValueError(f"{key} cannot be empty")
        return value

    # # # validates that the push_notifications and geolocation_on is a boolean value
    @validates("push_notifications", "geolocation_on")
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

    # # validates that the user's username and email are both unique
    @validates("username")
    def validate_username_unique(self, key, value):
        existing_user = User.query.filter(User.username == value).first()
        if existing_user:
            raise ValueError(f"{key.capitalize()} must be unique")

        if not value:
            raise ValueError(f"{key} cannot be empty")

        return value
    
    
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
    

