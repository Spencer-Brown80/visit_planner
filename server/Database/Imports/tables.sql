-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    zip VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    push_notifications BOOLEAN NOT NULL,
    geolocation_on BOOLEAN NOT NULL,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL
);

-- Create user_clients table
CREATE TABLE user_clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR,
    last_name VARCHAR NOT NULL,
    address_line_1 VARCHAR NOT NULL,
    address_line_2 VARCHAR,
    city VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    zip VARCHAR NOT NULL,
    phone VARCHAR,
    email VARCHAR,
    geolocation VARCHAR,
    geolocation_distance INTEGER,
    address_notes VARCHAR,
    is_notified BOOLEAN NOT NULL,
    notify_contact BOOLEAN NOT NULL,
    notification_period INTEGER
);

-- Create events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY UNIQUE,
    type INTEGER NOT NULL,
    status INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    is_fixed BOOLEAN NOT NULL,
    priority INTEGER,
    is_recurring BOOLEAN NOT NULL,
    recurrence_rule TEXT,
    notify_client BOOLEAN NOT NULL,
    notes TEXT,
    is_completed BOOLEAN NOT NULL,
    is_endpoint BOOLEAN NOT NULL,
    address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    zip VARCHAR,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    user_client_id INTEGER REFERENCES user_clients(id)
);

-- Create user_notifications table
CREATE TABLE user_notifications (
    id SERIAL PRIMARY KEY UNIQUE,
    type INTEGER NOT NULL,
    reason INTEGER NOT NULL,
    notification_period INTEGER NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id)
);

-- Create user_parameters table
CREATE TABLE user_parameters (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR NOT NULL,
    start_time TIMESTAMP NOT NULL,
    is_start_mandatory BOOLEAN NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_end_mandatory BOOLEAN NOT NULL,
    is_endpoint BOOLEAN NOT NULL,
    endpoint_address VARCHAR,
    endpoint_city VARCHAR,
    endpoint_state VARCHAR,
    endpoint_zip VARCHAR,
    is_shortest BOOLEAN NOT NULL,
    is_quickest BOOLEAN NOT NULL,
    is_highways BOOLEAN NOT NULL,
    is_tolls BOOLEAN NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

-- Create user_temp_params table
CREATE TABLE user_temp_params (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    is_start_mandatory BOOLEAN NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_end_mandatory BOOLEAN NOT NULL,
    is_endpoint BOOLEAN NOT NULL,
    endpoint_address VARCHAR,
    endpoint_city VARCHAR,
    endpoint_state VARCHAR,
    endpoint_zip VARCHAR,
    is_shortest BOOLEAN NOT NULL,
    is_quickest BOOLEAN NOT NULL,
    is_highways BOOLEAN NOT NULL,
    is_tolls BOOLEAN NOT NULL,
    nullify_fixed BOOLEAN NOT NULL,
    nullify_priority BOOLEAN NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

-- Create user_notes table
CREATE TABLE user_notes (
    id SERIAL PRIMARY KEY,
    type INTEGER NOT NULL,
    content TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);

-- Create user_reports table
CREATE TABLE user_reports (
    id SERIAL PRIMARY KEY,
    name INTEGER NOT NULL,
    report_content TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);

-- Create user_client_contacts table
CREATE TABLE user_client_contacts (
    id SERIAL PRIMARY KEY,
    type INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    phone VARCHAR,
    email VARCHAR,
    notes TEXT NOT NULL,
    is_notified BOOLEAN NOT NULL,
    user_client_id INTEGER REFERENCES user_clients(id)
);

-- Create user_client_notes table
CREATE TABLE user_client_notes (
    id SERIAL PRIMARY KEY,
    type INTEGER NOT NULL,
    content TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_client_id INTEGER REFERENCES user_clients(id)
);


--Tables to store individual occurrences of events.   Populated basesd on recurrence table.   

CREATE TABLE event_instances (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    instance_date TIMESTAMP NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL,  -- Duration in minutes
    modified BOOLEAN DEFAULT FALSE,
    UNIQUE(event_id, instance_date)
);


--Store exceptions for specific instances, such as cancellations or rescheduling.   

CREATE TABLE event_exceptions (
    id SERIAL PRIMARY KEY,
    event_instance_id INTEGER REFERENCES event_instances(id),
    exception_date TIMESTAMP,
    new_start_time TIME,
    new_duration INTEGER,  -- Duration in minutes
    cancelled BOOLEAN DEFAULT FALSE
);