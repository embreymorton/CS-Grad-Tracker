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

const main = (opts) => {
  const { uploadSuccess, formName} = opts
  const title = `${formName} Background Preparation Worksheet`
  const cs01 = formName === 'CS01'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    pageScript(opts)
  )
}

const mainContent = (opts) => {
  const { student, hasAccess, formName } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, p, strong, hr } = x
  const form = !hasAccess
        ? div('You do not have access')
        : cs01Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Background preparation worksheet'),
    h3(formName),
    div(
      { class: 'text-left' },
      x('p.underline')('Instructions:'),
      p('The following UNC courses define the background preparation assumed in the M.S. and PhD programs. This worksheet is intended to help identify possible missing areas in your preparation; it is entirely normal to include one or more background courses in the MS or PhD Program of Study in order to satisfy the background preparation requirement.'),
      p('For each course, indicate how (e.g. course work, independent study, or work experience) and when you mastered the materials as defined by the list of principal topics.  For additional information on UNC course content, consult the online syllabi.  In case you are uncertain about the adequacy of your preparation for a given course, consult a course instructor or the instructor(s) of graduate courses that depend on the course in question.'),
      p('If you mastered the materials through a method besides course work, please select the semester that includes the date of when you mastered the topic.'),
      p(strong('All fields required!')),
      hr(),
      form,
    )
  ]
}

const cs01Form = (opts) => {
  const { postMethod, student, form, isStudent, admin, formName, isComplete, semesters } = opts
  const { _id, lastName, firstName, pid } = student
  const { hr, div, h3, p, strong } = x
  const row = formRow(admin || (isStudent && !isComplete), form, semesters)
  return (
    x('form.cs-form#cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', _id.toString()),
      namePidRow(student), hr(),
      h3('Background Course Information'), x('.verticalSpace')(),

      [ row('comp283'), hr() ],
      [ row('comp210'), hr() ],
      [ row('comp311'), hr() ],
      [ row('comp455'), hr() ],

      row('comp421'), x('.verticalSpace')(),
      row('comp520'), x('.verticalSpace')(),
      row('comp530'), x('.verticalSpace')(),
      x('.text-center.bold')('(Any two of these three will suffice)'), hr(),

      row('comp524'), hr(),
      row('comp541'), hr(),
      [ row('comp550'), hr() ],
      [ row('math233'), hr() ],
      [ row('math381'), hr() ],
      [ row('math547'), hr() ],
      row('math661'), hr(),
      [ row('stat435'), hr() ],

      x('.text-center')(
        'Review this worksheet with your advisor and submit the completed worksheet to the Student Services Coordinator preferably in electronic form.  Hard copies also accepted.',
        strong('The worksheet is a component of the Program of Study for MS (CS-03) and/or PhD (CS-06).')
      ),
      hr(),

      p('Student Approval:'),
      signatureRow(admin || isStudent, 'student', form, opts.cspNonce),
      x('.verticalSpace')(),

      p('Advisor Approval:'),
      // signatureRow(admin, 'advisor', form, opts.cspNonce),
      approvalCheckboxRow(!isStudent, 'advisor', opts),
      x('.verticalSpace')(),

      buttonBarWrapper(
        isComplete ? null : x('button.btn.btn-primary.CS01-submit#submit-btn')(
          { type: 'submit' },
          'Submit'),
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

const formRow = (writeAccess, values, semesters) => (key) => {
  const { div } = x
  const coveredFieldName = `${key}Covered`
  const dateFieldName = `${key}Date`
  const isRequired = !(['comp421', 'comp520', 'comp530'].includes(key))
  const roValue = (name, type) => (pseudoInput(values[name]))
  const rwValue = (name, type) => (input(`${type}`, name, values[name], isRequired))
  const value = writeAccess ? rwValue : roValue
  return (
    row(
      colMd(4)(descriptions[key]),
      colMd(4)(
        div('Covered by:'),
        value(coveredFieldName, 'text'),
      ),
      colMd(4)(
        div('Semester:'),
        semesterDropdown(dateFieldName, values[dateFieldName], semesters, !writeAccess, {isRequired})
      ),
    )
  )
}

const pageScript = (opts) => {
  const script = x('script')({type: 'text/javascript'})
  const javascript = `
  document.addEventListener('DOMContentLoaded', () => {
    const keys = ['comp421', 'comp520', 'comp530']
    const coveredInputs = keys.map((key) => document.getElementsByName(key + 'Covered')[0])
    const dateInputs = keys.map((key) => document.getElementsByName(key + 'Date')[0])
    
    const inputChangeCheck = (event) => {
      if (event.submitter && event.submitter.id == "save-btn") {
        return
      }

      const complete = coveredInputs.map((covered, i) => covered.value.length > 0 && dateInputs[i].value.length > 0)
      if (complete.reduce((prev, curr) => prev + (curr ? 1 : 0), 0) >= 2) { // number of completes
        coveredInputs.concat(dateInputs).forEach((input) => input.required = false)
        return true
      } else {
        coveredInputs.concat(dateInputs).forEach((input) => input.required = true)
        return false
      }
    }
    coveredInputs.concat(dateInputs).forEach((input) => input.addEventListener('input', inputChangeCheck))
    document.getElementById('cs-form').onsubmit = inputChangeCheck
  })
  `
  script.innerHTML = javascript
  script.setAttribute('nonce', opts.cspNonce)
  return script
}

const { strong } = x
const descriptions = {
  comp283: [
    strong('COMP 283: Discrete Structures:'),
    ' Introduces discrete structures and the formal math used to establish their properties & those of algorithms that work with them.  Develops problem-solving skills through puzzles & applications central to CS. or ',
    strong('MATH 381: Discrete Mathematics'),
    ' (see below)'
  ],

  comp210: [
    strong('COMP 210:  Data Structures:'),
    ' The analysis of data structures and their associated algorithms.  Abstract data types, lists, stacks, queues, trees, and graphs.'
  ],

  comp311: [
    strong('COMP 311: Computer Organization:'),
    ' Data respresentation, computer architecture and implementation, assembly language programming.'
  ],

  comp455: [
    strong('COMP 455:  Models of Languages & Computation:'),
    ' Introduction to the theory of computation.  Boolean functions, finite automata, pushdown automata, & Turing machines.  Unsolvable problems.  The Chomsky hierarchy of formal languages & their acceptors.  Parsing.'
  ],

  comp520: [
    strong('*COMP 520: Compilers:'),
    ' Design and construction of compilers. Theory and pragmatics of lexical, syntactic, and semantic analysis. Interpretation. Code generation for a modern architecture. Run-time environments. Includes a large compiler implementation project.'
  ],

  comp421: [
    strong('*COMP 421:  Files & Databases:'),
    ' Placement of data on secondary storage.  File organization.  Database history, practice, major models, system structure and design.'
  ],

  comp524: [
    strong('COMP: 524:  Programming Language Concepts:'),
    ' Concepts of high-level programming & their realization in specific languages.  Data types, scope, control structures, procedural abstraction, classes, concurrency.  Run-time implementation.'
  ],

  comp530: [
    strong('*COMP 530: Operating Systems:'),
    ' Types of operating systems. Concurrent programming. Management of storage, processes, devices. Scheduling, protection. Case study. Course includes a programming laboratory. Honors version available.'
  ],

  comp541: [
    strong('COMP 541:  Digital Logic & Computer Design:'),
    ' Digital logic, both combinational & sequential. State machines.  The structure & electronic design of modern processors.'
  ],

  comp550: [
    strong('COMP 550:  Algorithms & Analysis:'),
    ' Formal specification and verification of programs.  Techniques of algorithm analysis.  Problem-Solving paradigms.'
  ],

  math233: [
    strong('MATH 233:  Calculus of Functions of Several Variables:'),
    ' Vector algebra, solid analytic geometry, partial derivatives, multiple integrals.'
  ],

  math381: [
    strong('MATH 381:  Discrete Mathematics:'),
    ' Topics from the foundations of mathematics; logic, set theory, relations & functions, induction, permutations & combinations, recurrence. or ',
    strong('COMP 283:  Discrete Structures'),
  ],

  math547: [
    strong('MATH 547:  Linear Algebra for Applications:'),
    ' Algebra of matrices with applications; determinants; solution of linear systems by Gaussian elimination; Gram-Schmidt procedure; eigenvalues.  Math 116 may not be taken for credit after credit has been granted for Math 147.'
  ],

  math661: [
    strong('MATH 661:  Introduction to Numerical Analysis:'),
    " Error in computation; solution of nonlinear equations; interpolation; approximation of functions; Fourier methods; numerical integration & differentiation; introduction to numerical solution of ODE's; introductions to numerical linear algebra."
  ],

  stat435: [
    strong('STAT 435:  Introduction to Probability (MATH 535):'),
    ' Introduction to mathematical theory of probability covering random variables, moments, binomial, Poisson, normal & related distributions, generating functions, sums & sequences of random variables, & statistical applications.'
  ],
}

module.exports = main
