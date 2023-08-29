# DISM/2B/21    BED Assignment 2
By Leonard Soh


A full stack Web Application for SP Air

# To install modules used:
- npm init
- npm install express --save 
- npm install --save mysql
- npm install express multer - save
- npm install --save jsonwebtoken


# Instructions to set up project: 
First, locate the following scripts located at the Databases Folder as shown:
 
 
We then go over to open these scripts in mysql workbench and run in this order: 
1. SP_Air_db_init.sql
2. SP_Air_seed.sql

 
- Execute SP_air_db_init.sql script first by pressing the execute button.
  This will generate the required tables for the SP_Air Database

- Then execute SP_Air_seed.sql next to generate sample data in the Database
 


After executing these scripts, we can now launch our web application together with out backend server.
In this project, I have combined both backend and frontend server for simplicity, thereby only requiring executing server.js to run the whole programme.



# Follow these steps: 

1. Open the BED Assignment folder in integrated terminal

2. Type node .\server.js 

3. ctrl + right click http://localhost:8081 in terminal

 
The web application will be launched in the webserver with the url http://localhost:8081 

With this, we have successfully launched the web application and setup the project. 


# Sample account for testing
- Username: Bruh Man  |  Password: abc123451  |  Role: Customer
- Username: Terry Tan  |  Password: abc123456  |  Role: Admin

