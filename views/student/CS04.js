const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const pseudoInput = require('../common/pseudoInput')
const approvalCheckboxRow = require('../common/approvalCheckboxRow')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')


const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS04 Outside Review Option'
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
  const { h4, h3, div, strong, hr } = x
  const form = !hasAccess
        ? div('You do not have access')
        : cs04Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Outside Review Option'),
    h3('CS-04'),
    div(
      { class: 'text-left' },
      form,
    )
  ]
}

const cs04Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, isComplete } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const disabled = editAccess && !isComplete ? {} : { disabled: true }

  return [
    div('This student has successfully completed a project as a thesis substitute in partial fulfillment of the requirements for the degree of Master of Science in Computer Science.'),
    strong('All fields required!'),
    hr(),
    x('form.cs-form#cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(student), hr(),

      row(
        colMd(6)(
          div(strong('Brief Description of project:')),
          x('textarea.form-control')(
            { rows: 6, name: 'projectDescription', required: true, ...disabled },
            form.projectDescription
          )
        ),
      ),
      hr(),

      row(
        colMd(6)(
          div('Is the documentation proprietary?'),
          select(
            { name: 'docProprietary', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.docProprietary || null }, 'No. The documentation is attached.'),
            option({ value: 'true', selected: form.docProprietary || null }, 'Yes. A non-disclosure agreement is attached.'),
          )
        ),
      ),
      hr(),

      div('Advisor Approval:'),
      approvalCheckboxRow(!isStudent, 'advisor', opts),
      buttonBarWrapper(
        isComplete ? null : [vert, x('button.btn.btn-primary.CS04-submit#submit-btn')({ type: 'submit' }, 'Submit')],
        disableSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  ]
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

module.exports = main
