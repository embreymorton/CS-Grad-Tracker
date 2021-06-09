const x = require('hyperaxe')
const page = require('../page')
const profileFields = require('../common/studentProfile')

const main = (opts) => (
  page(
    { ...opts, title: 'Create student' },
    x('h1')('Create student'),
    profile(opts),
  )
)

const profile = (opts) => (
  x('form')(
    {id: 'createStudentForm', action: '/student/post', method: 'post'},
    profileFields(opts),
    x('button.btn.btn-primary')({type: 'submit', onClick: 'debugger'}, 'Submit')
  )
)

module.exports = main
