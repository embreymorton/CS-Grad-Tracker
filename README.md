# CS-Grad-Tracking

Software Toolsmith project for UNC-CH grad department

This project is assigned as part of the Code Closer/Software toolsmith
Work-Study program at The University of North Carolina at Chapel Hill.

The clients of this project are all staff/administrators that work in Sitterson
Hall as part of graduate program for computer science students.

Kevin Chen, Elaine Dong, and Zain Khan are the students currently working on this
project.

In the past, Shane Flannigan, Takoda Ren, and Sebastian Crowell worked on this project.

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

*  [Environmental Variables](#environmental-variables)
*  [Starting the app](#starting-the-app)
*  [Starting the App with Windows](#starting-the-app-with-windows)
*  [File organization](#file-organization)
*  [Testing](#testing)
*  [Deployment](#deployment)
*  [CI/CD](#cicd)
*  [System overview](#system-overview)

# Important note
- MAKE SURE to acquire a copy of a .env file from someone who has worked
  previously on the project
- Never check this into source control/git

# Environmental Variables
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
  `databaseString='mongodb://localhost/cs_grad_data-dev'`
- `AUTH0_CALLBACK_URL=http://localhost:8080/callback`
- `AUTH0_LOGOUT_URL=http://localhost:8080`

## Using Inheritance for .env
- .env.testing includes mode and databaseString for testing mode
- .env.development includes mode and databaseString for development mode
- in base .env file leave these two variables blank
- any values in .env will override values in other .env files, and you probably
  don't want to override mode or databaseString for both development and testing

## Starting the app

### Running the database
First, since we are connecting to a mongodb database, download mongodb at

For windows:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
Follow all default options on the installer, after it is completed, make sure
you have created a directory: `C:\data\db`, then in bash run

    "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe"

This will need to be running any time you want to start the app.

For Ubuntu:

https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Note that because we are running "mongod.exe", it is a database running locally
on the computer.

### Cloning and starting the app.

If you do not have npm:

Download NPM and nodejs at: https://nodejs.org/en/
Add npm to your systems PATH after it has finished installing.

Cloning and setting up the app:

```
git clone https://gitlab.com/unc-cs-toolsmiths/CS-Grad-Tracking.git
cd CS-Grad-Tracking
npm install
```

Select your desired environmental values from the appropriate file in envFiles,
and add it to a .env file in the root directory (CS-Grad-Tracking)

Now to start the app run the command:

`npm start`

## Starting the App with Windows
### Installing Prerequisite Programs

Before starting, please ensure you have installed the following programs on your device:

* [Git](https://git-scm.com/downloads)
  * make sure you add to PATH
* [Node and NPM](https://nodejs.org/en/download/)
  * make sure you add to PATH
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
  * follow all default settings

To test out that you installed git and node correctly, try these commands in powershell:
```ps
git --version
node --version
npm --version
```

### Pulling Code and Installing Dependencies

Once you are invited into the GitLab repository, click the blue "Clone" button and copy the link using your preference of SSH or HTTPS. Open powershell and cd into a folder of your choice for code. Run `git clone <copied-link>` and cd into the created folder. 

Install all the dependencies for the app by running `npm install`. It should create a `node_modules` folder, but you don't really need to touch it.

### Adding an Admin Account
Open the `data/AdminInputScript.txt` file. Edit the email section to have your email. Then run `node data/AdminInputScript.txt`.

Sign into your Auth0 instance with the same email address you used in `data/AdminInputScript.txt` so that the app will recognize you as an admin user.

When you first start up the app, you may be prompted to create an account under your Auth0 instance. Do so with the email of your choice.

### Starting the App
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

### Basics

- Configure the .env to have mode as testing and the database as ...-test
- Run the command `npm run ci` to run the command inline.
- To run the tests in a visible browser and not just in command line:
- As in the first point, configure .env, then `npm run start-ci` to start the
  server
- To start cypress: `npx cypress open`
- A cypress test window should appear (on mac and windows--not sure about
  linux)
- Run whichever tests are desired


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
- `cd ../CS-Grad-Tracking`   (CD to wherever the folder containing the project is)
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
We are using Auth0, this is the process we used to configure it and is what you
should use should you ever hook up your own auth0 account.

Setting up Auth0 
- Nagivate to `http://manage.auth0.com` and create an account
- Find "Applications" on the sidebar, and click on pre-made default app
- Under setting, add "http://localost:8081/callback" or "http://localost:8080/callback" under Allowed Callback URLs and "http://localhost:8081" or "http://localost:8080" under Allowed Logout URLS and click save changes on the bottom.


- In .env, update `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_SECRET` to
  your values (look at Auth0 docs for where to find these)
- In the Auth0 settings page for your app, setup the appropriate URLS
- Allowed callback URLs: `http://localhost:8080/callback`,
  `http://csgrad.cs.unc.edu/callback`
- Allowed web origins: `http://localhost:8080`, `http://csgrad.cs.unc.edu`
- Allowed logout urls: `http://localhost:8080`, `http://csgrad.cs.unc.edu`
- In connections, make sure Username-Password-Authentication and google-oauth2
  are enabled.

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
