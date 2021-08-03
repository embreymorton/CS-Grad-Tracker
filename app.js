var express = require('express')
var helmet = require('helmet')
var sessions = require('client-sessions')
var path = require('path')
var bodyParser = require('body-parser')
var compress = require('compression')
var https = require('https')
var schema = require('./models/schema.js')
var crypto = require('crypto')
const { join } = require('path')

const expressSession = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const featurePolicy = require('feature-policy')

var app = express()

let auth0 = null
/*Instead of auth0 permissions system use auth0 to login and use the
 given email to check against database to determine the user role
 asdasd
*/


//session configuration
const mongoUrl = process.env.databaseString
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const secret = process.env.sessionSecret
const store = MongoStore.create({mongoUrl, mongoOptions})
const session = {
  secret,
  cookie: {},
  resave: false,
  saveUninitialized: false,
  store,
}

if (app.get('mode') === 'production') {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true
}

app
  .use(compress())
  .use(expressSession(session))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .set('view cache', process.env.mode === 'production')
  .use((req, res, next)=>{
    next()
  })

// mitigations to prevent click-jacking
app.use(helmet.frameguard({action: 'SAMEORIGIN'}))

// remove X-Powered-By headers
app.use(helmet.hidePoweredBy())

// set Referrer-Policy header
app.use(helmet.referrerPolicy({
  policy: 'no-referrer'
}))

// mitigate cross-site scripting attacks
app.use(helmet.xssFilter())

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
})
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: "'self'",
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
    },
  })
);

//add feature-policy header
app.use(
  featurePolicy({
    features: {
      accelerometer: ["'none'"],
      ambientLightSensor: ["'none'"],
      autoplay: ["'none'"],
      camera: ["'none'"],
      navigationOverride: ["'none'"],
    },
  })
)

//setup ejs view engine, pointing at the directory views
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//bootstrap static resource
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))

//node_modules statis resource
app.use(express.static(path.join(__dirname, 'node_modules')))

//public static resource
app.use(express.static(path.join(__dirname, 'public')))


if(process.env.mode == 'production' || process.env.mode == 'development'){
  const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL:
        process.env.AUTH0_CALLBACK_URL || 'http://localhost:8080/callback'
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      /**
       * Access tokens are used to authorize users to an API
       * (resource server)
       * accessToken is the token to call the Auth0 API
       * or a secured third-party API
       * extraParams.id_token has the JSON Web Token
       * profile has all the information from the user
       */
      return done(null, profile)
    }
  )

  passport.use(strategy)
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  app.use((req, res, next) => {
    if(req.user != undefined){
      var email = req.user._json.email
      schema.Student.findOne({email: email}).exec().then((result) => {
        if(result != null){
          req.session.userPID = result.pid
          req.session.accessLevel = 1
          res.locals.user = result.csid
          next()
        }
        else{
          schema.Faculty.findOne({email: email}).exec().then((result) => {
            if(result != null){
              req.session.userPID = result.pid
              res.locals.user = result.csid
              if(result.admin){
                req.session.accessLevel = 3
              }
              else{
                req.session.accessLevel = 2
              }
              next()
            }
            else{
              req.session.userPID = 'INVALID'
              req.session.accessLevel = 0
              next()
            }
          })
        }
      })
    }
    else{
      req.session.userPID = 'INVALID'
      req.session.accessLevel = 0
      next()
    }
  })

  app.get('/', (req, res) => {
    if(req.user != undefined){
      var email = req.user._json.email
      schema.Faculty.findOne({email: email}).exec().then(function(result){
        if(result != null){
          res.redirect('/student')
        }
        else{
          schema.Student.findOne({email: email}).exec().then(function(result){
            if(result != null){ //student
              res.redirect('/studentView')
            } else {
              res.render('./error.ejs', {string: 'Failed Authentication, you are not a user in the database'})
            }
          })
        }
      })
    }
    else{
      res.render('./error.ejs', {string: 'Please log in'})
    }
  })
}
else if (process.env.mode == 'testing') {
    schema.Semester.find({}).exec().then((result)=>{
      if(result.length == 0){
        require('./controllers/util.js').initializeAllSemesters()
      }
    })

    //add routes to allow user changes
    app.use('/changeUser', require('./routes/userChange'))
    app.use('/util/resetDatabaseToSnapshot', async (req, res) => {
      try {
        const result = await require('./cypress/fixtures')()
        res.status(200).json(result)
      } catch (error) {
        res.status(500).json({error})
      }
    })
    app.get('/', (req, res) => {
      if(req.session.accessLevel >= 2){
        res.redirect('/student')
      }
      else if(req.session.accessLevel == 1){
        res.redirect('/studentView')
      }
      else{
        res.render('./error.ejs', {string: 'U are not logged in'})
      }
    })
}

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  next()
})


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

app.use('/course', require('./routes/course'))
app.use('/faculty', require('./routes/faculty'))
app.use('/job', require('./routes/job'))
app.use('/student', require('./routes/student'))
app.use('/studentView', require('./routes/studentView'))
app.use('/report', require('./routes/report'))
app.use('/', require('./routes/auth'))

// Use hyperaxe for rending .js views
app.engine('js', (filePath, options, callback) => {
  try {
    const view = require(filePath)
    const output = '<!DOCTYPE html>\n' + view(options).outerHTML
    return callback(null, output)
  } catch (err) { return callback(err) }
})
app.set('view engine', 'js')

//need to look into error handling before modifying or removing the following 2 middleware functions

// catch 404 and forward to error handler
app.use(function (req, res) {
  var err = new Error('Not Found')
  err.status = 404
})

// production error handler
app.use(function (err, req, res) {
  console.log(err)
  res.status(err.status || 500)
  res.json({ error: err.message })
})

module.exports = app
