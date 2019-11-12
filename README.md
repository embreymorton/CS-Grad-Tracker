# CS-Grad-Tracking

Software Toolsmith project for UNC-CH grad department

This project is assigned as part of the Code Closer/Software toolsmith Work-Study program at The Univsersity of North Carolina at Chapel Hill.

The clients of this project are all staff/administrators that work in Sitterson Hall as part of graduate program for computer science students.

Takoda Ren and Sebastian Crowell are the students currently working on this project.

In the past, Shane Flannigan worked on this project.

* Web site: csgrad.cs.unc.edu

# Documentation

*  [Starting the app with docker](#starting-the-app-with-docker)
*  [Starting the app without docker](#starting-the-app-without-docker)
*  [File organization](#file-organization)
*  [Testing](#testing)
*  [Deployment](#deployment)
*  [System overview](#system-overview)

# Starting the app with docker

## Basics

- Have docker installed on your machine.
- Pick your desired values for your .env file from the folder envFiles, and save it 
in .env in the root directory (CS-Grad-Tracking)
- Run `docker-compose build`
- Run `docker-compose up` after the build is finished
- Access the app at localhost:8080 in a browser.


## In-depth Docker (compose) Documentation

Starting the app

- First docker desktop is recommended if you are using mac or windows, as windows systems will need linux 
containers
- Once you have it installed, look at the docker icon in the system 
tray, switch to linux containters and restart*
- With docker installed, sign into your docker user account
- Using a command line/shell, navigate to the target of docker (in our case, cd to CS-Grad-Tracking) using  
`cd`
- Once inside, docker will require two basic files at the least to run, 
a dockerfile and yml file

## Dockerfile

(This file is building the image)

- The first portion of the Dockerfile should define the skeleton to use 
for the image either with an image you define (`FROM scratch`) or 
predefined of your choice (`FROM alpine:latest`, `FROM node:latest`, 
etc.)
- Next is a place for the directory once its being build (`WORKDIR 
/(named-place)`)
- If you have an already built app you are building from, you can 
duplicate the json file instead of creating a requirements file
- IF THE APP IS Already built: `app: COPY package.json /(named-place)`
- After this you will `RUN npm install`
- IF THE APP IS Newly built: define libraries needed for your `FROM 
image:version`, ie. for `FROM python:latest`, `requirements.txt` might 
have `Flask, Redis`, which you define in the dockerfile by `RUN pip 
install --trusted-host pypi.python.org -r requirements.txt`
-Now we can bundle everything into the docker image with `COPY . .`
- Use a port `EXPOSE 0000:0000` 
- And define the commands to run `CMD [ "npm", "start", 
"mongo://mongo:27017/cs_grad_data", "-n", "0.0.0.0"]`
*- Final portion of the commands to run are binding the mongo ip to all 
available address' so another bind can be made for the docker VM*

## docker-compose.yml

(This file provides important information for the dockerfile image)

- It's good practice to begin by defining the `version: "#"`, of the yml 
file
- Next, create a header that defines all the services:
- Services are the portions of the docker image, databases, base app, 
etc.
- For a general purpose app, this is where the skeleton from the 
dockerfile is made to image and a database if needed
- Defining a skeleton, begin by a name for the service like `app:`
- Next define the `container_name: (often the name of the service)`, 
which is used for docker's image
- Now properties can be defined in short or immense detail, for most, 
you want to `build: .`, to make the docker container, expose some 
`ports: - "0000:0000"`, and link to the database service with 
`depends_on: - mongo`
- If the ability to dynamically update while working (not requiring 
`build docker-compose`) add `volumes: -.:/app`, or whatever you named 
the skeleton*
- For defining a database, begin by a name for the service as well, but 
convention states to name it by the database language used like `mongo:`
- This step is the same as the skeleton, `container_name: mongo`
- This is important as well as the next step, here you build your image 
from docker, `image: mongo`
- And you expose ports for that image, in this case, mongo uses 27017 
so, `ports: - "27017:27017"`
*- Make sure that all the connection details are correct in your app if 
you have already defined them before ie. check for the docker VM ip and 
make sure to bind that VM ip to your machines ip then make sure your 
machine is bound to your database*
- Volumes can be made for the database as well, `volumes: - .:/dbdata`

### Starting up

- With these two files done, docker desktop up, docker set to linux 
containers, memory available enough, and docker 
shared devices set to your main drive
- You can begin by typing `docker-compose build`, to build everything
- Afterward, you can check the docker images made by `docker image ls`
- If you run `docker-compose up -d`, for detached
- You can now run `docker-compose ps`, to see what's running
- To stop use `docker-compose stop`, or `docker-compose down`
- You can also shell into the running docker images by `docker-compose 
exec (container_name) bash`
*- Sometimes this requires `winpty docker-compose exec (container_name) 
bash`, for windows*
*- Windows firewall can also block shared access to the C drive, which 
the docker VM needs to store information*

## Starting the app without Docker


### Running the database
First, since we are connecting to a mongodb database, download mongodb at

For windows:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
Follow all default options on the installer,
after it is completed, make sure you have created a directory:
C:\data\db, then run 

"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" in bash

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
git clone https://gitlab.com/unc-cs-toolsmiths/CS-Grad-Tracking.git
cd CS-Grad-Tracking
npm install

Select your desired environmental values from the appropriate file in envFiles,
and add it to a .env file in the root directory (CS-Grad-Tracking)

Now to start the app run the command: 

`npm start`

## File organization

### bin/www
Database connection and entry point to starting the server.

### app.js
Authentication logic and express setup (routes, static resources)

### routes
All routes referenced in app.js are here. For each route (get/post) there is an associated
url and controller function.

Many of the route files contain middleware that checks a user's role
before allowing access.

### controllers
The controllers have the referenced functions from routes and contains
primary code and database logic and also serves the files in the
views folder.

### models
The one file, schema.js, in models describes all the database objects
in use. Controllers store and retrieve data from the database as
these defined objects.

### views
Contains .ejs files, which are essentially html files with embedded
javascript. Each .ejs file represents a page that a user can see, or
a component that is reused across multiple web pages.

### public
Contains css and image resources.

### test
Currently unused

### data
Currently used only to store test excel files, was used in the past
for storing pdfs/documents for student objects, as mongo does not
handle pdfs well.

### Overview
For example, app.js defines a route as app.use("/course", require("./routes/course"));
This is causing routes/course.js to handle all requests for 
csgrad.cs.unc.edu/course\* (\* being anything after course).
routes/course.js has a route: router.get("/", course.get) with "course" being the 
exported controllers/CourseController.js file, then whenever a user navigates to
csgrad.cs.unc.edu/course, CourseController.js's function "get" will handle the request
and serve the view file views/course/index.ejs.

## Testing

### Basics

- Run the app, with npm test, whether with docker or not. It should be running on localhost:8080
- Run `npx cypress open` or `npm run cypress:open`
- A cypress test window should appear (on mac and windows--not sure about linux)
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

Follow this to install nginx: https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04-quickstart
- Steps 1-3

Follow this to add the port our app is running on locally to nginx: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
- Start at "Set Up Nginx as a Reverse Proxy Server"
- Set the port as 8080 (as that is the port we are running the app on)
- under `location / {` add two lines: `auth_pam   "Secure Zone";` and `auth_pam_service_name "nginx";` This requires users to log in with their cslogin before accessing any of the app.

### Processes

I am using a process manager for the deployment, PM2.
`npm install pm2@latest -g`


To enable process restarting, use the command: `systemctl enable mongod.service`



Commands to start a fresh process that restarts on crash or vm restart.
- `sudo -i`
- `cd ../CS-Grad-Tracking`   (CD to wherever the folder containing the project is)
- `pm2 start "npm start"`
- `pm2 startup`

Now the app should be running and should continue to run after restarts or crashes.

## Deploying with Docker

- Install docker: https://docs.docker.com/install/linux/docker-ce/ubuntu/
- Follow [Nginx](#nginx) (part of deploying without docker)
- Clone the project
- `cd <project directory>`
- Follow [basics](#basics) under [Starting the app with docker](#starting-the-app-with-docker)

# System overview

This nodejs app is in the form of server-rendered html. That is, whenever you visit a page, submit a form, 
click a search button, etc. you are making a request to the server which then processes this request and
returns appropriate html.



When the app is deployed on a UNC-CS virtual machine (csgrad.cs.unc.edu), this is how the system works together:
- The nodejs express app is running on port 8080
- The mongodb database is running on port 27017
- Nginx is running on the vm which is reverse proxying port 8080 to the world, so that anyone can try to access it
- Nginx uses auth-pam to use the CS department's kerberos system to secure any possible route on port 8080; if you visit csgrad.cs.unc.edu, you will be prompted for a login
- So whenever you attempt to access csgrad.cs.unc.edu, kerberos requires you to enter your CS credentials.
- If the login is successful, app logic checks the CS credentials against the users in the database to verify that the user can use the system.
- On most requests to the app, a query to the database is made and the resulting data is added to the html page to be rendered.