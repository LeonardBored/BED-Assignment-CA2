
-- This script is used to generate sample data into the database

use SP_Air;

insert into user 
(username,email,contact,password,role,profile_pic_url)
values 
('Terry Tan','terry@gmail.com','91234567','abc123456','Admin','http://localhost:8081/public/profile_pic/user_1.jpg');

insert into user 
(username,email,contact,password,role,profile_pic_url)
values 
('Lodd Tan','lodd@gmail.com','91231111','abc223456','Customer','http://localhost:8081/public/profile_pic/user_2.jpg');

insert into user 
(username,email,contact,password,role,profile_pic_url)
values 
('Bruh man','bruh@gmail.com','91222267','abc123451','Customer','http://localhost:8081/public/profile_pic/user_3.jpg');


insert into airport
(name,country,coordinate,description)
values 
('Changi Airport','Singapore', ST_GeomFromText('POINT(1.3644 103.9915)', 4326) ,'Main International Airport of Singapore');

insert into airport
(name,country,coordinate,description)
values 
('Senai International Airport','Malaysia', ST_GeomFromText('POINT(1.6389 103.6681)', 4326), 'International airport of Malaysia serving Johor Bahru');

insert into airport
(name,country,coordinate,description)
values 
('Narita Airport','Japan', ST_GeomFromText('POINT(35.7720 140.3929)', 4326), 'One of two international airports serving the Greater Tokyo Area');

insert into airport
(name,country,coordinate,description)
values 
('San Francisco Airport','USA', ST_GeomFromText('POINT(37.6213 -122.379)',4326), 'International airport in San Mateo County');

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,2,'2023-12-22 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,2,'2022-12-27 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,4,'2022-12-27 08:20','6 hours 50 mins',955.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,4,'2022-12-27 08:20','6 hours 50 mins',555.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,4,'2022-12-27 08:20','6 hours 50 mins',955.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',1,3,'2022-12-27 08:20','6 hours 50 mins',555.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',3,2,'2022-12-26 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',3,2,'2022-12-29 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',3,2,'2022-12-27 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',4,2,'2022-12-29 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',3,2,'2023-12-29 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',2,1,'2020-1-1 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',4,1,'2023-5-1 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',2,4,'2023-1-1 08:20','10 hours 50 mins',855.50);


insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',4,1,'2020-12-31 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',3,2,'2022-1-5 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',4,2,'2022-12-29 08:20','6 hours 50 mins',855.50);


insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 737',3,2,'2022-12-27 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 747',1,2,'2022-12-21 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP110','BOEING 757',3,2,'2022-12-22 08:20','10 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP230','BOEING 787',2,3,'2022-12-20 08:20','6 hours 50 mins',955.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP120','BOEING 787',1,3,'2022-12-19 08:20','6 hours 50 mins',1055.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP109','BOEING 710',3,2,'2022-12-15 08:20','6 hours 50 mins',655.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP109','BOEING 720',3,2,'2022-12-25 08:20','6 hours 50 mins',855.50);

insert into flight
(flightCode,aircraft,originAirport,destinationAirport,embarkDate,travelTime,price)
values 
('SP129','BOEING 711',4,2,'2022-12-22 08:20','10 hours 50 mins',855.50);

insert into sp_air.bookings
(fk_flight_id,fk_user_id,fk_promotion_id,name,passport,nationality,age)
values 
(1,1,null,'John Tans','S1234555Z','Singaporean',21);

insert into sp_air.bookings
(fk_flight_id,fk_user_id,fk_promotion_id,name,passport,nationality,age)
values 
(2,3,null,'Jenny Tan','E1222555Z','Singaporean',50);

insert into sp_air.bookings
(fk_flight_id,fk_user_id,fk_promotion_id,name,passport,nationality,age)
values 
(1,2,null,'John','E1234455Z','Singaporean',30);

insert into product_Listing
(fk_flight_id, image_url)
values 
(1,'http://localhost:8081/public/product_pic/flight_1.jpg');

insert into product_Listing
(fk_flight_id, image_url)
values 
(2,'http://localhost:8081/public/product_pic/flight_2.jpg');

insert into product_Listing
(fk_flight_id, image_url)
values 
(3,'http://localhost:8081/public/product_pic/flight_3.jpg');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('20','2022-5-22 08:20','2022-6-22 08:20');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('25','2022-7-22 08:20','2022-8-22 08:20');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('15','2022-2-22 08:20','2022-8-22 08:20');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('30','2022-6-22 08:20','2022-7-22 08:20');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('30','2022-6-22 08:20','2023-12-22 08:25');

insert into promotion 
(discount, promotional_period_start, promotional_period_end)
values
('30','2024-6-22 08:20','2024-12-22 08:25');

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(2,4);

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(2,2);

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(3,1);

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(2,1);

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(6,1);

insert into flight_reference_promotion
(fk_flight_id,fk_promotion_id)
values
(2,3);

insert into booking_cart 
(fk_flight_id,fk_user_id,fk_promotion_id)
VALUES
(1,1,null)
