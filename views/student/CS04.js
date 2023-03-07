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
const { checkbox, script, textarea, dropdown, makeOption } = require('../common/baseComponents')


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
  const { postMethod, student, form, admin, isStudent, isComplete, cspNonce } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option, b } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const disabled = editAccess && !isComplete ? {} : { disabled: true }
  const approvedGSCText = 'Approved by Graduate Studies Committee'
  const disapprovedGSCText = 'Disapproved'

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
          textarea(
            'projectDescription', 
            form.projectDescription,
            {isRequired: true, isDisabled: disabled.disabled, rows: 6})
        ),
      ),
      hr(),

      row(
        colMd(6)(
          div('Is the documentation proprietary?'),
          dropdown(
            'docProprietary',
            [
              makeOption(false, 'No. The documentation is attached.', !form.docProprietary),
              makeOption(true, 'Yes. A non-disclosure agreement is attached.', form.docProprietary)
            ],
            {isDisabled: disabled.disabled, blankOption: 'None selected.'}
          )
        ),
      ),
      hr(),

      div({class: 'text-center'}, b('(Below is to be completed by the advisor and faculty members.)')),
      hr(),

      row(
        colMd(12)(
          div('The majority of the publication was completed by the student:'),
          checkbox(
            'majorityCompleted',
            form.majorityCompleted,
            cspNonce,
            {
              isDisabled: isStudent,
              isRequired: false,
            }
          )
        )
      ),
      hr(),

      row(
        colMd(12)(
          div('The student has revised the externally reviewed publication such that it also satisfies the Comprehensive Writing requirement:'),
          checkbox(
            'satisfiesComprehensiveWriting',
            form.satisfiesComprehensiveWriting,
            cspNonce,
            {
              isDisabled: isStudent,
              isRequired: false,
            }
          )
        )
      ),
      hr(),

      div('Advisor Approval:'),
      approvalCheckboxRow(!isStudent, 'advisor', opts),
      hr(),

      div('Graduate Studies Approval:'),
      row(
        colMd(6)(
          dropdown(
            'approved',
            [
              makeOption('', '', form.approved === '' || form.approved === undefined),
              makeOption(false, disapprovedGSCText, form.approved === false),
              makeOption(true, approvedGSCText, form.approved === true)
            ],
            {isDisabled: isStudent}
          )
        )
      ),

      div(
        {id: 'reason-section', hidden: form.approved || null},
        div('Reason for Disapproval:'),
        row(
          colMd(6)(
            textarea(
              'approvalReason',
              form.approvalReason,
              {
                isDisabled: isStudent || !admin,
                required: !form.approved,
                rows: 6
              }
            )
          )
        ),
        script(cspNonce, 
          `
          document.querySelector('[name="approved"]').addEventListener('change', (e) => {
            const reasonSection = document.getElementById('reason-section')
            const approvalReason = document.querySelector('[name="approvalReason"]')
            const value = e.target.value
            if (value == 'false') {
              reasonSection.removeAttribute('hidden')
              approvalReason.setAttribute('required', 'true')
            } else {
              reasonSection.setAttribute('hidden', 'true')
              approvalReason.removeAttribute('required')
            }
          })
          document.querySelector('[name="approved"]').dispatchEvent(new Event('change'))
          `,
          {defer: ''})
      ),
      hr(),

      buttonBarWrapper(
        isComplete ? null : [vert, x('button.btn.btn-primary.CS04-submit#submit-btn')({ type: 'submit' }, 'Submit')],
        disableSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      ),
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
