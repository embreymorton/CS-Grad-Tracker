var express = require("express")
var sessions = require("client-sessions")
var path = require("path")
var bodyParser = require("body-parser")
var compress = require("compression")
var https = require("https");
var schema = require("./models/schema.js");
const { join } = require("path");

require('dotenv').config();

require('dotenv').config();

var app = express()

let auth0 = null;

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

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "/Loginpage.js"));
});

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};

if (typeof window === 'undefined') {
  global.window = {}
}

window.onload = async () => {
  await configureClient();
}

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
