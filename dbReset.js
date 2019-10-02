#!/usr/bin/env node

// Edit this place to set the port number and ip addess of the server that is running the application.
// It defaults to localhost:3000
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

var config = require('./config.js');

mongoose.connect(config[process.env.mode], {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', function () {
    mongoose.connection.db.dropDatabase((err, result)=>{
        mongoose.connection.close();
    })
  })
