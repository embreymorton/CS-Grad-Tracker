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
  const title = 'CS09 REPORT OF PRELIMINARY RESEARCH PRESENTATION'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    bootstrapScripts(),
    pageScript(opts.cspNonce),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, hr } = x
  return [
    h4(lastName, ', ', firstName),
    h3('REPORT OF PRELIMINARY RESEARCH PRESENTATION'),
    h3('CS-09'),
    hr(),
    div(
      { class: 'text-left' },
      cs09Form(opts),
    )
  ]
}

const cs09Form = (opts) => {
  const { postMethod, student, form, admin, isStudent } = opts
  const editAccess = admin || isStudent
  const { div, hr, strong, option, span, a } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const range4 = [0, 1, 2, 3]
  const disabled = editAccess ? {} : { disabled: true }

  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(opts, editAccess),

      strong('Instructions:'),
      div('This  form  has  three  parts.  Part  1  must  be  completed  by the student and submitted to the Student Services Manager two weeks prior to their exam. The student must also email a scanned copy of the form to his/her PRP committee. Parts 2 and 3 should be completed by the committee on the exam day.'),
      hr(),

      strong('Part 1. Information about the PRP research'),
      row(
        colMd(2)('Title of PRP topic:*'),
        colMd(6)(
          editAccess
            ? input('text', 'prpTitle', form.prpTitle, true)
            : pseudoInput(form.prpTitle)
        )
      ), vert,

      row(
        colMd(2)('Research Advisor:*'),
        colMd(6)(
          editAccess
            ? input('text', 'researchAdvisor', form.researchAdvisor, true)
            : pseudoInput(form.researchAdvisor)
        )
      ), vert,

      row(
        colMd(6)('Has this PRP topic already been submitted to a peer-reviewed conference or journal? *'),
        colMd(2)(
          select(
            { name: 'peerReviewed', required: editAccess, ...disabled },
            option({ value: form.peerReviewed }, form.peerReviewed),
            option({ value: 'Yes' }, 'Yes'),
            option({ value: 'No' }, 'No'),
          )
        )
      ), vert,

      row(
        colMd(2)('If yes, give the full author list:'),
        colMd(6)(
          editAccess
            ? input('text', 'authors', form.authors)
            : pseudoInput(form.authors)
        )
      ), vert,

      row(
        colMd(2)('If yes, was the paper accepted:'),
        colMd(2)(
          select(
            { name: 'paperAccepted', ...disabled },
            option({ value: form.paperAccepted }, form.paperAccepted),
            option({ value: 'Yes' }, 'Yes'),
            option({ value: 'No' }, 'No'),
          )
        ),
        colMd(2)('Notification Date:'),
        colMd(2)(
          editAccess
            ? input('text', 'paperNotifyDate', form.paperNotifyDate)
            : pseudoInput(form.paperNotifyDate)
        )
      ), vert,

      row(
        colMd(6)('Are reviews currently available to your committee, or will they become available prior to the presentation?*'),
        colMd(2)(
          select(
            { name: 'reviewsAvailable', required: editAccess, ...disabled },
            option({ value: form.reviewsAvailable }, form.reviewsAvailable),
            option({ value: 'Yes' }, 'Yes'),
            option({ value: 'No' }, 'No'),
          )
        )
      ), vert,

      div('What part of the research were you responsible for?*'),
      colMd(4)(
        x('textarea.form-control')(
          { name: 'researchResponsible', rows: 6, required: editAccess, ...disabled },
          form.researchResponsible
        )
      ), vert,

      row(
        colMd(6)('Will you present the entire project, or just your contribution?*'),
        colMd(2)(
          editAccess
            ? input('text', 'present', form.present, true)
            : pseudoInput(form.present)
        )
      ), hr(),

      strong('Advisor Section:'),
      div("I have reviewed the PRP report and will review the student's PRP presentation."),
      div('Research Advisor Signature*'),
      signatureRow(admin, 'advisor', form), hr(),

      strong('Part 2. Each of us has read ( and reviewed in writing) the PRP Report.'), vert,
      strong('Committee Members'),
      row(
        colMd(5)(
          admin ? x('em')('In place of your signature, please type your full legal name:') : 'Signature*'
        ),
        colMd(2)('Date:*')
      ),
      row(
        colMd(5)(
          range4.map((i) => (
            admin
              ? input('text', 'committeeSignature', form.committeeSignature && form.committeeSignature[i], true)
              : div(form.committeeSignature && form.committeeSignature[i] || '-')
          ))
        ),
        colMd(2)(
          range4.map((i) => (
            admin
              ? input('text', 'committeeDateSigned', form.committeeDateSigned && form.committeeDateSigned[i], true)
              : div(form.committeeDateSigned && form.committeeDateSigned[i] || '-')
          ))
        )
      ), hr(),

      strong('Part 3. PRP Committee Joint Report'),
      row(
        colMd(4)('Preliminary research presentation date*:'),
        colMd(2)(
          editAccess
            ? input('text', 'presentationDate', form.presentationDate, true)
            : form.presentationDate
        )
      ), vert,

      x('div#sliders')(
        sliderRow(form, admin, 'Integration of concepts*', 'conceptIntegration'),
        sliderRow(form, admin, 'Creativity*', 'creativity'),
        sliderRow(form, admin, 'Clarity*', 'clarity'),
        sliderRow(form, admin, 'Abstraction and formality*', 'abstractionFormality'),
        sliderRow(form, admin, 'Organization*', 'organization'),
        sliderRow(form, admin, 'Writing*', 'writing'),
        sliderRow(form, admin, 'Presentation*', 'presentation'),
        sliderRow(form, admin, 'Answering questions*', 'answeringQuestion'), vert,
        sliderRow(form, admin, 'Overall Score*', 'overallScore'),
      ),

      div(strong('Feedback on Research, Presentation, and Paper:')),
      colMd(4)(
        x('textarea.form-control')(
          { name: 'feedback', rows: 6, ...disabled },
          form.feedback
        )
      ),

      editAccess
        ? [
          vert,
          x('button.btn.btn-primary.CS09-submit')({ type: 'submit' }, 'Submit')
        ]
      : null,
    )
  )
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
        div('Name*'),
        value('text', 'name', name)
      ),
      colMd(6)(
        div('PID*'),
        value('number', 'pid', pid)
      ),
    )
  )
}

const sliderRow = (form, editAccess, label, field) => (
  x('div.row.text-center')(
    colMd(3)(label),
    colMd(5)(
      editAccess
        ? input('range', field, form[field], true, null,
                { min: '-3', max: '3', step: '.25' })
        : form[field]
    ),
    x('div.col-md-2.slider-label')(form[field] || '0')
  )
)

const pageScript = (nonce) => {
  const el = x('script')({ type: 'text/javascript' })
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText()
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute('nonce', nonce)
  return el
}

const pageScriptText = () => (`
  const setRangeListeners = () => {
    document.querySelectorAll('input[type=range]').forEach((input, index) => {
      input.addEventListener('input', ({ target }) => {
        updateLabel(target, index)
      })
    })
    updateAllLabels()
  }

  const updateLabel = (rangeInputEl, index) => {
    document.querySelectorAll('.slider-label')[index].innerHTML = rangeInputEl.value
  }

  const updateAllLabels = () => {
    document.querySelectorAll('input[type=range]').forEach(updateLabel)
  }

  document.addEventListener('DOMContentLoaded', setRangeListeners)
`)

module.exports = main
