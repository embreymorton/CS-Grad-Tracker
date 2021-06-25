const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const bootstrapScripts = require('../common/bootstrapScripts')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS02 Course Waiver'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    bootstrapScripts(),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, strong, hr } = x
  const form = !hasAccess
        ? div('You do not have access')
        : cs02Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Course Waiver'),
    h3('CS-02'),
    div(
      { style: { 'text-align': 'left' }},
      div('This student is exempt from the breadth requirement listed below.'),
      strong('All fields required!'),
      hr(),
      form,
    )
  ]
}

const cs02Form = (opts) => {
  const { postMethod, student, form, editAccess } = opts
  const { courseNumber, basisWaiver } = form
  const { div, hr } = x
  const vert = x('div.verticalSpace')()
  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidDateRow(opts), hr(),
      row(
        colMd(4)(
          div('Course Number:'),
          input('text', 'courseNumber', courseNumber, true),
        ),
      ),
      vert,
      row(
        colMd(6)(
          div('Basis for Waiver'),
          div('Options: Prior course work, More Advanced Course Here, Other'),
          input('text', 'basisWaiver', basisWaiver, true)
        )
      ),
      hr(),
      div('Advisor Signature:'),
      signatureRow(editAccess, 'advisor', form),
      vert,
      div('Designated Instructor Signature:'),
      signatureRow(editAccess, 'instructor', form),
      x('button.btn.btn-primary.CS02-submit')('Submit'),
    )
  )
}

const namePidDateRow = (opts) => {
  const { student, form } = opts
  const { lastName, firstName, pid } = student
  const { dateSubmitted } = form
  const name = `${lastName}, ${firstName}`
  const { div } = x
  return (
    row(
      colMd(4)(
        div('Name'),
        input('text', 'name', name, true)
      ),
      colMd(4)(
        div('PID'),
        input('number', 'pid', pid, true)
      ),
      colMd(4)(
        div('Date submitted'),
        input('text', 'dateSubmitted', dateSubmitted, true)
      ),
    )
  )
}

module.exports = main
