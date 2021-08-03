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
  const { uploadSuccess, formName } = opts
  const title = `${formName} Background Preparation Worksheet`
  const cs01 = formName === 'CS01'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    bootstrapScripts(),
    cs01 ? refreshRequiredScript() : null,
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
      p('The following UNC courses define the background preparation assumed in the M.S. and PhD programs.  This worksheet is intended to help identify possible missing areas in your preparation; it is entirely normal to include one or more background courses in the MS or PhD Program of Study in order to satisfy the background preparation requirement.'),
      p('For each course, indicate how (e.g. course work, independent study, or work experience) and when you mastered the materials as defined by the list of principal topics.  For additional information on UNC course content, consult the online syllabi.  In case you are uncertain about the adequacy of your preparation for a given course, consult a course instructor or the instructor(s) of graduate courses that depend on the course in question.'),
      p(strong('All fields required!')),
      hr(),
      form,
    )
  ]
}

const cs01Form = (opts) => {
  const { postMethod, student, form, isStudent, admin, formName } = opts
  const { _id, lastName, firstName, pid } = student
  const { hr, div, h3, p, strong } = x
  const row = formRow(admin || isStudent, form)
  const bsms = formName !== 'CS01'
  return (
    x('form.cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', _id.toString()),
      namePidRow(student), hr(),
      h3('Background Course Information'), x('.verticalSpace')(),

      bsms ? null : [ row('comp283'), hr() ],
      bsms ? null : [ row('comp410'), hr() ],
      bsms ? null : [ row('comp411'), hr() ],
      bsms ? null : [ row('comp455'), hr() ],

      row('comp521'), x('.verticalSpace')(),
      row('comp520'), x('.verticalSpace')(),
      row('comp530'), x('.verticalSpace')(),
      x('.text-center')('(*Any two of these three will suffice*)'), hr(),

      row('comp524'), hr(),
      row('comp541'), hr(),
      bsms ? null : [ row('comp550'), hr() ],
      bsms ? null : [ row('math233'), hr() ],
      bsms ? null : [ row('math381'), hr() ],
      bsms ? null : [ row('math547'), hr() ],
      row('math661'), hr(),
      bsms ? null : [ row('stat435'), hr() ],

      x('.text-center')(
        'Review this worksheet with your advisor and submit the completed worksheet to the Student Services Coordinator preferably in electronic form.  Hard copies also accepted.',
        strong('The worksheet is a component of the Program of Study for MS (CS-03) and/or PhD (CS-06).')
      ),
      hr(),

      p('Student Signature:'),
      signatureRow(admin || isStudent, 'student', form),
      x('.verticalSpace')(),

      p('Advisor Signature:'),
      signatureRow(admin, 'advisor', form),
      x('.verticalSpace')(),

      admin || isStudent
        ? x('button.btn.btn-primary.CS01-submit')(
          { type: 'submit', onclick: 'refreshRequired()' },
          'Submit')
        : null,
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

const formRow = (admin, values) => (key) => {
  const { div } = x
  const coveredFieldName = `${key}Covered`
  const dateFieldName = `${key}Date`
  const roValue = (name) => (pseudoInput(values[name]))
  const rwValue = (name) => (input('text', name, values[name], true))
  const value = admin ? rwValue : roValue
  return (
    row(
      colMd(4)(descriptions[key]),
      colMd(4)(
        div('Covered by:'),
        value(coveredFieldName),
      ),
      colMd(4)(
        div('Dates:'),
        value(dateFieldName),
      ),
    )
  )
}

const refreshRequiredScript = () => {
  x('script')(
    {type: 'text/javascript'},
    `
      function refreshRequired() {
        // only require two out of 3 of the following courses
        const comp521Covered = document.getElementByName('comp521Covered')[0]
        const comp521Date = document.getElementByName('comp521Date')[0]

        const comp520Covered = document.getElementByName('comp520Covered')[0]
        const comp520Date = document.getElementByName('comp520Date')[0]

        const comp530Covered = document.getElementByName('comp530Covered')[0]
        const comp530Date = document.getElementByName('comp530Date')[0]

        comp521Covered.required = !(comp520Covered.value.length != 0 && comp530Covered.value.length != 0);
        comp521Date.required = !(comp520Covered.value.length != 0 && comp530Covered.value.length != 0);

        comp520Covered.required = !(comp521Covered.value.length != 0 && comp530Covered.value.length != 0);
        comp520Date.required = !(comp521Covered.value.length != 0 && comp530Covered.value.length != 0);

        comp530Covered.required = !(comp521Covered.value.length != 0 && comp520Covered.value.length != 0);
        comp530Date.required = !(comp521Covered.value.length != 0 && comp520Covered.value.length != 0);
      }
    `
  )
}

const { strong } = x
const descriptions = {
  comp283: [
    strong('COMP 283: Discrete Structures:'),
    ' Introduces discrete structures and the formal math used to establish their properties & those of algorithms that work with them.  Develops problem-solving skills through puzzles & applications central to CS. or ',
    strong('MATH 381: Discrete Mathematics'),
    ' (see below)'
  ],

  comp410: [
    strong('COMP: 410:  Data Structures:'),
    ' The analysis of data structures and their associated algorithms.  Abstract data types, lists, stacks, queues, trees, and graphs.'
  ],

  comp411: [
    strong('COMP 411: Computer Organization:'),
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

  comp521: [
    strong('*COMP 521:  Files & Databases:'),
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
    strong('STAT 435:  Introduction to Probability (MATH 146):'),
    ' Introduction to mathematical theory of probability covering random variables, moments, binomial, Poisson, normal & related distributions, generating functions, sums & sequences of random variables, & statistical applications.'
  ],
}

module.exports = main
