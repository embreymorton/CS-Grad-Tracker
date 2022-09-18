const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const approvalCheckbox = require('../common/approvalCheckboxRow')
const pseudoInput = require('../common/pseudoInput')
const signatureDropDown = require('../common/signatureDropDown')
const cancelEditButton = require('../common/cancelEditButton')
const { is } = require('bluebird')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')
const {dropdown, makeOption} = require('../common/dropdown')
const pseudoCheckbox = require('../common/pseudoCheckbox')
const radio = require('../common/radio')
let complete = false

const vert = x('div.verticalSpace')()

const main = (opts) => {
  const { uploadSuccess, isComplete} = opts
  complete = isComplete
  const title = 'Semesterly Progress Report'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess, isStudent, seeAllSubmissions } = opts
  const { lastName, firstName } = student
  const { h6, h5, h4, h3, div, strong, hr, a } = x
  const form = !hasAccess
        ? div('You do not have access')
        : progressReportForm(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Semester Progress Report'),
    a({href: seeAllSubmissions, class: 'btn btn-primary'}, 'See More Submissions'),
    div(
      { class: 'text-left' },
      div('Please discuss your semester goals and milestones with your advisor. Fill out this form with as much details as you can. Below is a recommended/typical timeline with some major milestones for your reference:'),
      h5(strong('Recommended Milestones:')),
      milestoneBullets('By the end of semester 4', ['Gain admission to PhD candidacy through PRP and faculty vote.']),
      milestoneBullets('By the end of semester 5', ['Discuss research plan with at least three (potential) committee members; submit form CS-12.']),
      milestoneBullets('By the end of semester 6', ['Name the remaining members of the doctoral committee (Graduate School form).', 'Submit Plan of Study (Form CS-06) with background preparation (Form CS-01) approved by the committee.']),
      milestoneBullets('By the end of semester 7', ['Submit a dissertation proposal to the committee; hold meeting for approval of proposal,', 'OR Pass the Doctoral Oral examination.']),
      milestoneBullets('By the end of semester 8', ['Submit disseration proposal AND pass the Doctoral Oral examination.', 'Apply for Admission to Candidacy for a Doctoral Degree (Graduate School form).']),
      milestoneBullets('At any time', ['Satisfy the program product requirement: submit Form CS-13.', 'Satisfy the teach requirement: submit Form CS-11', 'Submit course waiver forms as appropriate.']),
      milestoneBullets('Every six months after approval of the dissertation proposal', ['Meet with the committee to discuss dissertation progress.']),
      milestoneBullets('By the end of semester 10', ['When dissertation is in substantially finished form, announce dissertation defense, giving two weeks\'s notice.', 'Pass Final Oral examination (dissertation defense).', 'Submit completed and signed dissertation to the Graduate School.']),
      form
    ),
    div(
      ' ' // <-- nbsp character
    ),
    h4(),
    h3('Student Semester Progress Evaluation'),
    div(
      { class: 'text-left' },
      div('Faculty members,'),
      div('Please fill out this form for each student you are supervising. The recommended milestones of a graduate students are described above.'),
      evaluationForm(opts)
    )
  ]
}

const milestoneBullets = (title, listOfBullets) => {
  const {ul, li, strong} = x
  return [
    strong(title),
    ul(
      listOfBullets.map((bulletText) => li(bulletText))
    )
    ]
}

const progressReportForm = (opts) => {
  const { postMethod, student, form, admin, isStudent, activeFaculty, isComplete, semesters } = opts
  const editAccess = admin || isStudent
  const frow = textareaRow(form, editAccess)
  const { courseNumber, basisWaiver } = form
  const { div, hr } = x
  return (
    x('form.cs-form#cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(opts, editAccess), 
      hr(),
      div('Choose the semester you are filling this form for:'),
      row(
        colMd(6)(
          dropdown('semester', 
            semesters.map((semester) => makeOption(semester._id.toString(), semester.semesterString, form.semester?._id.equals(semester._id))), 
            {
              isDisabled: isComplete, 
              blankOption: 'Select a semester from the dropdown.'
            }
          )
        )
      ),
      hr(),
      frow(div('Q1: What progress did you make this semester (or since your last progress report)? Please include any milestones completed, papers submitted, or other gneral progress made.'), 'progressMade', 8), 
      vert,
      frow(div('Q2: What are your goals/plans for next semester (including summers)?'), 'goals', 8), 
      vert,
      frow(div('Q3: List your prefrences for RA/TA positions next semester:'), 'rataPreferences', 8), 
      vert,
      hr(),
      // div('Advisor Signature:'),
      // approvalCheckbox(!isStudent, 'advisor', opts),
      // vert,
      // div('Designated Instructor Signature:'),
      // signatureDropDown(!isStudent, 'instructor', activeFaculty, opts),
      buttonBarWrapper(
        isComplete ? null : x('button.btn.btn-primary.CS02-submit#submit-btn')('Submit'),
        disableSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  )
}

const namePidRow = (opts, editAccess) => {
  const { student, form, isComplete } = opts
  const { lastName, firstName, pid } = student
  const name = `${lastName}, ${firstName}`
  const { div } = x
  const value = editAccess && !isComplete
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(6)(
        div('Name'),
        pseudoInput(name)
      ),
      colMd(6)(
        div('PID'),
        pseudoInput(pid)
      )
    )
  )
}

const rowCol = (width, ...inside) => row(colMd(width)(...inside))

const formRow = (values, editAccess, type = 'text') => (label, name, width = 6) => {
  const value = editAccess && !complete
        ? input(type, name, values[name], true)
        : (type == 'checkbox' ? pseudoCheckbox(values[name]) : pseudoInput(values[name]))
  return (
    row(
      colMd(width)(
        label,
        value,
      )
    )
  )
}

/**
 * A function that returns a function that creates rows for textarea user input.
 * Why? Because if there is no editAccess to the form, then user input rows
 * can only create "pseudoInputs" which are uneditable. 
 */
const textareaRow = (form, editAccess) => (label, name, width, required = true) => {
  const disabledTag = editAccess && !complete ? {} : { disabled: true } // html disabled attribute is unary
  const textarea = x('textarea.form-control')(
    { rows: width, name, required, ...disabledTag},
    form[name]
  )
  return row(
    colMd(width)(
      label,
      textarea
    )
  )
}

const evaluationForm = (opts) => {
  const { form, admin, isStudent } = opts
  const editAccess = admin || isStudent
  const checkboxFrow = formRow(form, editAccess, 'checkbox')
  const { hr } = x

  return x('form#evaluate-form.cs-form')(
    hr(),
    checkboxFrow(
      'Q1. I have read the student progress report filled out by the student, and have discussed its contents with them.',
      'hasDicussed', 12
    ),
    rowCol(12,
      "Q2. How would you rate the student's progress on their 'academic' goals? Please refer to the recommended/typical timeline for major milestones.",
      radio('academicRating', 4, '4: EXCELLENT: The student\'s progress exceeds expectations.'),
      radio('academicRating', 3, '3: FINE: The student made normal progress.'),
      radio('academicRating', 2, '2: WEAK: The student made lower than expected progress, but I and the student have made a plan to remedy it.'),
      radio('academicRating', 1, '1: POOR: The student has not been making sufficient progress, and should be put on probation.'),
    )
  )
  
} 


module.exports = main
