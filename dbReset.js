#!/usr/bin/env node

var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

require('./env').load() // to load databaseString into process.env

mongoose.connect(process.env.databaseString)
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))
  .once('open', function () {
    //Drop everything
    mongoose.connection.db.dropDatabase((err, result)=>{
        mongoose.connection.close();
    })
  })
