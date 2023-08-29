
-- This script is used to generate the respective tables for the SP_Air Database.

create database SP_Air;

use SP_Air;

create table user (
	userid INT NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL UNIQUE,
    email varchar(255) NOT NULL UNIQUE,
    contact INT(8) NOT NULL,
    password varchar(255) NOT NULL,
	role varchar(255) NOT NULL,
    profile_pic_url varchar(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),             
	PRIMARY KEY (userid)
);

CREATE TABLE airport (
    airportid INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(255) NOT NULL,
	coordinate POINT NOT NULL SRID 4326, # spatial data types from https://dev.mysql.com/blog-archive/geographic-indexes-in-innodb/
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (airportid)
);

create table flight (
	flightid INT NOT NULL AUTO_INCREMENT,
    flightCode varchar(255) NOT NULL,
    aircraft varchar(255) NOT NULL,
    originAirport INT NOT NULL,
    destinationAirport INT NOT NULL,
    embarkDate datetime NOT NULL,  
    travelTime varchar(255) NOT NULL,
    price decimal(6,2) NOT NULL,      	-- Means that it only accepts 6 numbers or less after decimal place and 2 decimal place
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  
    primary key (flightid),
    FOREIGN KEY (originAirport) REFERENCES airport(airportid) ON DELETE CASCADE,
    FOREIGN KEY (destinationAirport) REFERENCES airport(airportid) ON DELETE CASCADE
);

create table product_listing (
	productid INT NOT NULL AUTO_INCREMENT,
    fk_flight_id INT NOT NULL UNIQUE,
    image_url varchar(500) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  
    PRIMARY KEY(productid),
	FOREIGN KEY (fk_flight_id) REFERENCES flight(flightid) ON DELETE CASCADE
);

create table promotion (
	promotionid INT NOT NULL AUTO_INCREMENT,
    discount DECIMAL(2) NOT NULL, 
    promotional_period_start datetime NOT NULL, 
    promotional_period_end datetime NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  
    PRIMARY KEY(promotionid)
);

create table flight_reference_promotion ( -- Many to Many relation table between promotion and flight tables
	flight_promotion_id INT NOT NULL AUTO_INCREMENT,
    fk_flight_id INT NOT NULL,
    fk_promotion_id INT NOT NULL,
    PRIMARY KEY (flight_promotion_id),
    FOREIGN KEY (fk_flight_id) REFERENCES flight(flightid) ON DELETE CASCADE,
    FOREIGN KEY (fk_promotion_id) REFERENCES promotion(promotionid) ON DELETE CASCADE
);

create table bookings (
	bookingid INT NOT NULL AUTO_INCREMENT,
	fk_flight_id INT NOT NULL,
    fk_user_id INT NOT NULL,
    fk_promotion_id INT NULL,
    name varchar(100) NOT NULL,
    passport varchar(50) NOT NULL,
    nationality varchar(50) NOT NULL,
    age INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  
    PRIMARY KEY(bookingid),
    FOREIGN KEY (fk_flight_id) REFERENCES flight(flightid) ON DELETE CASCADE,
	FOREIGN KEY (fk_user_id) REFERENCES user(userid) ON DELETE CASCADE,
    FOREIGN KEY (fk_promotion_id) REFERENCES promotion(promotionid) ON DELETE CASCADE
);

create table booking_cart (
	booking_cart_id INT NOT NULL AUTO_INCREMENT,
	fk_flight_id INT NOT NULL,
    fk_user_id INT NOT NULL,
    fk_promotion_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  
    PRIMARY KEY(booking_cart_id),
    FOREIGN KEY (fk_flight_id) REFERENCES flight(flightid) ON DELETE CASCADE,
	FOREIGN KEY (fk_user_id) REFERENCES user(userid) ON DELETE CASCADE,
    FOREIGN KEY (fk_promotion_id) REFERENCES promotion(promotionid) ON DELETE CASCADE
);
