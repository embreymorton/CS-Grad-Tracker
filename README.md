
# CS-Grad-Tracking

Software Toolsmith project for UNC-CH grad department

This project is assigned as part of the Code Closer/Software toolsmith Work-Study program at The Univsersity of North Carolina at Chapel Hill.

The clients of this project are all staff/administrators that work in Sitterson Hall as part of graduate program for computer science students.

Takoda Ren and Sebastian Crowell are the students currently working on this project.

In the past, Shane Flannigan worked on this project.

* Web site: csgrad.cs.unc.edu

# Documentation

## Starting the app


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

Now to start the app in development or production run the following commands:

If running in dev as an ADMIN:
npm run devAsAdmin

If running in dev as a FACULTY:
npm run devAsFaculty

If running in dev as a STUDENT:
npm run devAsStudent

If running in production:
mode=production node bin/www

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
