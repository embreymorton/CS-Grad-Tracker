const x = require('hyperaxe')
const page = require('../page')
const profileFields = require('../common/studentProfile')
const studentBarPartial = require('../common/studentBarPartial')

const main = (opts) => {
  const { form, h4, h1 } = x
  const { admin, student } = opts
  const { lastName, firstName, _id } = student
  const title = admin ? 'Edit student' : 'View student'
  return page(
    { ...opts, title },
    studentBarPartial(opts),
    h4(lastName, ', ', firstName),
    h1(title),
    profile(opts),
    x('.space')(),
  )
}

const profile = opts => {
  const { form, input } = x
  const fields = profileFields(opts)
  if (!opts.admin) return fields
  return form(
    {id: 'editStudentForm', action: '/student/put', method: 'post'},
    input({'type': 'hidden', 'name': '_id', 'value': opts.student._id.toString()}),
    profileFields(opts),
    x('.col-md-8.offset-md-2')(
      opts.admin ? x('button.btn.btn-success')({type: 'submit'}, 'Update') : null
    )
  )
}

module.exports = main
