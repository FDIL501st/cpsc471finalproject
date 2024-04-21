### Note
This is a re-upload of source code, without the original git history as the original repo is owned by another group member who set the repo to private.
The other 2 people who worked on this are:
- [Sandip](https://github.com/sandipm02)
- [Sam](https://github.com/SamWOW99)

# Invoicfy

This is a web app for businesses to create invoices that can be viewed by clients without clients needing to make an account. This is done by making invoices accessible via a URL.

#### Not implemented
 - Actual billing
 - Sending emails to clients upon invoice creation

## How to run
There are 2 parts to this, the server and the client.
Both are assumed to be hosted on the same localhost, the server is hosted on port 3000.

The machine running these also need the MySQL db setup as well.
##### Setting up the MySQL db
db/setup.sql is provided to create the invoicify database.


### 1. run the server

#### Before running the server
You need to put in the correct information to connect to the MySQL database in
server/config.json.

This means putting in the correct username and password used to connect to the database in user_config and password_config.

Not doing this correctly will make the server unable to properly run.

#### Running the server 
```bash
cd server
node index.js
```

### 2. run the client
Now open the project in another terminal. You need to do this as the terminal you used to run the server is no longer available for commands.

#### Running the server 
```bash
cd client
npm run build
npm run start
```

## Invoicify Usage
The first page you go to will be blank. We did not create a home page for path "/".
The first actual page is "/login".
