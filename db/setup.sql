-- setup.sql

-- Create database called invoicify
CREATE DATABASE invoicify;

-- Change database to invoicify
USE invoicify;

-- Create table for user accounts
CREATE TABLE user (
    fname varchar(255), -- First name
    lname varchar(255), -- Last Name
    email varchar(255), 
    hashedpass varchar(255),
    user_id int(255) NOT NULL,
    company_id int
);

-- Create table for company data
CREATE TABLE company (
    company_name varchar(255),
    company_id int NOT NULL,
    logo_url varchar(255),
    mailing_address varchar(255),
    phone_number varchar(255)
);

-- Create table for company team members
CREATE TABLE company_staff (
    company_id int,
    user_id int(255),
    username varchar(255),
    hashedpass varchar(255)
);

-- Create table for invoices
CREATE TABLE invoice (
    invoice_id int NOT NULL,
    invoice_title varchar(255),
    created_by_company int,
    date_created varchar(255),
    due_date varchar(255),
    client_id int NOT NULL,
    paid boolean
);

-- Create table for services offered in invoice
CREATE TABLE service (
    invoice_id int,
    service_type varchar(255),
    cost float,
    service_date varchar(255)
);

-- Create table for company statistics
CREATE TABLE account_statistics (
    company_id int,
    number_of_invoices int,
    total_sales float,
    total_clients int
);

-- Create table for all clients data
CREATE TABLE client (
    client_id int NOT NULL UNIQUE,
    invoice_id int,
    created_by_company_id int,
    fname varchar(255), -- Client first name
    lname varchar(255), -- Client last name
    company_name varchar(255),
    mailing_address varchar(255),
    phone_number varchar(255)
);

-- Create table for hash algorithm
CREATE TABLE hash_key (
    hash_algo varchar(255)
);