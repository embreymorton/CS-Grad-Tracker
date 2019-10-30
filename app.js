var express = require("express")
var sessions = require("client-sessions")
var path = require("path")
var bodyParser = require("body-parser")
var compress = require("compression")
var https = require("https");
var schema = require("./models/schema.js");

require('dotenv').config();

var app = express()


app
  .use(compress())
  .use(sessions({
    cookieName: "gradInfoSession",
    secret: "ugzEbQSRk7YM23PAJn1yOeG9GkTak1xah70dF0ePF3PmsEMxoWan4ihH0ZLVfhdYDpWF6egzAhPHztW7dGxzkY6jMzjBsr3kQzlW",
    duration: 3 * 60 * 60 * 1000,
    activeDuration: 2 * 60 * 1000
  }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .set("view cache", true)
  .use(function (req, res, next) {
    if (req.headers.uid) {
      res.cookie("onyen", req.headers.uid, { httponly: false })
    }
    next()
  })

//setup ejs view engine, pointing at the directory views
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

//bootstrap static resource
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist")))

//node_modules statis resource
app.use(express.static(path.join(__dirname, "node_modules")))

//public static resource
app.use(express.static(path.join(__dirname, "public")))

/*
  When in production, X-REMOTE-USER-1 is set by nginx
  to be the user's csid if they successfully login

  This is then used with onyenldap (yes this is very bad
  because it is possible for people's csid's to be different
  although it usually isnt. Need to figure out a way to get 
  the pid without assuming the csid is the same as an onyen)
  to get a user's pid, which is then stored in process.env.userPID
  which is then used for logic in the rest of the app.
*/
if(process.env.mode == "production"){
//middleware executed before every request
  app.use(function(req, res, next){
    if(!process.env.userPID){
      var user = req.get("X-REMOTE-USER-1");
      https.get("https://onyenldap.cs.unc.edu/onyenldap.php?onyen="+user, resp=>{
        let data="";
        resp.on("data", (chunk)=>{
          data+=chunk;
        });
        resp.on("end", ()=>{
          var index = data.indexOf("pid");
          //maybe change this to be more robust
          var pid = data.substring(index + 5, index + 14);
          process.env.userPID = parseInt(pid);
          res.redirect("/");
        });
      });
    }
    else{
      var user = req.get("X-REMOTE-USER-1");
      https.get("https://onyenldap.cs.unc.edu/onyenldap.php?onyen="+user, resp=>{
        let data="";
        resp.on("data", (chunk)=>{
          data+=chunk;
        });
        resp.on("end", ()=>{
          var index = data.indexOf("pid");
          //maybe change this to be more robust
          var pid = data.substring(index + 5, index + 14);
          process.env.userPID = parseInt(pid);
          next();
        });
      });
    }
  });

  /*
    Middleware executed to store the user's csid in
    res.locals.user.  
  */
  app.use(function(req, res, next){
    res.locals.user = req.get("X-REMOTE-USER-1");
    next();
  });
}
else if(process.env.mode == "development" || process.env.mode == "testing"){
  /*
    initialize all semesters if they have not been initialized.
    This is required because the database is reset if the app is 
    run using `npm test`
  */
  schema.Semester.find({}).exec().then((result)=>{
    if(result.length == 0){
      require('./controllers/util.js').initializeAllSemesters();
    }
  })

  //add routes to allow user changes
  app.use("/changeUser", require("./routes/userChange"));
}

app.get("/logout", (req, res)=>{
	 process.env.userPID = "---------";
	 res.redirect("http://logout@csgrad.cs.unc.edu");
})

app.get("/", (req, res) => {
  schema.Faculty.findOne({pid: process.env.userPID}).exec().then(function(result){
    if(result != null){
      if(result.admin == true){ //admin
        res.redirect("/student");
      } else { //advisor
        res.redirect("/student");
      }
    }
    else{
      schema.Student.findOne({pid: process.env.userPID}).exec().then(function(result){
        if(result != null){ //student
          res.redirect("/studentView");
        } else {
          res.render("./error.ejs", {string: "Failed Authentication"});
        }
      });
    }
  });
});

app.use("/course", require("./routes/course"));

app.use("/faculty", require("./routes/faculty"));

app.use("/job", require("./routes/job"));

app.use("/student", require("./routes/student"));

app.use("/studentView", require("./routes/studentView"));

app.use("/report", require("./routes/report"));


//need to look into error handling before modifying or removing the following 2 middleware functions


// catch 404 and forward to error handler
app.use(function (req, res) {
  var err = new Error("Not Found")
  err.status = 404
})

// production error handler
app.use(function (err, req, res) {
  console.log(err)
  res.status(err.status || 500)
  res.json({ "error": err.message })
})

module.exports = app
