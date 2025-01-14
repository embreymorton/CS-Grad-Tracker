# CS-Grad-Tracking

Software Toolsmith project for UNC-CH grad department

This project is assigned as part of the Code Closer/Software toolsmith
Work-Study program at The University of North Carolina at Chapel Hill.

The clients of this project are all staff/administrators that work in Sitterson
Hall as part of graduate program for computer science students.

Elaine Dong, Zain Khan, Shane Flannigan, Takoda Ren, and Sebastian Crowell are the original developers of this project.

Kevin Chen, Lia Abed, and Amin Zamani have also worked on this project in the past.

Most recently Noah Hulse, Jaime Marban, Embrey Morton, and Keon Marcus worked on this project as a part of COMP 523. Some of the things the COMP 523 team worked on are UI improvements, adding new forms, bug fixes, and unit testing.

# Contacts

Jeff Terrell <terrell@cs.unc.edu>

# Context

Current graduate student forms and progress data is all either in paper or in a
system that has limited access (only a few administrators can access it).

We are trying to put student progress, data, and forms (and eventually grades)
in a web app that is accessible by all parties that need access to this
information (the students, faculty, administrators).

Users:

- Students - Can see basic personal data, can submit forms, can see what jobs
  they hold.
- Faculty - Can see all data on students that they advise - including their
  forms.
- Administrators - Can create/edit everything - students, student forms, jobs,
  faculty, courses.

* Web site: csgrad.cs.unc.edu
* Requires UNC campus VPN to access the website.
* Trello board (private) https://trello.com/b/MKj0CumI/grad-tracking

# Documentation

*  [Getting Started](#getting-started)
*  [Environmental Variables](#environmental-variables)
*  [Starting the app](#starting-the-app)
*  [Starting the App with Windows](#starting-the-app-with-windows)
*  [File organization](#file-organization)
*  [Testing](#testing)
*  [Deployment](#deployment)
*  [CI/CD](#cicd)
*  [System overview](#system-overview)

# Getting Started

The deployed version of this code currently runs in a VM on Ubuntu 24.04.
Although the code is largely platform independent and has worked in other
setups, Ubuntu 24.04 is the most recent platform confirmed to work.

The key pieces of infrastructure you will need to set up are:

1. An auth0 account for authentication.  This is needed even for local development
   and testing, although the production deployment will not need your account.
2. Install mongodb and create an administrative user.
3. Install the cs grad tracking app itself.

## Setting up Auth0
We are using Auth0 as an authentication provider.  Even for development and testing,
you will need a free account on auth0.  For production, a different auth0
configuratin is used.

Key Steps:
- Nagivate to `http://manage.auth0.com` and create an account
- Find "Applications" on the sidebar, and click on pre-made default app
- In the Auth0 settings page for your app, setup the appropriate URLS, as a comma separated list on a single line:
  - Allowed callback URLs: `http://localhost:8080/callback`, `http://localhost:8081/callback`,
  `http://csgrad.cs.unc.edu/callback`
  - Allowed web origins: `http://localhost:8080`, `http://localhost:8081`, `http://csgrad.cs.unc.edu`
  - Allowed logout urls: `http://localhost:8080`, `http://localhost:8081`, `http://csgrad.cs.unc.edu`
  - In connections, make sure Username-Password-Authentication and google-oauth2
    are enabled.
- Later, you will need the Domain, Client ID, and Client Secret for this application, so keep this page open.

Be sure to click 'save changes' on the bottom of the page.

## Install the back-end database (mongodb):
Since we are connecting to a mongodb database, download mongodb and follow these instructions:

For windows:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
Follow all default options on the installer, after it is completed, make sure
you have created a directory: `C:\data\db`, then in bash run

    "C:\Program Files\MongoDB\Server\[version]\bin\mongod.exe"

This will need to be running any time you want to start the app.

Note that because we are running "mongod.exe", it is a database running locally
on the computer.

For Ubuntu:

https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/


You may need to manually start the mongod service:
`sudo service mongod start`


## Install npm and nodejs

* On Ubuntu:

`apt-get install npm nodejs`

* On other platforms:

Download NPM and nodejs at: https://nodejs.org/en/
Add npm to your systems PATH after it has finished installing.

## Cloning and configuring the app

```
git clone https://gitlab.com/unc-cs-toolsmiths/CS-Grad-Tracking.git
cd CS-Grad-Tracking
npm install
```

The final step is a one-time setup that install the required libraries.  It should create a `node_modules` folder, but you don't really need to touch it.

### Configure a .env file

You will need to create a file named `.env` in the root directory of the project.
There are several examples in the `envFiles` directory.  For a beginner,
copy `envFiles/.development.nodocker.env` to `.env` and add the following fields, to end up
with a file similar to this one:

```
port=8080
host=127.0.0.1
AUTH0_DOMAIN=<garbled string from auth0>
AUTH0_CLIENT_SECRET=<garbled string from auth0>
AUTH0_CALLBACK_URL=http://localhost:8080/callback
AUTH0_LOGOUT_URL=http://localhost:8080

```

*Never check the .env file into git*

### Adding an Admin Account

For development and testing in a local instance, you will need to make a fake admin account for yourself.

Open the `data/AdminInputScript.txt` file. Edit the email section to have the same email as your auth0 account. Then run `node data/AdminInputScript.txt`.  For some reason this script hangs, but it is ok to Ctrl+C.

## Running

Run the command `npm start` to create a testing instance of the webserver.  At this point, you should be able to connect a web browser on the same system to localhost:8080

When you first start up the app, you may be prompted to create an account under your Auth0 instance. Do so with the email of your choice.


## Testing

1. Run the command `npm run start-ci` to create a testing instance of the webserver.  This will switch the backing database for the application, and your previously created accounts will be unavailable.

At this point, you can still see the application, say at localhost:8080.  However, to change users and test different roles, you will need to navigate to one of 'chageuser/admin', 'chageuser/student', or 'changeuser/faculty'.

2. To run unit tests, in another terminal run either of these commands:
    * `npx cypress open` - for the UI
    * `npm run test` - for command line only

    The UI will let you choose a specific test to run while automatically saving screenshots and recording browser states for you to see where your tests are failing.


# Additional Notes on the .env file

## Environmental Variables

- There are several AUTH0 fields required, detailed in the AUTH0 section.
- There is also gmailUser and gmailPass which are used for email notifications
  through nodemailer.
- These are just credentials for a gmail account setup specifically for this app.
- There are two general .env setups, you will need to tweak the variables
  listed below to get it to run in a certain setup

## Production mode .env tweaks

- `mode=production`
- `databaseString='mongodb://localhost/cs_grad_data-prod'`
- `AUTH0_DOMAIN=dev-v1umz16i.auth0.com`
- `AUTH0_CALLBACK_URL=http://csgrad.cs.unc.edu/callback`
- `AUTH0_LOGOUT_URL=http://csgrad.cs.unc.edu`
- `hostname="csgrad.cs.unc.edu"`

## Development/testing mode .env tweaks

- `mode=production` or `mode=development`
- `databaseString='mongodb://localhost/cs_grad_data-prod'` or
  `databaseString='mongodb://localhost/cs_grad_data-dev'`(used to connect MongoDB Compass)
- `AUTH0_CALLBACK_URL=http://localhost:8080/callback`
- `AUTH0_LOGOUT_URL=http://localhost:8080`

## Using Inheritance for .env

- .env.testing includes mode and databaseString for testing mode
- .env.development includes mode and databaseString for development mode
- in base .env file leave these two variables blank
- any values in .env will override values in other .env files, and you probably
  don't want to override mode or databaseString for both development and testing

## Starting the App with Windows

### Installing Prerequisite Programs

Before starting, please ensure you have installed the following programs on your device:

- [Git](https://git-scm.com/downloads)
  - make sure you add to PATH
- [Node and NPM](https://nodejs.org/en/download/)
  - make sure you add to PATH
- [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
  - follow all default settings

To test out that you installed git and node correctly, try these commands in powershell:

```ps
git --version
node --version
npm --version
```

Before this next step, you should have set up your Auth0 and admin account in your local database. You should also have started running the database using this line:

```ps
& "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
```

(replace version with the version of Mongo you installed; look in the Server folder if you don't recall)

Open the `package.json` file and go down to the "scripts" section. Unfortunately our environment variables don't quite work yet on Windows so you need to manually execute the start script. To do this, run this in powershell:

```ps
$env:NODE_ENV='development'
node bin/www
```

which, as you can see, looks just like the start script in `package.json`.

## File organization

### bin/www

Database connection and entry point to starting the server.

### app.js

Authentication logic and express setup (routes, static resources)

### routes

All routes referenced in app.js are here. For each route (get/post) there is an
associated url and controller function.

Many of the route files contain middleware that checks a user's role before
allowing access.

### controllers

The controllers have the referenced functions from routes and contains primary
code and database logic and also serves the files in the views folder.

### models

The one file, schema.js, in models describes all the database objects in use.
Controllers store and retrieve data from the database as these defined objects.

### views

Contains .ejs files, which are essentially html files with embedded javascript.
Each .ejs file represents a page that a user can see, or a component that is
reused across multiple web pages.

### public

Contains css and image resources.

### data

Currently used only to store test excel files, was used in the past for storing
pdfs/documents for student objects, as mongo does not handle pdfs well.
Contains Input Scripts as .txt files used to register new users in the database.
Use email '+' operator for each account type.
Ex: email+student@gmail.com
email+faculty@gmail.com
email+admin@gmail.com

### Overview

For example, app.js defines a route as
`app.use("/course", require("./routes/course"));`
This is causing routes/course.js to handle all requests for
`csgrad.cs.unc.edu/course*` (`*` being anything after course).
routes/course.js has a route: `router.get("/", course.get)` with `course` being
the exported controllers/CourseController.js file, then whenever a user
navigates to csgrad.cs.unc.edu/course, CourseController.js's function `get`
will handle the request and serve the view file views/course/index.ejs.

## Testing

### Run Locally

1. Configure `.env.testing` similar to your development env.

   By default it should have these values:

   - `port=8080`
   - `mode=testing`
   - `databaseString='mongodb://127.0.0.1/cs_grad_data-test'`

2. Run the command `npm run start-ci` to create a testing instance of the webserver.
3. In another terminal run either of these commands:

   - `npx cypress open` - for the UI
   - `npm run test` - for command line only

   The UI will let you choose a specific test to run while automatically saving screenshots and recording browser states for you to see where your tests are failing.

   ### Unit Testing

   Unit testing is done with Jest on the cs_grad_data-dev database.

   1. Run database with databaseString='mongodb://localhost/cs_grad_data-dev'
   2. In terminal run command: npm run unit-test

# Deployment

Deployed on the virtual machine csgrad.cs.unc.edu

Access the VM at https://vmm.cs.unc.edu, and by asking David Cowhig for access.

## Deploying without Docker

### Clone project

First get access to the gitlab project, then run

`git clone https://gitlab.com/unc-cs-toolsmiths/CS-Grad-Tracking.git`

To get the project on the VM.

### Database

Install mongodb:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Run the mongod service:
`sudo service mongod start`

### Nginx

Follow steps 1-3 here to install nginx:
https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04-quickstart

Follow this to add the port our app is running on locally to nginx:
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

- Start at "Set Up Nginx as a Reverse Proxy Server"
- Set the port as 8080 (as that is the port we are running the app on)

### Processes

I am using a process manager for the deployment, PM2.
`npm install pm2@latest -g`

To enable process restarting, use the command:
`systemctl enable mongod.service`

Commands to start a fresh process that restarts on crash or vm restart.

- `sudo -i`
- `cd ../CS-Grad-Tracking` (CD to wherever the folder containing the project is)
- `pm2 start "npm start"`
- `pm2 startup`

Now the app should be running and should continue to run after restarts or
crashes.

# CI/CD

We are using Gitlab's CI/CD to automatically run tests and deploy to the
virtual machine csgrad.cs.unc.edu

- The file used to cause this is .gitlab-ci.yml
- In order to set up sshing into the virtual machine, I generated a new key
  pair.
- I stored the new private key in Gitlab - Settings - CI/CD - Variables
- I stored the public key on the VM in `~/.ssh/authorized_keys`

# System overview

This nodejs app is in the form of server-rendered html. That is, whenever you
visit a page, submit a form, click a search button, etc. you are making a
request to the server which then processes this request and returns appropriate
html.

## Auth0

When the app is deployed on a UNC-CS virtual machine (csgrad.cs.unc.edu), this
is how we currently have it set up:

- A nodejs express app is running on port 8080
- The mongodb database is running on port 27017
- Nginx is running on the vm which is reverse proxying port 8080 to the world,
  so that anyone can try to access it
- Logins use auth0's google SSO and Username-Password-Authentication.
- If the login is successful, app logic checks the CS credentials against the
  users in the database to authenticate.
- The app is configured as server rendered html, rather than a framework like
  react.

## Setting up the ssh key:

To set up the key to be able to pull / push and deploy
generate a new key and copy the content from the new generated file that has an extention of .pub and past it.
Dont copy the one from the terminal, look for the generated file.
This should get you all set.
