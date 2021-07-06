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
  const title = 'CS03 M.S. Program of Study'
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
        : cs03Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('M.S. Program of Study'),
    h3('CS-03'),
    div(
      { style: { 'text-align': 'left' }},
      hr(),
      form,
    )
  ]
}

const cs03Form = (opts) => {
  const { postMethod, student, form, admin, isStudent } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const basisForWaiverLabel = [
    div('Basis for Waiver'),
    div('Options: Prior course work, More Advanced Course Here, Other'),
  ]
  const range13 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(opts, editAccess), hr(),
      div(
        'Instructions:  This form details an individual program of study for the MS Degree.  It should be filed with the Student Services Manager when the program is substantially planned ',
        strong('(typically after two semesters)'),
        ', and can be amended subsequently. Forms mentioned in this program of study can be filed separately and at a later date.',
      ),
      strong('All fields except Reason of Disapproval required!'), vert,

      strong('I. Course Requirement'),
      div('  - Minimum 30 hours total of courses conferring graduate credit, including courses transferred from UNC-CH Continuing Education or another institution.  Courses transferred in must be approved by and on file with the Graduate School.'),
      div('  - Minimum 18 hours of COMP courses. '),
      div('  - Minimum 3 hours of COMP 992 or COMP 993 (formal thesis) - maximum of 6 hours. '),
      div('  - If a minor is elected, see Graduate School Handbook (http://handbook.unc.edu/preface.html)'),
      div('List the courses you expect to use to meet the MS requirements.  Include Section Number for COMP 790 and COMP 990-993 courses.  Do NOT list research team meeting seminars.  Indicate courses used to satisfy the distribution requirement with a mark in the Dist column.'),
      row(
        colMd(4)('A = Applications'),
        colMd(4)('S = Systems & Hardware'),
        colMd(4)('T = Theory & Formal Thinking'),
      ),
      hr(),

      row(
        colMd(1)(
          div('Dist'),
          range13.map((i) => (
            input('text', 'DR', form.DR && form.DR[i])
          ))
        ),
        colMd(2)(
          div('University'),
          range13.map((i) => (
            input('text', 'university', 'UNC-CH')
          ))
        ),
        colMd(1)(
          div('Department'),
          range13.map((i) => (
            input('text', 'dept', 'COMP')
          ))
        ),
        colMd(2)(
          div('Course'),
          range13.map((i) => (
            input('text', 'course', form.course && form.course[i])
          ))
        ),
        colMd(1)(
          div('Hours'),
          range13.map((i) => (
            input('number', 'hours', form.hours && form.hours[i])
          ))
        ),
        colMd(2)(
          div('Semester'),
          range13.map((i) => (
            input('text', 'semester', form.semester && form.semester[i])
          ))
        ),
        colMd(3)(
          div('Brief Title'),
          range13.map((i) => (
            input('text', 'title', form.title && form.title[i])
          ))
        ),
      ),
      hr(),

      strong('II. Additional Requirements'),
      div('A. Background Preparation'),
      row(
        colMd(3)(
          select(
            { name: 'backgroundPrep', required: 'true' },
            option({ value: form.backgroundPrep }, form.backgroundPrep),
            option({ value: 'false' }, 'Did not file CS01'),
            option({ value: 'true' }, 'Filed CS01'),
          ),
        ),
        colMd(2)('File Form CS-01')
      ),

      div('B. Distribution Requirements'),
      div('Indicate the three courses in the Course List used to satisfy the breadth requirement (consult the official MS degree rule for eligible courses and grade requirements - http://www.cs.unc.edu/cms/academics/graduate-programs/master-of-science-official-degree-requirements ) '),

      div('C. Program Product'),
      row(
        colMd(3)(
          select(
            { name: 'programProduct', required: 'true' },
            option({ value: form.programProduct }, form.programProduct),
            option({ value: 'false' }, 'Did not file CS13'),
            option({ value: 'true' }, 'Filed CS13')
          ),
        ),
        colMd(2)(
          div('File Form CS-13'),
        ),
      ),

      div('D. Writing Requirement(One of the following)'),
      row(
        colMd(3)(
          select(
            { name: 'comprehensivePaper', required: 'true' },
            option({ value: form.comprehensivePaper }, form.comprehensivePaper),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True')
          ),
        ),
        colMd(4)(
          div('Comprehensive Paper (CS-08)')
        ),
      ),
      row(
        colMd(3)(
          select(
            { name: 'thesis', required: 'true' },
            option({ value: form.thesis }, form.thesis),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True')
          ),
        ),
        colMd(2)(
          div('Thesis (CS-05)')
        ),
      ),
      row(
        colMd(3)(
          select(
            { name: 'outsideReview', required: 'true' },
            option({ value: form.outsideReview }, form.outsideReview),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True')
          ),
        ),
        colMd(2)(
          div('Outside Review (CS-04)')
        ),
      ),
      hr(),

      strong('III. Comprehensive Exam'),
      row(
        colMd(3)(
          select(
            { name: 'comprehensiveExam', required: 'true' },
            option({ value: form.comprehensiveExam }, form.comprehensiveExam),
            option({ value: 'Comprehensive Paper' }, 'Comprehensive Paper (CS-08)'),
            option({ value: 'MS Oral Comprehensive Exam' }, 'MS Oral Comprehensive Exam')
          )
        )
      ),
      hr(),

      strong('IV. Signatures'),
      div('Student signature:'),
      signatureRow(admin || isStudent, 'student', form), vert,
      div('Advisor signature:'),
      signatureRow(admin, 'advisor', form), hr(),

      div('Approved:'),
      row(
        colMd(3)(
          isStudent
            ? form.approved
            : select(
              { name: 'approved', required: 'true' },
              option({ value: form.approved }, form.approved),
              option({ value: 'Approved by Graduate Studies Committee' }, 'Approved by Graduate Studies Committee'),
              option({ value: 'Disapproved' }, 'Disapproved'),
            )
        )
      ),

      div('Reason of Disapproval:'),
      row(
        colMd(4)(
          isStudent
            ? form.approvalReason
            : x('textarea.form-control')(
              { rows: 6, name: 'approvalReason' },
              form.approvalReason,
            )
        )
      ),
      hr(),

      div('Director signature:'),
      signatureRow(admin, 'director', form),

      editAccess
        ? x('button.btn.btn-primary.CS03-submit')({ type: 'submit' }, 'Submit')
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
