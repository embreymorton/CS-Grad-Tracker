const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const pseudoInput = require('../common/pseudoInput')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const dropdown = require('../common/facultyDropdown')
const pseudoCheckbox = require('../common/pseudoCheckbox')
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')
const { dateInput } = require('../common/baseComponents')

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
    x('form.cs-form#cs-form')(
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
      vert,
      div('The final draft to the secondary reader must be delivered 2 weeks before the last day of classes of the semester in which the student plans to graduate.'),
      readerDateRow(opts, editAccess, 'secondary'), hr(),

      strong('Approval'),
      div('We have judged this paper in both substance and presentation to satisfy the writing requirement for the M.S. in Computer Science.'),
      div('Primary Reader Approval'),
      approvalRow(opts, 'primary'),

      div('Secondary Reader Approval'),
      approvalRow(opts, 'secondary'),

      buttonBarWrapper(
        [vert, isComplete ? null : x('button.btn.btn-primary.CS08-submit#submit-btn')({ type: 'submit' }, 'Submit')],
        disableSubmitScript(opts),
        pageSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  )
}

function pageSubmitScript(opts) {
  const script = x('script')({type: 'text/javascript'})
  const javascript = `
  let onLoad = () => {
    const inputChangeCheck = () => {
      const primaryField = document.getElementById("primaryReader")
      const secondaryField = document.getElementById("secondaryReader")
      const primaryLabel = document.getElementById("primary-pseudo")
      const secondaryLabel = document.getElementById("secondary-pseudo")
      var primarySigField = document.getElementById("primarySignature")
      var secondarySigField = document.getElementById("secondarySignature")
      primarySigField.value = primaryField.value
      secondarySigField.value = secondaryField.value
      primaryLabel.innerText = primaryField.value
      secondaryLabel.innerText = secondaryField.value
      return true
    }
    document.getElementById("primaryReaderSelect").addEventListener('change', inputChangeCheck)
    document.getElementById("secondaryReaderSelect").addEventListener('change', inputChangeCheck)
  }
  document.addEventListener('DOMContentLoaded', onLoad)
  `
  script.innerHTML = javascript
  script.setAttribute('nonce', opts.cspNonce)
  return script
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
  const { form, isComplete, isStudent, activeFaculty } = opts
  const readerField = `${modifier}Reader`
  const dateField = `${modifier}Date`
  const readerValue = form[readerField]
  const dateValue = form[dateField]
  const { div } = x
  const modifierLabel = modifier.toUpperCase()[0] + modifier.substr(1)
  return (
    row(
      isComplete ?
      colMd(6)(
        div(`${modifierLabel} Reader`),
        pseudoInput(readerValue)
      ) :
      dropdown(
        editAccess, // remove this line to allow for faculty to always be able to edit dropdown
        readerField,
        activeFaculty,
        opts,
        div(`${modifierLabel} Reader`)
      ),
      colMd(6)(
        div('Date Draft Received'),
        dateInput(dateField, dateValue, {
          isDisabled: isStudent,
          isRequired: false
        }
      ),
    )
  ))
}

const approvalRow = (opts, modifier) => {
  const { form, isStudent } = opts
  const vert = x('div.verticalSpace')()
  const readerField = `${modifier}Reader`
  const readerName = form[readerField]
  const dateField = `${modifier}DateSigned`
  const dateSigned = new Date(form[dateField])
  const dateSignedMMDDYYYY = `${dateSigned.getMonth()+1}/${dateSigned.getDate()}/${dateSigned.getFullYear()}`;
  const isApproved = !isNaN(dateSigned)
  const sigField = `${modifier}Signature`
  const approvalLabel = isApproved ? 
  `(${readerName} approved on ${dateSignedMMDDYYYY}.)` :
  `(Not yet approved.)`

  return [
    row(
      colMd(6)(
        pseudoInput(readerName, `#${modifier}-pseudo`)
      ),
    ),
    vert,
    row(
      !isStudent ?
      colMd(6)(
        x(`input#${dateField}Checkbox.pseudo-checkbox`)({type: "checkbox", checked: isApproved ? "checked" : undefined}),
        x(`input#${dateField}`)({type: "hidden", name: dateField, value: isApproved ? dateSigned.toString() : undefined}),
        x(`input#${sigField}`)({type: "hidden", name: sigField, value: form[sigField] ? form[sigField] : ""}),
        pageScript(opts, { dateField, readerName, })
      ) :
      colMd(6)(
        pseudoCheckbox(isApproved),
        x(`input#${sigField}`)({type: "hidden", name: sigField, value: form[sigField] ? form[sigField] : ""}),
      ),
    ),
    row(
      colMd(5)(
        x(`em#${dateField}Label`)(approvalLabel),
      )
    )
  ]

}

function pageScript(opts, initialState) { 
  const { dateField, readerName } = initialState;
  const el = x('script')({type: 'text/javascript'});

  el.innerHTML =
  `
    onLoad = () => {
      const label = document.getElementById('${dateField}Label');
      const checkbox = document.getElementById('${dateField}Checkbox');
      // const approvalData = document.getElementById('${dateField}');
      const dateData = document.getElementById('${dateField}');
      const changeHandler = () => {
        if (checkbox.checked) {
          const now = new Date();
          label.innerText = "(${readerName} approved as of " + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + ".)";
          // approvalData.setAttribute("value", true);
          dateData.setAttribute("value", now.toString());
        } else {
          label.innerText = "(${readerName} has not yet approved.)";
          // approvalData.setAttribute("value", false);
          dateData.removeAttribute("value");
        }
      }

      checkbox.addEventListener('change', changeHandler);
    }

    document.addEventListener('DOMContentLoaded', onLoad);
  `;
  el.setAttribute('nonce', opts.cspNonce);
  return el
}

module.exports = main


// TODO:
// email readers when form is submitted
// rework approval section