const x = require('hyperaxe')
const studentBarPartial = require('./studentBarPartial')
const studentViewNavPartial = require('./studentViewNavPartial')

const studentBar = (opts) => (
  opts.isStudent
    ? studentViewNavPartial(opts)
    : studentBarPartial(opts)
)

module.exports = studentBar
