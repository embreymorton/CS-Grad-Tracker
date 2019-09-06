
# CS-Grad-Tracking

Software Toolsmith project for UNC-CH grad department

This project is assigned as part of the Code Closer/Software toolsmith Work-Study program at The Univsersity of North Carolina at Chapel Hill.

The clients of this project are all staff/administrators that work in Sitterson Hall as part of graduate program for computer science students.

Takoda Ren and Sebastian Crowell are the students currently working on this project.

In the past, Shane Flannigan worked on this project.

* Web site: csgrad.cs.unc.edu

# Documentation

 ## File organization

### bin/www
Database connection and entry point to starting the server.

### app.js
Authentication logic and express setup (routes, statis resources)

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
The one file schema.js in models describes all the database objects
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