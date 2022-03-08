const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const pseudoInput = require('../common/pseudoInput')
const signatureDropDown = require('../common/signatureDropDown')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS08 M.S. Technical Writing Requirement'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, hr } = x
  return [
    h4(lastName, ', ', firstName),
    h3('M.S. Technical Writing Requirement'),
    h3('CS-08'),
    x('strong.verticalSpace')('All fields required!'),
    hr(),
    div(
      { class: 'text-left' },
      cs08Form(opts),
    )
  ]
}

const cs08Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, activeFaculty, isComplete } = opts
  const editAccess = admin || isStudent
  const { div, hr, strong, option, span, a } = x
  const vert = x('div.verticalSpace')()
  const range4 = [0, 1, 2, 3]
  const range6 = [0, 1, 2, 3, 4, 5]
  const buttonAttrs = {
    type: 'button',
    'aria-pressed': 'false',
    autocomplete: 'off',
  }
  const disabled = editAccess ? {} : { disabled: true }

  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(student),
      hr(),

      strong('Title of Paper:'),
      isComplete ? pseudoInput(form.title) : colMd(4)(
        x('textarea.form-control')(
          { rows: 6, name: 'title', required: true, ...disabled },
          form.title
        )
      ),
      hr(),

      strong('Agreement to Review'),
      div('The final draft to the primary reader must be delivered 4 weeks before the last day of classes of the semester in which the student plans to graduate.  We recommend that you work with the primary reader throughout the semester, first creating an outline, and then iterating over several drafts.'),

      readerDateRow(opts, editAccess, 'primary'),
      div('The final draft to the secondary reader must be delivered 2 weeks before the last day of classes of the semester in which the student plans to graduate.'),
      readerDateRow(opts, editAccess, 'secondary'), hr(),

      strong('Approval'),
      div('We have judged this paper in both substance and presentation to satisfy the writing requirement for the M.S. in Computer Science.'),
      div('Primary Reader signature'),
      signatureDropDown(!isStudent, 'primary', activeFaculty, opts),

      div('Secondary Reader signature'),
      signatureDropDown(!isStudent, 'secondary', activeFaculty, opts),
      buttonBarWrapper(
        [vert, isComplete ? null : x('button.btn.btn-primary.CS08-submit')({ type: 'submit' }, 'Submit')],
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  )
}

const namePidRow = (student) => {
  const { lastName, firstName, pid } = student
  const name = `${lastName}, ${firstName}`
  const { div } = x
  return (
    row(
      colMd(6)(
        div('Name'),
        pseudoInput(name),
      ),
      colMd(6)(
        div('PID'),
        pseudoInput(pid),
      )
    )
  )
}

const readerDateRow = (opts, editAccess, modifier) => {
  const { form, isComplete, isStudent } = opts
  const readerField = `${modifier}Reader`
  const dateField = `${modifier}Date`
  const readerValue = form[readerField]
  const dateValue = form[dateField]
  const { div } = x
  const modifierLabel = modifier.toUpperCase()[0] + modifier.substr(1)
  const value = editAccess && !isComplete
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  const date = !isStudent
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(6)(
        div(`${modifierLabel} Reader`),
        value('text', readerField, readerValue)
      ),
      colMd(6)(
        div('Date Draft Received'),
        date('text', dateField, dateValue)
      ),
    )
  )
}

module.exports = main


// TODO: make primary and secondary reader fields dropdowns
// email readers when form is submitted
// make students unable to change approval signature dropdowns