const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const approvalCheckboxRow = require('../common/approvalCheckboxRow')
const pseudoInput = require('../common/pseudoInput')
const signatureDropDown = require('../common/signatureDropDown')
const cancelEditButton = require('../common/cancelEditButton')
const { checkFormCompletion } = require('../../controllers/util')

const main = (opts) => {
  const { uploadSuccess, isComplete } = opts
  const title = 'CS13'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    isComplete ? null : pageScript(opts.cspNonce),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, hr, br, strong } = x
  return [
    h4(lastName, ', ', firstName),
    h3('Program Product Requirement'),
    h3('CS-13'),
    div(
      { class: 'text-left' },
      div('Program Product Definition: A program product is a piece of software that is developed for the use of people other than the developer and that is expected to be used and maintained by other developers after the initial developer is no longer working on it.'),
      x('p.underline.text-center')(
        br(), strong('Complete only the section that is most appropriate for your Program Product Requirement.'), br(),
      ),
      cs13Form(opts),
    )
  ]
}

const cs13Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, activeFaculty, isComplete } = opts
  const editAccess = admin || isStudent
  const { div, hr, strong, option, span, a, br } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const range4 = [0, 1, 2, 3]
  const disabled = editAccess ? {} : { disabled: true }
  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(student), hr(),

      x('h4.underline')('Comp 523'),
      row(
        colMd(2)(
          isComplete ? pseudoInput(form.comp523) : select(
            { name: 'comp523', required: true, ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.comp523 || null }, 'false'),
            option({ value: 'true', selected: form.comp523 || null }, 'true'),
          )
        ),
        colMd(10)('Or equivalent software engineering course. Syllabus must be provided.'),
      ), vert,

      div('COMP 523 Instructor Signature'),
      signatureDropDown(!isStudent, 'comp523', activeFaculty, opts, false),
      hr(),

      x('h4.underline')('Industry Experience'),
      row(
        colMd(2)(
          isComplete ? pseudoInput(form.hadJob) : select(
            { name: 'hadJob', required: true, ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.hadJob || null }, 'false'),
            option({ value: 'true', selected: form.hadJob || null }, 'true'),
          )
        ),
        colMd(10)('Student has spent at least 3 months in a software development job in an organization with an established development process and participated substantively in the development of a program product.'),
      ), vert,

      row(
        colMd(4)('Company, Development Experience, and Duration',),
        colMd(8)(
          isComplete ? pseudoInput(form.jobInfo) : x('textarea.form-control')(
            { name: 'jobInfo', rows: 6, ...disabled },
            form.jobInfo
          )
        ),
      ), vert,

      div('Advisor signature:'),
      approvalCheckboxRow(!isStudent, 'advisor', opts), hr(),

      x('h4.underline')('Alternative'),
      row(
        colMd(2)(
          isComplete ? pseudoInput(form.alternative) : select(
            { name: 'alternative', required: true, ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.alternative || null }, 'false'),
            option({ value: 'true', selected: form.alternative || null }, 'true'),
          )
        ),
        colMd(10)(
          'Student has developed a program product, as defined above, and has met the expectations of the client, including product delivery and documentation for both users and other developers. ',
          br(),
          'Note: two signatures are required below.'
        ),
      ), vert,

      row(colMd(12)('Product and Deliverables:')),
      isComplete ? pseudoInput(form.product) : row(colMd(12)(
        x('textarea.form-control')(
          { name: 'product', rows: 6, ...disabled },
          form.product
        )
      )), vert,

      row(
        colMd(2)('Client:'),
        colMd(4)(
          editAccess && !isComplete
            ? input('text', 'client', form.client, true)
            : pseudoInput(form.client)
        ),
        colMd(2)('Position:'),
        colMd(4)(
          editAccess && !isComplete
            ? input('text', 'position', form.position, true)
            : pseudoInput(form.position)
        ),
      ), vert,

      div('Signature #1:'),
      signatureDropDown(!isStudent, 'alt1', activeFaculty, opts, false), vert,
      // signatureRow(!isStudent, 'alt1', form), vert,

      div('Signature #2:'),
      signatureDropDown(!isStudent, 'alt2', activeFaculty, opts, false), vert,
      // signatureRow(!isStudent, 'alt2', form),

      [vert, isComplete ? null : x('button.btn.btn-primary.CS13-submit')({ type: 'submit' }, 'Submit')],
      cancelEditButton(isStudent ? null : student._id),
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

const pageScript = (nonce) => {
  const el = x('script')({ type: 'text/javascript' })
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText()
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute('nonce', nonce)
  return el
}

// Logic overview:
// When submitting, two conditions must be met.
// (1) Exactly one boolean "section enabled" select must be true.
// (2) All fields within the selected section must be filled out.
// We handle requirement (2) by toggling the required attribute of fields.

const pageScriptText = () => (`
  const getField = (name) => document.querySelector('[name=' + name + ']')
  const fieldTrue = (name) => getField(name).value == 'true'
  const maybeSetReq = (guard) => (field) => {
    const el = getField(field)
    if (el && !el.disabled) el.required = fieldTrue(guard)
  }

  const comp523Fields = ['comp523Signature', 'comp523DateSigned']
  const industryFields = ['jobInfo', 'advisorSignature', 'advisorDateSigned']
  const altFields = ['client', 'position', 'product', 'alt1Signature',
                     'alt1DateSigned', 'alt2Signature', 'alt2DateSigned']

  const updateRequiredAttrs = () => {
    comp523Fields.map(maybeSetReq('comp523'))
    industryFields.map(maybeSetReq('hadJob'))
    altFields.map(maybeSetReq('alternative'))
  }

  const oneSectionActive = () => {
    const [a, b, c] = ['comp523', 'hadJob', 'alternative'].map(fieldTrue)
    return ( a && !b && !c)
        || (!a &&  b && !c)
        || (!a && !b &&  c)
  }

  const ensureSectionActive = (event) => {
    if (oneSectionActive()) return true
    alert('Error: please set one section to true (and the rest to false)')
    event.preventDefault()
  }

  const setListeners = () => {
    document.querySelector('.cs-form [type=submit]').addEventListener('click', updateRequiredAttrs)
    document.querySelector('.cs-form').addEventListener('submit', ensureSectionActive)
    updateRequiredAttrs()
  }

  document.addEventListener('DOMContentLoaded', setListeners)
`)

module.exports = main
