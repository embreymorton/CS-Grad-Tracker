const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const pseudoInput = require('../common/pseudoInput')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const submitButton = require('../common/submitButton')
const saveEditButton = require('../common/saveEditsButton')
const { semesterInput, semesterDatalist } = require('../common/semesterDropdown')
const adminApprovalCheckboxRow = require('../common/adminApprovalCheckboxRow')
const {gradeDropdown} = require('../common/gradesDropdown')
const { script, dropdown, makeOption, textarea } = require('../common/baseComponents')
const {facultyDropdown} = require('../common/facultyDropdown')

const main = (opts) => {
  const { uploadSuccess, VA, form } = opts
  const title = 'CS06 PhD Program of Study'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow('student advisor', ['fullName', form.chairman]) ? mainContent(opts) : 'You are not authorized to view this page.',
    pageScript(opts),
  )
}

const mainContent = (opts) => {
  const { student, hasAccess } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, strong, hr } = x
  return [
    h4(lastName, ', ', firstName),
    h3('PhD Program of Study'),
    h3('CS-06'),
    div(
      { class: 'text-left' },
      cs06Form(opts),
    )
  ]
}

const cs06Form = (opts) => {
  const { postMethod, student, form, admin, isStudent, isComplete, faculty, viewer, cspNonce, VA } = opts
  const editAccess = admin || isStudent
  const { dissTitle, comp915, breadthCourseCategory, breadthCourseInfo,
          breadthCourseDate, breadthCourseGrade, concentrationCourseInfo,
          concentrationCourseDate, concentrationCourseHours,
          otherCourseInfo, otherCourseHours, note, otherCourses, minor,
          backgroundPrepWorkSheet, programProductRequirement,
          PHDWrittenExam, PHDOralExam, committee, advisor, chairman,
          approved, approvalReason } = form
  const { div, hr, strong, option, span, a, output, ul, li } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const range4 = [0, 1, 2, 3]
  const range5 = [0, 1, 2, 3, 4]
  const range6 = [0, 1, 2, 3, 4, 5]
  const range7 = [0, 1, 2, 3, 4, 5, 6]
  const range8 = [0, 1, 2, 3, 4, 5, 6, 7]
  
  const buttonAttrs = {
    type: 'button',
    'aria-pressed': 'false',
    autocomplete: 'off',
  }
  const disabled = editAccess ? {} : { disabled: true }
  const approvedGSCText = 'Approved by Graduate Studies Committee'
  const disapprovedGSCText = 'Not Approved'

  return (
    x('form.cs-form#cs-form')(
      { action: postMethod, method: 'post' },
      input('hidden', 'student', student._id.toString()),
      namePidRow(opts, editAccess), hr(),
      semesterDatalist(8),

      strong('Instructions:'),
      div(
        'This form details an individual program of study for the PhD Degree.  It should be filed with the Student Services Manager when the PhD program is substantially planned (typically by the ',
        strong('6th semester'),
        ') and can be amended subsequently.  Forms mentioned in this program of study can be filed separately and at a later date.'
      ),
      vert,

      row(
        colMd(2)('Title of Dissertation or Topic of Research Area*'),
        colMd(6)(
          editAccess && !isComplete
            ? input('text', 'dissTitle', dissTitle, true)
            : pseudoInput(dissTitle)
        )
      ),
      hr(),

      strong('I. Course Requirements'),
      div('Note:  For Courses taken other than at UNC-CH, attach at least a catalog description and preferably a syllabus. '),
      vert,

      strong('A. Required Courses'),
      row(
        colMd(2)(
          div('Comp 915: Technical Communication in CS. File CS-02 if waived.*')
        ),
        colMd(2)(
          isComplete ? pseudoInput(comp915) : select(
            { name: 'comp915', ...disabled },
            option({ value: '', selected: !comp915 || null }, ''),
            option({ value: 'taken', selected: comp915 == 'taken' || null }, 'Taken'),
            option({ value: 'waived', selected: comp915 == 'waived' || null }, 'Waived'),
          )
        ),
      ),
      x('div.verticalSpace')('Breadth Requirement: List courses below'),
      hr(),

      strong('Breadth Requirement Courses'),
      div('List the 6 courses taken to satisfy the distribution requirement.  Include the following information:'),
      div(a(
        {
          target: '_blank',
          href: 'https://cs.unc.edu/graduate/phd/#CourseReqs',
        },
        '(click link for list of courses & categories)',
      )),
      ul(
        li('Include the sections numbers with any COMP 790 course listed.'),
        li(
          'Courses taken outside UNC-CH must be graduate courses and not counted toward an undergraduate degree, and require submission of a course waiver (CS02).',
        ),
      ),
      div(
        'Consult the official ',
        a(
          {
            target: '_blank',
            href: 'https://cs.unc.edu/graduate/phd/',
          },
          'CS PhD Degree Requirements',
        ),
        ' for eligible course and grade requirements.',
      ),
      hr(),

      row(
        colMd(2)(
          div('Category*'),
          range6.map((i) => (
            isComplete ? pseudoInput(breadthCourseCategory && breadthCourseCategory[i]) : select(
              { name: 'breadthCourseCategory', required: true, ...disabled },
              option({ value: '' }, ''),
              option({ value: 'T', selected: breadthCourseCategory && breadthCourseCategory[i] == 'T' || null }, 'Theory'),
              option({ value: 'S', selected: breadthCourseCategory && breadthCourseCategory[i] == 'S' || null }, 'Systems'),
              option({ value: 'A', selected: breadthCourseCategory && breadthCourseCategory[i] == 'A' || null }, 'Applications'),
              option({ value: 'O', selected: breadthCourseCategory && breadthCourseCategory[i] == 'O' || null }, 'Outside of CS'),
            )
          ))
        ),

        colMd(4)(
          div('Course Number, Title, & Name of Univ.*'),
          range6.map((i) => (
            editAccess && !isComplete
              ? input('text', 'breadthCourseInfo', breadthCourseInfo && breadthCourseInfo[i], true)
              : pseudoInput(breadthCourseInfo && breadthCourseInfo[i])
          ))
        ),

        colMd(2)(
          div('Semester/Year*'),
          range6.map((i) => (
            semesterInput('breadthCourseDate', breadthCourseDate && breadthCourseDate[i], {
              isDisabled: !editAccess || isComplete,
              isSS_YYYY: false,
              placeholder: "SS YYYY",
              isRequired: true
            })
          ))
        ),

        colMd(2)(
          div('Grade*'),
          range6.map((i) => (
            gradeDropdown('breadthCourseGrade', breadthCourseGrade && breadthCourseGrade[i], !editAccess || isComplete, {placeholder: 'None selected.'})
          ))
        ),
      ),
      hr(),

      strong('B. Primary Concentration'),
      div('Three or four courses not listed in (A) of which at least two support in depth the specific dissertation topic and at least one that of which supports more generally the area of computer science in which the dissertation topic falls.  The courses do not need to be related to each other except in that they support the dissertation.  These courses may have been taken as an undergraduate and may have been counted toward an undergraduate degree.'),
      hr(),

      row(
        colMd(6)(
          div('Course Number, Title, & Name of Univ*'),
          range4.map((i) => (
            editAccess && !isComplete
              ? input('text', 'concentrationCourseInfo', concentrationCourseInfo && concentrationCourseInfo[i])
              : pseudoInput(concentrationCourseInfo && concentrationCourseInfo[i])
          ))
        ),
        colMd(3)(
          div('Semester/Year*'),
          range4.map((i) => 
            semesterInput('concentrationCourseDate', concentrationCourseDate && concentrationCourseDate[i], {
              isDisabled: !editAccess || isComplete,
              isSS_YYYY: false,
              placeholder: "SS YYYY",
              isRequired: true
            }),
          )
        ),
        colMd(3)(
          div('Credit/Hours*'),
          range4.map((i) => (
            editAccess && !isComplete
              ? input('number', 'concentrationCourseHours', concentrationCourseHours && concentrationCourseHours[i])
              : pseudoInput(concentrationCourseHours && concentrationCourseHours[i])
          ))
        ),
      ),
      hr(),

      strong('C. Other courses required by your dissertation committee'),
      div('Indicate department, course number, title, and credit hours.  Add note if not taken at UNC-CH. '),
      row(
        colMd(4)(
          div('Course Number & Title*'),
          range4.map((i) => (
            editAccess && !isComplete
              ? input('text', 'otherCourseInfo', otherCourseInfo && otherCourseInfo[i])
              : pseudoInput(otherCourseInfo && otherCourseInfo[i])
          ))
        ),
        colMd(2)(
          div('Credit Hours*'),
          range4.map((i) => (
            editAccess && !isComplete
              ? input('number', 'otherCourseHours', otherCourseHours && otherCourseHours[i])
              : pseudoInput(otherCourseHours && otherCourseHours[i])
          ))
        ),
      ),

      row(
        colMd(4)(
          div('Note:'),
          isComplete ? pseudoInput(note) : x('textarea.form-control')(
            { rows: 6, name: 'note', ...disabled },
            note
          )
        )
      ),
      hr(),

      row(
        colMd(4)(
          div('List any other courses here that you believe are relevant to your program of study.'),
          isComplete ? pseudoInput(otherCourses) : x('textarea.form-control')(
            { rows: 6, name: 'otherCourses', ...disabled },
            otherCourses
          )
        )
      ),
      hr(),

      strong('D. Formal Minor (if applicable)'),
      row(
        colMd(4)(
          div(
            'See policy in ',
            a({ href: 'https://handbook.unc.edu/phd.html' }, 'The Graduate School Handbook')
          ),
          isComplete ? pseudoInput(minor) : x('textarea.form-control')(
            { rows: 6, name: 'minor', ...disabled },
            minor
          )
        )
      ),
      hr(),

      strong('Other Requirements'),
      div(strong('Check if completed')),
      div('(it is not necessary to have all other requirements completed to turn in your program of study)'),
      div('A. Background Preparation worksheet*'),
      colMd(4)(
        isComplete ? pseudoInput(backgroundPrepWorkSheet) : select(
          { name: 'backgroundPrepWorkSheet', ...disabled },
          option({ value: '' }, ''),
          option({ value: 'false', selected: !backgroundPrepWorkSheet || null }, 'false'),
          option({ value: 'true', selected: backgroundPrepWorkSheet || null }, 'true'),
        )
      ),

      div('B. Program Product requirement*'),
      colMd(4)(
        isComplete ? pseudoInput(programProductRequirement) : select(
          { name: 'programProductRequirement', ...disabled },
          option({ value: '' }, ''),
          option({ value: 'false', selected: !programProductRequirement || null }, 'false'),
          option({ value: 'true', selected: programProductRequirement || null }, 'true'),
        )
      ),

      div('C. PhD. Written Exam (a.k.a. the writing requirement)*'),
      colMd(4)(
        isComplete ? pseudoInput(PHDWrittenExam) : select(
          { name: 'PHDWrittenExam', ...disabled },
          option({ value: '' }, ''),
          option({ value: 'false', selected: !PHDWrittenExam || null }, 'false'),
          option({ value: 'true', selected: PHDWrittenExam || null }, 'true'),
        )
      ),

      div('D. PhD Oral Comprehensive Exam*'),
      colMd(4)(
        isComplete ? pseudoInput(PHDOralExam) : select(
          { name: 'PHDOralExam', ...disabled },
          option({ value: '' }, ''),
          option({ value: 'false', selected: !PHDOralExam || null }, 'false'),
          option({ value: 'true', selected: PHDOralExam || null }, 'true'),
        )
      ),
      hr(),

      div(
        strong('III. Committee Members -'),
        'List the names of your PhD Committee members. (5 minimum, majority must be Dept. of Computer Science faculty.)'
      ),
      div('Each committee member should review the program of study.  The Chair is requested to check off or initial beside each member who has reviewed this program of study. '),

      row(
        colMd(6)(strong('Committee Members')),
        colMd(2)('Select Research Advisor'),
      ),
      row(
        colMd(6)(
          x('div.form-group.row')(
            x('label.col-md-2')(`Chair: `), colMd(10)(facultyDropdown('chairman', chairman, faculty, {isDisabled: isComplete || !editAccess, isRequired: true, blankOption: 'Select chair member.'})),
          ),
          range7.map((i) => (
              x('div.form-group.row')(
              x('label.col-md-2')(i < 5 ? `${i+1}.* ` : `${i+1}. `),
              colMd(10)(
                editAccess && !isComplete
                  ? input('text', 'committee', committee && committee[i], true, null, 0, {'data-index': i+1})
                  : x('div.committee-name')(pseudoInput(committee && committee[i]))
              )
            ))
          )
        ),

        x('div.col-md-2.advisor-buttons')(
          range8.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                x('button.btn.btn-outline-primary.advisor.advisor-btn')(
                  {...buttonAttrs, 'data-index': i},
                  'A'
                )
              )
            )
          ))
        ),
      ),
      vert,

      row(
        colMd(1)(div('Advisor:')),
        colMd(3)(
          input('hidden', 'advisor', advisor, true),
          output({class: 'label advisor', for: 'advisor'}, advisor),
        )
      ),
      hr(),
      
      div(strong('Committee advisor'), ' (or Chair if different from advisor)*'),
      div('By signing here, the chair indicates that all items above have been approved by the majority of the committee.'),
      signatureRow(VA.allow('admin', ['fullName', chairman]), 'chair', form, opts.cspNonce),
      script(opts.cspNonce, // hacky way to add chair's name to label, relies on order of event listener attachment
        `
        document.getElementById('checkbox-chairSignature').addEventListener('change', (e) => {
          // if (e.target.value) {
            const label = document.getElementById('label-chairSignature')
            const chair = document.querySelector('[name="chairman"]').value
            const currentText = label.innerText.split('Chair')
            currentText[0] = "(Chair " + chair
            label.innerText = currentText.join('')
          // }
        })
        
        document.getElementById('checkbox-chairSignature').dispatchEvent(new Event('change'))
        `,
        {defer: ''}),
      hr(),

      strong('IV. Approval'),
      div(strong('PhD Program of Study APPROVAL PROCESS*')),
      div('The PhD Program of Study will be reviewed by the GSC (Graduate Studies Committee). The GSC meets a number of times during each semester. In order for your Program of Study to be reviewed in a timely manner, it is highly recommended to submit it early, preferably in your 6th semester or around the time you have your proposal meeting.'),
      vert,
      row(
        colMd(6)(
          dropdown(
            'approved',
            [
              makeOption('', '', form.approved === '' || form.approved === undefined),
              makeOption(false, disapprovedGSCText, form.approved === false),
              makeOption(true, approvedGSCText, form.approved === true)
            ],
            {isDisabled: isStudent || !admin}
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
      row(
        colMd(5)(
          div('Director of Graduate Studies Approval:*')
        )
      ),
      adminApprovalCheckboxRow(viewer, 'director', form, opts.cspNonce),
      vert,

      buttonBarWrapper(
        !isComplete
          ? [
            vert,
            x('div.hidden')({ id: 'errorMessage' }),
          ]
        : null,
        submitButton(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  )
}

const namePidRow = (opts, editAccess) => {
  const { student, form, isComplete } = opts
  const { lastName, firstName, pid } = student
  const { dateEntered } = form
  const name = `${lastName}, ${firstName}`
  const { div } = x
  const value = editAccess && !isComplete
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(4)(
        div('Name'),
        pseudoInput(name)
      ),
      colMd(4)(
        div('PID'),
        pseudoInput(pid)
      ),
      colMd(4)(
        div('Date entered program*'),
        value('date', 'dateEntered', dateEntered)
      ),
    )
  )
}

const pageScript = (opts) => {
  const { admin, isStudent, cspNonce, form } = opts
  const editAccess = admin || isStudent
  const { committee, advisor, chairman } = form
  const el = x('script')({ type: 'text/javascript' })
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText(committee, advisor, chairman, editAccess)
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute('nonce', cspNonce)
  return el
}

const pageScriptText = (committee, advisor, chairman, editAccess) => (`
  const regularCommittee = Array.from(document.querySelectorAll('[name="committee"]'))
  const chairmanElement = document.getElementsByName('chairman')[0]
  const committeeElements = [chairmanElement].concat(regularCommittee)
  const getCommitteeValues = () => committeeElements.map(element => element.value)

  document.addEventListener('DOMContentLoaded', () => {
    const advisor = '${advisor}'
    const editAccess = ${editAccess}

    if (editAccess) setRadioishButtonClickHandlers()
    if (editAccess) setRadioishSelectionRequirement()
    if (editAccess) setNameChangeListeners()
    if (editAccess) setRadioishButtonDefaults(advisor)
  })
  
  const setRadioishButtonClickHandlers = () => {
    // can't use onclick attribute because of content security policy
    ['advisor'].forEach((key) => {
      document.querySelectorAll('.btn.' + key).forEach(setClickHandler(key))
    })
  }

  const setRadioishButtonDefaults = (advisor) => {
    updatePage('advisor', getCommitteeValues().indexOf(advisor))
  }

  const setRadioishSelectionRequirement = () => {
    document.querySelector('form.cs-form').addEventListener('submit', (event) => {
      if (event.submitter && event.submitter.id == "save-btn") {
        return
      }
      const advsr = document.querySelector('[name=advisor]').value
      if (!advsr) showError('you must set a research advisor')
      else hideError()
      if (!advsr) event.preventDefault()
    })
  }

  const setNoCourseOverlapRequirement = () => {
    document.querySelector('form.cs-form').addEventListener('submit', (event) => {
      if (event.submitter && event.submitter.id == "save-btn") {
        return
      }
      const breadth = document.getElementsByName('breadthCourseInfo')
      const concentration = document.getElementsByName('concentrationCourseInfo')
      const other = document.getElementsByName('otherCourseInfo')

      // check if any courses in B are already listed in A
      for (var i = 0; i < concentration.length; i++) {
        for (var j = 0; j < breadth.length; j++) {
          if (concentration[i].value == breadth[j].value) {
            concentration[i].setCustomValidity('Course listed in A.')
            event.preventDefault()
          } else {
            concentration[i].setCustomValidity('')
          }
        }
      }

      // check if any courses in C are already listed in A or B
      for (var i = 0; i < other.length; i++) {
        for (var j = 0; j < breadth.length; j++) {
          if (other[i].value == breadth[j].value) {
            other[i].setCustomValidity('Course listed in A.')
            event.preventDefault()
          } else {
            other[i].setCustomValidity('')
          }
        }

        for (var j = 0; j < concentration.length; j++) {
          if (other[i].value == concentration[j].value) {
            other[i].setCustomValidity('Course listed in B.')
            event.preventDefault()
          } else {
            other[i].setCustomValidity('')
          }
        }
      }
    })
  }

  const setNameChangeListeners = () => {
    chairmanElement.addEventListener('change', ({target}) => {
      if (selectedAdvisorIndex() == 0) updateValue('advisor', target.value)
    })
    regularCommittee.forEach((input, index) => {
      input.addEventListener('input', ({ target }) => {
        const { value } = target
        if (selectedAdvisorIndex() == index+1) updateValue('advisor', value)
      })
    })
  }

  const setClickHandler = (key) => (el, index) => (
    el.addEventListener('click', () => { updatePage(key, index) })
  )

  const getValue = (key, index) => {
    const button = document.querySelectorAll('.btn.' + key)[index]
    const names = document.querySelectorAll('[name=committee]')
    if (names.length) return names[index].value
    return document.querySelectorAll('.committee-name')[index].innerText
  }

  const updatePage = (key, index) => {
    const buttons = document.querySelectorAll('.btn.' + key)
    if (!buttons[index]) {
      return
    }
    const isActive = buttons[index].ariaPressed === 'true'
    const name = getCommitteeValues()[index]
    unselectElements(buttons)
    if (!isActive) setButtonActiveState(buttons[index], true)
    updateValue(key, name)
  }

  const unselectElements = (els) => {
    els.forEach((el) => { setButtonActiveState(el, false) })
  }

  const setButtonActiveState = (el, isActive) => {
    el.classList[isActive ? 'add' : 'remove']('active')
    el.ariaPressed = isActive
  }

  const updateValue = (name, value) => {
    const input = document.querySelector('[name=' + name + ']')
    if (input) input.value = value
    document.querySelector('output.label.' + name).textContent = value
  }

  const showError = (message) => {
    errorElement().textContent = message
    errorElement().classList.remove('hidden')
  }

  const hideError = () => {
    errorElement().classList.add('hidden')
  }

  const errorElement = () => (
    document.getElementById('errorMessage')
  )

  const selectedAdvisorIndex = () => (
    activeButtonIndex(document.querySelectorAll('.advisor-buttons .btn'))
  )

  const selectedChairIndex = () => (
    activeButtonIndex(document.querySelectorAll('.chair-buttons .btn'))
  )

  const activeButtonIndex = (buttons) => (
    Array.prototype.map
      .call(buttons, (b) => b.className.includes('active'))
      .indexOf(true)
  )
`)

module.exports = main
