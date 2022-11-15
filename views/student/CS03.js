const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const approvalCheckboxRow = require('../common/approvalCheckboxRow')
const pseudoInput = require('../common/pseudoInput')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')
const { semesterDropdown } = require('../common/semesterDropdown')
const adminApprovalCheckboxRow = require('../common/adminApprovalCheckboxRow')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS03 M.S. Program of Study'
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
        : cs03Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('M.S. Program of Study'),
    h3('CS-03'),
    div(
      { class: 'text-left' },
      hr(),
      form,
    )
  ]
}

const cs03Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, isComplete, semesters, viewer } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option, a, p, span } = x
  const select = x('select.form-control')
  const approvedGSCText = 'Approved by Graduate Studies Committee'
  const vert = x('div.verticalSpace')()
  const basisForWaiverLabel = [
    div('Basis for Waiver'),
    div('Options: Prior course work, More Advanced Course Here, Other'),
  ]
  const range = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const disabled = editAccess && !isComplete ? {} : { disabled: true }

  const distRow = (label, form, i, {editAccess, isComplete}) => {
    return [
      row(
        colMd(12)(
          x('div')(label)
        )
      ),
      row(
        colMd(2)(
          div('University'),
          editAccess && !isComplete
            ? input('text', 'university', form.university && form.university[i])
            : pseudoInput(form.university && form.university[i])
        ),
        colMd(1)(
          div('Department'),
          editAccess && !isComplete
            ? input('text', 'dept', form.dept && form.dept[i])
            : pseudoInput(form.dept && form.dept[i])
        ),
        colMd(1)(
          div('Course'),
          editAccess && !isComplete
            ? input('text', 'course', form.course && form.course[i])
            : pseudoInput(form.course && form.course[i])
        ),
        colMd(1)(
          div('Hours'),
          editAccess && !isComplete
            ? input('number', 'hours', form.hours && form.hours[i])
            : pseudoInput(form.hours && form.hours[i])
        ),
        colMd(1)(
          div('Semester'),
          semesterDropdown('semester', form.semester && form.semester[i]?._id, semesters, !editAccess || isComplete, {isRequired: false, placeholder: 'None selected.'})
        ),
        colMd(3)(
          div('Brief Title'),
          editAccess && !isComplete
            ? input('text', 'title', form.title && form.title[i])
            : pseudoInput(form.title && form.title[i])
        ),
        colMd(1)(
          div('Grade'),
          editAccess && !isComplete
            ? select({ name: 'grade' },
                option({ value: '', selected: form.grade && form.grade[i] || null }, ''),
                option({ value: 'H', selected: form.grade && form.grade[i] == 'H' || null }, 'H'),
                option({ value: 'P', selected: form.grade && form.grade[i] == 'P' || null }, 'P'),
                option({ value: 'L', selected: form.grade && form.grade[i] == 'L' || null }, 'L'),
                option({ value: 'F', selected: form.grade && form.grade[i] == 'F' || null }, 'F')
              )
            : pseudoInput(form.grade && form.grade[i])
        ),
        colMd(1)(
          div('Modifier'),
          admin
            ? select({ name: 'gradeModifier' },
                option({ value: '', selected: form.gradeModifier && form.gradeModifier[i] || null }, ''),
                option({ value: '+', selected: form.gradeModifier && form.gradeModifier[i] == '+' || null }, '+'),
                option({ value: '-', selected: form.gradeModifier && form.gradeModifier[i] == '-' || null }, '-')
              )
            : pseudoInput(form.gradeModifier && form.gradeModifier[i])
        )
      ), 
      hr]
    }

    return (
      x('form.cs-form#cs-form')(
        { action: postMethod, method: 'post' },
        input('hidden', 'student', student._id.toString()),
        namePidRow(student), hr(),
        div(
          'Instructions:  This form details an individual program of study for the MS Degree.  It should be filed with the Student Services Manager when the program is substantially planned ',
          strong('(typically after two semesters)'),
          ', and can be amended subsequently. Forms mentioned in this program of study can be filed separately and at a later date.',
        ),
        strong('All fields except Reason of Disapproval required!'), vert,

        strong('I. Course Requirement'),
        div("Thirty (30) semester hours of courses numbered 400 or higher must be taken (excluding COMP 495, 496, 691H, 692H). Of these 30 hours, at least 18 hours must be in Computer Science (designated COMP in the catalog) numbered 400-890, and the remaining 12 hours must include COMP 993: Master's Thesis Research or COMP 992: MS Non-Thesis Option."),
        div('Residence credit- minimum number of required semesters of UNC-Chapel Hill registration, 9 or more credit hours earn a full semester of residence, 6 to 8.9 credit hours earn three-fourths semester of residence, 3 to 5.9 credit hours earn one-half semester of residence. 0 to 2.9 credit hours earn one-fourth semester of residence.',
          a(
            {href: 'https://handbook.unc.edu/residencecredit.html' },
            ' Residence Credit'
            ),
        ),
        div('The student’s mastery of content will be determined by the course grade in the set of three courses: a P- or better must be obtained in each course, and a Calingaert score of -3 or higher must be obtained on the three courses combined.',
            a(
              { href: 'https://cs.unc.edu/academics/graduate/ms-requirements/' },
              ' MS-Requirements'
              ),
        ),
        div('Transfer of credit- Up to 6 semester hours of graduate credit may be transferred from another accredited institution, or from courses taken at UNC-CH before admission to the Graduate School.',
              a(
                { href: 'https://gradschool.unc.edu/pdf/wtrnform.pdf '},
                ' Please submit this form along with the CS-03.'
              ),
        ),
        div('Minimum 3 hours of COMP 992 or COMP 993 (formal thesis) - maximum of 6 hours.'
        ),
        div(
          'If a minor is elected, see the ',
          a(
            { href: 'http://handbook.unc.edu/preface.html' },
            'Graduate School Handbook'
          ),
          '.'),
        div('List the courses you expect to use to meet the MS requirements.  Include Section Number for COMP 790 and COMP 990-993 courses.  Do NOT list research team meeting seminars.  Indicate courses used to satisfy the distribution requirement with a mark in the DR column.'),
        row(
          colMd(4)('A = Applications'),
          colMd(4)('S = Systems & Hardware'),
          colMd(4)('T = Theory & Formal Thinking'),
        ), hr(),
        distRow('Applications:', form, 0, {editAccess, isComplete}),
        distRow('Systems & Hardware:', form, 1, {editAccess, isComplete}),
        distRow('Theory & Formal Thinking:', form, 2, {editAccess, isComplete}),
        row(
          colMd(2)(
            div('University'),
            range.map((i) => (
              editAccess && !isComplete
                ? input('text', 'university', form.university && form.university[i])
                : pseudoInput(form.university && form.university[i])
            ))
          ),
          colMd(1)(
            div('Department'),
            range.map((i) => (
              editAccess && !isComplete
                ? input('text', 'dept', form.dept && form.dept[i])
                : pseudoInput(form.dept && form.dept[i])
            ))
          ),
          colMd(2)(
            div('Course'),
            range.map((i) => (
              editAccess && !isComplete
                ? input('text', 'course', form.course && form.course[i])
                : pseudoInput(form.course && form.course[i])
            ))
          ),
          colMd(1)(
            div('Hours'),
            range.map((i) => (
              editAccess && !isComplete
                ? input('number', 'hours', form.hours && form.hours[i])
                : pseudoInput(form.hours && form.hours[i])
            ))
          ),
          colMd(2)(
            div('Semester'),
            range.map((i) => semesterDropdown('semester', form.semester && form.semester[i]?._id, semesters, !editAccess || isComplete, {isRequired: false, placeholder: 'None selected.'}))
            // range.map((i) => (
            //   editAccess && !isComplete
            //     ? input('text', 'semester', form.semester && form.semester[i])
            //     : pseudoInput(form.semester && form.semester[i])
            // ))
          ),
          colMd(3)(
            div('Brief Title'),
            range.map((i) => (
              editAccess && !isComplete
                ? input('text', 'title', form.title && form.title[i])
                : pseudoInput(form.title && form.title[i])
            ))
          ),
        ),
      hr(),

      strong('II. Additional Requirements'),
      div('A. Background Preparation'),
      row(
        colMd(3)(
          select(
            { name: 'backgroundPrep', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.backgroundPrep || null }, 'Did not file CS01'),
            option({ value: 'true', selected: form.backgroundPrep || null }, 'Filed CS01'),
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
            { name: 'programProduct', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.programProduct || null }, 'Did not file CS13'),
            option({ value: 'true', selected: form.programProduct || null }, 'Filed CS13'),
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
            { name: 'comprehensivePaper', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.comprehensivePaper || null }, 'false'),
            option({ value: 'true', selected: form.comprehensivePaper || null }, 'true'),
          ),
        ),
        colMd(4)(
          div('Comprehensive Paper (CS-08)')
        ),
      ),
      row(
        colMd(3)(
          select(
            { name: 'thesis', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.thesis || null }, 'false'),
            option({ value: 'true', selected: form.thesis || null }, 'true'),
          ),
        ),
        colMd(2)(
          div('Thesis (CS-05)')
        ),
      ),
      row(
        colMd(3)(
          select(
            { name: 'outsideReview', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'false', selected: !form.outsideReview || null }, 'false'),
            option({ value: 'true', selected: form.outsideReview || null }, 'true'),
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
            { name: 'comprehensiveExam', required: 'true', ...disabled },
            option({ value: '' }, ''),
            option({ value: 'Comprehensive Paper', selected: form.comprehensiveExam == 'Comprehensive Paper' || null }, 'Comprehensive Paper (CS-08)'),
            option({ value: 'MS Oral Comprehensive Exam', selected: form.comprehensiveExam == 'MS Oral Comprehensive Exam' || null }, 'MS Oral Comprehensive Exam'),
          )
        )
      ),
      hr(),

      strong('IV. Approvals'),
      div('Student Approval:'),
      signatureRow(admin || isStudent, 'student', form, opts.cspNonce), vert,
      div('Advisor Approval:'),
      approvalCheckboxRow(!isStudent, 'advisor', opts), hr(),

      div('Approved:'),
      row(
        colMd(6)(
          isStudent
            ? span(form.approved)
            : select(
              { name: 'approved', required: 'true', ...disabled },
              option({ value: '' }, ''),
              option({ value: approvedGSCText, selected: form.approved == approvedGSCText || null }, approvedGSCText),
              option({ value: 'Disapproved', selected: form.approved == 'Disapproved' || null }, 'Disapproved'),
            )
        )
      ),

      div('Reason of Disapproval:'),
      row(
        colMd(6)(
          isStudent
            ? span(form.approvalReason)
            : x('textarea.form-control')(
              { rows: 6, name: 'approvalReason', ...disabled },
              form.approvalReason,
            )
        )
      ),
      hr(),

      div('Director Approval:'),
      adminApprovalCheckboxRow(viewer, 'director', form, opts.cspNonce),
      buttonBarWrapper(
        isComplete ? null : x('button.btn.btn-primary.CS03-submit#submit-btn')({ type: 'submit' }, 'Submit'),
        disableSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
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

module.exports = main
