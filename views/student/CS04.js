const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const bootstrapScripts = require('../common/bootstrapScripts')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const pseudoInput = require('../common/pseudoInput')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS04 Outside Review Option'
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
  const { postMethod, student, form, admin, isStudent } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()

  return [
    div('This student has successfully completed a project as a thesis substitute in partial fulfillment of the requirements for the degree of Master of Science in Computer Science.'),
    strong('All fields required!'),
    hr(),
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(opts, editAccess), hr(),

      row(
        colMd(6)(
          div(strong('Brief Description of project:')),
          x('textarea.form-control')(
            { rows: 6, name: 'projectDescription', required: true },
            form.projectDescription
          )
        ),
      ),
      hr(),

      row(
        colMd(6)(
          div('Is the documentation proprietary?'),
          select(
            { name: 'docProprietary' },
            option({ value: form.docProprietary }, form.docProprietary),
            option({ value: 'false' }, 'No. The documentation is attached.'),
            option({ value: 'true' }, 'Yes. A non-disclosure agreement is attached.'),
          )
        ),
      ),
      hr(),

      div('Student signature:'),
      signatureRow(admin || isStudent, 'student', form), vert,
      div('Chair signature:'),
      signatureRow(admin, 'chairman', form), vert,

      row(
        colMd(4)(
          div('Approved:'),
          isStudent
            ? form.approved
            : select(
              { name: 'approved' },
              option({ value: form.approved }, form.approved),
              option({ value: 'false' }, 'Not approved'),
              option({ value: 'true' }, 'Approved'),
            )
        )
      ),

      editAccess
        ? [vert, x('button.btn.btn-primary.CS04-submit')({ type: 'submit' }, 'Submit')]
        : null,
    )
  ]
}

const namePidRow = (opts, editAccess) => {
  const { student, form } = opts
  const { lastName, firstName, pid } = student
  const name = `${lastName}, ${firstName}`
  const { div } = x
  const value = editAccess
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(6)(
        div('Name'),
        value('text', 'name', name)
      ),
      colMd(6)(
        div('PID'),
        value('number', 'pid', pid)
      ),
    )
  )
}

module.exports = main
