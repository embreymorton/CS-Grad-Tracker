#!/usr/bin/env node

// Edit this place to set the port number and ip addess of the server that is running the application.
// It defaults to localhost:3000
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

var config = require('./config.js');

console.log(process.env.mode);
mongoose.connect(config[process.env.mode]);
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', function () {
    
  })
