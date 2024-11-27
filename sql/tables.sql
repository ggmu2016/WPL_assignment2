CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Date_of_birth DATE NOT NULL,
    Gender VARCHAR(10),
    Phone_number VARCHAR(15) UNIQUE NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE flights (
    flight_id INTEGER PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    available_seats INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE passenger (
    SSN CHAR(9) PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Date_of_birth DATE NOT NULL,
    Category VARCHAR(10) CHECK (Category IN ('adults', 'children', 'infants')) NOT NULL
);

CREATE TABLE flight_booking (
    flight_booking_id SERIAL PRIMARY KEY,
    flight_id INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
);

CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    flight_booking_id INTEGER NOT NULL,
    SSN CHAR(9) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (flight_booking_id) REFERENCES flight_booking(flight_booking_id),
    FOREIGN KEY (SSN) REFERENCES passenger(SSN)
);

CREATE TABLE hotel (
    hotel_id INTEGER PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL
);

CREATE TABLE guests (
    SSN CHAR(9) PRIMARY KEY,
    hotel_booking_id INTEGER NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Date_of_birth DATE NOT NULL,
    Category VARCHAR(10) CHECK (Category IN ('adults', 'children', 'infants')) NOT NULL,
    FOREIGN KEY (hotel_booking_id) REFERENCES hotel(hotel_id)
);

CREATE TABLE hotel_booking (
    hotel_booking_id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_rooms INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
);


