const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const approvalCheckbox = require('../common/approvalCheckboxRow')
const pseudoInput = require('../common/pseudoInput')
const signatureDropDown = require('../common/signatureDropDown')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS02 Course Waiver'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts)
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
      { class: 'text-left' },
      div('This student is exempt from the breadth requirement listed below.'),
      strong('All fields required!'),
      hr(),
      form,
    )
  ]
}

const cs02Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, faculty } = opts
  const editAccess = admin || isStudent
  const row = formRow(form, editAccess)
  const { courseNumber, basisWaiver } = form
  const { div, hr } = x
  const vert = x('div.verticalSpace')()
  const basisForWaiverLabel = [
    div('Basis for Waiver'),
    div('Options: Prior course work, More Advanced Course Here, Other'),
  ]
  console.log(faculty)
  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidDateRow(opts, editAccess), hr(),
      row(div('Course Number:'), 'courseNumber'), vert,
      row(basisForWaiverLabel, 'basisWaiver'), hr(),
      div('Advisor Signature:'),
      approvalCheckbox(admin, 'advisor', opts),
      vert,
      div('Designated Instructor Signature:'),
      signatureDropDown(admin, 'instructor', faculty, opts),
      editAccess
        ? x('button.btn.btn-primary.CS02-submit')('Submit')
        : null,
    )
  )
}

const namePidDateRow = (opts, editAccess) => {
  const { student, form } = opts
  const { lastName, firstName, pid } = student
  const { dateSubmitted } = form
  const name = `${lastName}, ${firstName}`
  const { div } = x
  const value = editAccess
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(4)(
        div('Name'),
        pseudoInput(name)
      ),
      colMd(4)(
        div('PID'),
        pseudoInput(pid)
      ),
      colMd(4)(
        div('Date submitted'),
        value('text', 'dateSubmitted', dateSubmitted)
      ),
    )
  )
}

const formRow = (values, editAccess) => (label, name) => {
  const value = editAccess
        ? input('text', name, values[name], true)
        : pseudoInput(values[name])
  return (
    row(
      colMd(6)(
        label,
        value,
      )
    )
  )
}



module.exports = main
