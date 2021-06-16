const x = require('hyperaxe')
const page = require('../page')
const profileFields = require('../common/studentProfile')

const main = (opts) => {
  const { form, h4, h1 } = x
  const { admin } = opts
  const title = admin ? 'Edit student' : 'View student'
  return page(
    { ...opts, title },
    studentBarPartial(opts),
    h4(opts.student.lastName, ', ', opts.student.firstName),
    h1(title),
    profile(opts),
    x('.space')(),
    admin ? [
      form({action: '/student/delete/' + opts.student._id.toString(),
            method: 'post'},
           x('button.btn.btn-danger')(
             {type: 'submit',
              onclick: "return confirm('Do you really want to delete this?')"},
             'Delete'))
    ] : null,
  )
}

const navItemLi = x('li.nav-item')
const navItem = (opts, segment, label) => navItemLi(
  x(`a.nav-link.student-navigation-${segment}-button`)(
    {href: `/student/${segment}/${opts.student._id.toString()}`},
    label
  )
)

const studentBarPartial = opts => x('ul.nav.nav-tabs.whiteBg.space')(
  navItem(opts, 'edit', 'Profile'),
  navItem(opts, 'jobs', 'Jobs'),
  navItem(opts, 'forms', 'Forms'),
  navItem(opts, 'courses', 'Courses'),
  navItem(opts, 'notes', 'Notes')
)

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
