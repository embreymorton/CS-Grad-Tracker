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
const submitButton = require('../common/submitButton')
const saveEditButton = require('../common/saveEditsButton')
const { semesterDatalist, semesterInput } = require('../common/semesterDropdown')
const baseComponents = require('../common/baseComponents')
const { dropdown, makeOption, optionSet, script, dateInput, checkbox } = baseComponents
const baseInput = baseComponents.input

const main = (opts) => {
  const { uploadSuccess, formName, VA } = opts
  const title = `${formName} Background Preparation Worksheet`
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow('student advisor') ? mainContent(opts) : 'Error: You are not authorized to view this page.',
    pageScript(opts)
  )
}

const mainContent = (opts) => {
  const { student, hasAccess, formName } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, p, strong, hr } = x
  const form = !hasAccess
        ? div('You do not have access')
        : cs01FormNEW(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Background preparation worksheet'),
    h3(formName),
    div(
      { class: 'text-left' },
      x('p.underline')('Instructions:'),
      p('The following UNC courses define the background preparation assumed in the M.S. and PhD programs. This worksheet is intended to help identify possible missing areas in your preparation; it is entirely normal to include one or more background courses in the MS or PhD Program of Study in order to satisfy the background preparation requirement.'),
      p('For each course, indicate how (e.g. course work, independent study, or work experience) and when you mastered the materials as defined by the list of principal topics.  For additional information on UNC course content, consult the online syllabi.  In case you are uncertain about the adequacy of your preparation for a given course, consult a course instructor or the instructor(s) of graduate courses that depend on the course in question.'),
      p(strong('All fields required!')),
      hr(),
      form,
    )
  ]
}

const cs01FormNEW = (opts) => {
  const { postMethod, student, form, isStudent, admin, formName, isComplete, semesters, activeFaculty, cspNonce, VA} = opts
  const { _id, lastName, firstName, pid } = student
  const { hr, div, h3, p, strong } = x
  const row = formRow(admin || (isStudent && !isComplete), form, activeFaculty, semesters, opts)
  const vert = x('div.verticalSpace')()
  return (
    x('form.cs-form#cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', _id.toString()),
      namePidRow(student), hr(),
      h3('Background Course Information'), x('.verticalSpace')(), semesterDatalist(8, 1),

      [ row('comp210'), hr() ],
      [ row('comp311'), hr() ],
      [ row('comp455'), hr() ],
      [ row('comp550'), hr() ],

      x('.text-center.bold')('(Any two of the following nine will suffice)'), 
      vert,
      row('comp421'), x('.verticalSpace')(),
      row('comp431'), x('.verticalSpace')(),
      row('comp433'), x('.verticalSpace')(),
      row('comp520'), x('.verticalSpace')(),
      row('comp524'), x('.verticalSpace')(),
      row('comp530'), x('.verticalSpace')(),
      row('comp533'), x('.verticalSpace')(),
      row('comp541'), x('.verticalSpace')(),
      row('comp590'), x('.verticalSpace')(),
      hr(),

      x('.text-center.bold')('Mathematics and Statistics'), 
      vert,
      [ row('math233'), hr() ],
      [ row('comp283'), hr() ],
      [ row('math347'), hr() ],
      [ row('stor435'), hr() ],

      x('.text-center')(
        'Review this worksheet with your advisor and submit the completed worksheet to the Student Services Coordinator preferably in electronic form.  Hard copies also accepted.',
        strong('The worksheet is a component of the Program of Study for MS (CS-03) and/or PhD (CS-06).')
      ),
      hr(),

      p('Student Approval:'),
      signatureRow(admin || isStudent, 'student', form, opts.cspNonce, {isRequired: isStudent}),
      x('.verticalSpace')(),

      p('Advisor Approval:'),
      // signatureRow(admin, 'advisor', form, opts.cspNonce),
      approvalCheckboxRow(!isStudent, 'advisor', opts),
      x('.verticalSpace')(),

      buttonBarWrapper(
        submitButton(opts),
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

const formRow = (writeAccess, values, faculty, semesters, opts) => (key) => {
  const { cspNonce, VA, isComplete } = opts
  const { div, label, hr } = x
  const gRow = x('div.row.align-items-end') // a row with "gravity"
  const coveredFieldName = `${key}Covered`
  const dateFieldName = `${key}Date`
  const descriptionFieldName = `${key}Description`
  const isRequired = !(['comp421', 'comp520', 'comp530'].includes(key))
  const isAlwaysDisabled = VA.not('admin student') || isComplete

  return [
    row(
      colMd(4)(descriptions[key]),
      colMd(8)(
        div('Covered by:'),
        dropdown(coveredFieldName,
          optionSet(
            [
              ['', 'Not covered'],
              ['Course', 'Course'],
              ['Independent Study', 'Independent Study'],
              ['Work Experience', 'Work Experience'],
              // ['Waiver', 'Waiver'], // used to have waiver
            ], 
            values[coveredFieldName]
          ),
          {
            isRequired,
            isDisabled: isAlwaysDisabled
          }
        ),
        row(
          colMd(12)(
            {id: 'coveredLine'},
            hr()
          )
        ), 
        // I think it might be better to generate all the input types rather than reactively generate them client-side
        //      ---> it allows you to switch without having to retype too!
        // instead, the script should just enable some types and disable the others
        // NOTE: you can't en/disable divs, so you have to en/disable all the inputs within the div
        //       however, you can hide divs! (through display: none)
        gRow({id: `${key}CourseCovered`},
          colMd(6)(
            div('If not from UNC, list the school and course that covers this requirement:'),
            baseInput(descriptionFieldName, values[descriptionFieldName], {
              isDisabled: true,
              isRequired: false,
            })
          ),
          colMd(6)(
            div('Semester Completed'),
            // baseInput(dateFieldName, values[dateFieldName], {
            //   isDisabled: true,
            //   isRequired: false,
            // })
            semesterInput(dateFieldName, values[dateFieldName], {
              isDisabled: true,
              isRequired: false,
              isSS_YYYY: false,
              placeholder: 'Select or type semester/quarter.'
            })
          )
        ),
        gRow({id: `${key}IndependentCovered`},
          colMd(6)(
          div('Faculty Approval:'),
            dropdown(descriptionFieldName, 
              faculty.map((faculty) => makeOption(faculty.lastFirst, faculty.lastFirst, values[descriptionFieldName] == faculty.lastFirst)),
              {
                isDisabled: true,
                isRequired: false,
                blankOption: 'Select faculty that approved independent study.',
              })
          ),
          colMd(6)(
            div('Date'),
            dateInput(dateFieldName, values[dateFieldName], {
              isDisabled: true,
              isRequired: false,
            })
          )
        ),
        gRow({id: `${key}WorkCovered`},
          colMd(6)(
            div('Company and Task/Job Description'),
            baseInput(descriptionFieldName, values[descriptionFieldName], {
              isDisabled: true,
              isRequired: false,
            })
          ),
          colMd(6)(
            div('Dates'),
            baseInput(dateFieldName, values[dateFieldName], {
              isDisabled: true,
              isRequired: false,
            })
          )
        ),
        gRow({id: `${key}WaiverCovered`},
          colMd(12)(
            div('Has CS-02 form been submitted?'),
            checkbox(descriptionFieldName, values[descriptionFieldName] == 'CS-02 Is Submitted', cspNonce, 
              {
                isDisabled: writeAccess,
                isInline: false,
                isRequired: false,
                overrideTrue: 'CS-02 Is Submitted',
                overrideFalse: ''
              })
          )
        ),
        script(cspNonce, 
          `
          document.getElementById('select-${coveredFieldName}').addEventListener('change', (e) => {
            const course = '${key}CourseCovered'
            const independent = '${key}IndependentCovered'
            const work = '${key}WorkCovered'
            const waiver = '${key}WaiverCovered'
            const disableSections = (...ids) => {
              ids.forEach((id) => {
                const section = document.getElementById(id)
                if (!section) {console.log(id)}
                else {
                  section.style.display = 'none'
                  section.querySelectorAll('input, select').forEach(input => input.setAttribute('disabled', ''))
                }
              })
            }
            const enableSection = (id) => {
              if (${isAlwaysDisabled}) {
                return
              }
              const section = document.getElementById(id)
              section.style.display = 'flex' // bootstrap rows are flexboxes
              section.querySelectorAll('input, select').forEach(input => input.removeAttribute('disabled'))
            }
            switch (e.currentTarget.value) {
              case 'Course': {
                disableSections(independent, work, waiver)
                enableSection(course)
                document.getElementById('coveredLine').style.display = 'block'
              }
              break
              case 'Independent Study': {
                disableSections(course, work, waiver)
                enableSection(independent)
                document.getElementById('coveredLine').style.display = 'block'
              }
              break
              case 'Work Experience': {
                disableSections(course, independent, waiver)
                enableSection(work)
                document.getElementById('coveredLine').style.display = 'block'
              }
              break
              case 'Waiver': {
                disableSections(independent, work, course)
                enableSection(waiver)
                document.getElementById('coveredLine').style.display = 'block'
              }
              break
              default: { // ie. ''
                disableSections(course, independent, work, waiver)
                document.getElementById('coveredLine').style.display = 'none'
              }
            }
          })
          document.getElementById('select-${coveredFieldName}').dispatchEvent(new Event('change'))
          `,
          {defer: ''}
        )
      ),
    ),
  ]
}

const pageScript = (opts) => {
  const script = x('script')({type: 'text/javascript'})
  const javascript = `
  document.addEventListener('DOMContentLoaded', () => {
    const keys = ['comp421', 'comp520', 'comp530']
    const coveredInputs = keys.map((key) => document.getElementsByName(key + 'Covered')[0])
    
    const inputChangeCheck = (event) => {
      if (event.submitter && event.submitter.id == "save-btn") {
        return
      }

      const complete = coveredInputs.map((covered, i) => covered.value.length > 0)
      if (complete.reduce((prev, curr) => prev + (curr ? 1 : 0), 0) >= 2) { // number of completes
        coveredInputs.forEach((input) => input.required = false)
        return true
      } else {
        coveredInputs.forEach((input) => input.required = true)
        return false
      }
    }
    coveredInputs.forEach((input) => input.addEventListener('input', inputChangeCheck))
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

  math347: [
    strong('MATH 347:  Linear Algebra for Applications:'),
    ' Algebra of matrices with applications: determinants, solution of linear systems by Gaussian elimination, Gram-Schmidt procedure, and eigenvalues. Previously offered as MATH 547.'
  ],

  // math661: [
  //   strong('MATH 661:  Introduction to Numerical Analysis:'),
  //   " Error in computation; solution of nonlinear equations; interpolation; approximation of functions; Fourier methods; numerical integration & differentiation; introduction to numerical solution of ODE's; introductions to numerical linear algebra."
  // ],

  stor435: [
    strong('STOR 435:  Introduction to Probability (MATH 535):'),
    ' Introduction to mathematical theory of probability covering random variables, moments, binomial, Poisson, normal & related distributions, generating functions, sums & sequences of random variables, & statistical applications.'
  ],

  //New Additions
  comp431: [
    strong('*COMP 431: Internet Services and Protocols:'),
    'Application-level protocols HTTP, SMTP, FTP, transport protocols TCP and UDP, and the network-level protocol IP. Internet architecture, naming, addressing, routing, and DNS. Sockets programming. Physical-layer technologies. Ethernet, ATM, and wireless.'
  ],

  comp433: [
    strong('*COMP 433: Mobile Computing Systems:'),
    'Principles of mobile applications, mobile OS, mobile networks, and embedded sensor systems. Coursework includes programming assignments, reading from recent research literature, and a semester long project on a mobile computing platform (e.g., Android, Arduino, iOS, etc.).'
  ],

  comp533: [
    strong('*COMP 533: Distributed Systems:'),
    'Distributed systems and their goals; resource naming, synchronization of distributed processes; consistency and replication; fault tolerance; security and trust; distributed object-based systems; distributed file systems; distributed Web-based systems; and peer-to-peer systems.'
  ],
  
  comp590: [
    strong('*COMP 590: Undergraduate Computer Architecture:'),
    'Enter Description' //TODO: Add description
  ],

}

module.exports = main
