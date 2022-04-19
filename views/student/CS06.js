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
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')

const main = (opts) => {
  const { uploadSuccess } = opts
  const title = 'CS06 PhD Program of Study'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
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
  const { postMethod, student, form, admin, isStudent, isComplete } = opts
  const editAccess = admin || isStudent
  const { dissTitle, comp915, breadthCourseCategory, breadthCourseInfo,
          breadthCourseDate, breadthCourseGrade, concentrationCourseInfo,
          concentrationCourseDate, concentrationCourseHours,
          otherCourseInfo, otherCourseHours, note, otherCourses, minor,
          backgroundPrepWorkSheet, programProductRequirement,
          PHDWrittenExam, PHDOralExam, committee, advisor, chairman,
          approved, reasonApproved } = form
  const { div, hr, strong, option, span, a } = x
  const select = x('select.form-control')
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
      namePidRow(opts, editAccess), hr(),

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
            option({ value: '' }, ''),
            option({ value: 'false', selected: !comp915 || null }, 'false'),
            option({ value: 'true', selected: comp915 || null }, 'true'),
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
          href: 'https://cs.unc.edu/academics/graduate/ms-requirements/course-categories',
        },
        '(click link for list of courses & categories)',
      )),
      div('T = Theory & Formal Thinking'),
      div('S = Systems & Hardware'),
      div('A = Applications'),
      div('O = Outside of CS'),
      div('-Include the sections numbers with any COMP 790 course listed.'),
      div(
        '-Courses taken outside UNC-CH must be graduate courses and not counted toward an undergraduate degree, and require submission of a ',
        a(
          {
            target: '_blank',
            href: 'https://cs.unc.edu/academics/graduate/ms-requirements/progress-forms',
          },
          'course waiver.',
        )
      ),
      div(
        'Consult the official ',
        a(
          {
            target: '_blank',
            href: 'https://cs.unc.edu/academics/graduate/phd-requirements',
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
              option({ value: 'T', selected: breadthCourseCategory && breadthCourseCategory[i] == 'T' || null }, 'T'),
              option({ value: 'S', selected: breadthCourseCategory && breadthCourseCategory[i] == 'S' || null }, 'S'),
              option({ value: 'A', selected: breadthCourseCategory && breadthCourseCategory[i] == 'A' || null }, 'A'),
              option({ value: 'O', selected: breadthCourseCategory && breadthCourseCategory[i] == 'O' || null }, 'O'),
            )
          ))
        ),

        colMd(6)(
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
            editAccess && !isComplete
              ? input('text', 'breadthCourseDate', breadthCourseDate && breadthCourseDate[i], true)
              : pseudoInput(breadthCourseDate && breadthCourseDate[i])
          ))
        ),

        colMd(2)(
          div('Grade*'),
          range6.map((i) => (
            editAccess && !isComplete
              ? input('text', 'breadthCourseGrade', breadthCourseGrade && breadthCourseGrade[i], true)
              : pseudoInput(breadthCourseGrade && breadthCourseGrade[i])
          ))
        ),
      ),
      hr(),

      strong('B. Primary Concentration'),
      div('Three or four courses not listed in (A) of which at least two support in depth the specific dissertation topic and at least one that of which supports more generally the area of computer science in which the dissertation topic falls.  The courses do not need to be related to each other except in that they support the dissertation.  These courses may have been taken as an undergraduate and may have been counted toward an undergraduate degree.'),
      div('Include the following information:'),
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
          range4.map((i) => (
            editAccess && !isComplete
              ? input('text', 'concentrationCourseDate', concentrationCourseDate && concentrationCourseDate[i])
              : pseudoInput(concentrationCourseDate && concentrationCourseDate[i])
          ))
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

      strong('D. Formal Minor(if applicable)'),
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
        strong('III. Committe Members -'),
        'List the names of your PhD Committee members. (5 minimum, majority must be Dept. of Computer Science faculty.)'
      ),
      div('Each committee member should review the program of study.  The Chair is requested to check off or initial beside each member who has reviewed this program of study. '),
      row(
        colMd(6)(strong('Committee Member')),
        colMd(2)('Select Research Advisor'),
        colMd(2)('Select Chair'),
      ),

      row(
        colMd(6)(
          range6.map((i) => (
            x('div.form-group.row')(
              x('label.col-md-2')(`${i+1}.* `),
              colMd(10)(
                editAccess && !isComplete
                  ? input('text', 'committee', committee && committee[i], true)
                  : x('div.committee-name')(pseudoInput(committee && committee[i]))
              )
            )
          ))
        ),

        x('div.col-md-2.advisor-buttons')(
          range6.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                x('button.btn.btn-outline-primary.advisor')(
                  buttonAttrs,
                  'A'
                )
              )
            )
          ))
        ),

        x('div.col-md-2.chair-buttons')(
          range6.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                x('button.btn.btn-outline-primary.chairman')(
                  buttonAttrs,
                  'C'
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
          x('span.label.advisor')(advisor),
        )
      ),

      row(
        colMd(1)('Chair:'),
        colMd(3)(
          input('hidden', 'chairman', chairman, true),
          x('span.label.chairman')(chairman),
        )
      ),
      hr(),

      div(strong('Committee advisor'), ' (or Chair if different from advisor)*'),
      div('By signing here, the chair indicates that all items above have been approved by the majority of the committee.'),
      signatureRow(admin, 'chair', form),
      hr(),

      strong('IV. Approval'),
      div(strong('PhD Program of Study APPROVAL PROCESS*')),
      div('The PhD Program of Study will be reviewed by the GCS (Graduate Studies Committee).  GSC meets a number of times during each semester.  In order for your Program of Study to be reviewed in a timely manner, it is highly recommended to submit it early, preferably in your 6th semester or around the time you have your proposal meeting'),

      colMd(4)(
        select(
          { name: 'approved', disabled: !admin || null },
          option({ value: '' }, ''),
          option({ value: 'Approved', selected: approved == 'Approved' || null }, 'Approved'),
          option({ value: 'Disapproved', selected: approved == 'Disapproved' || null }, 'Disapproved'),
        )
      ),
      hr(),

      row(
        colMd(4)(
          div('Reason for Disapproved and Needed Adjustments Stated Here '),
          x('textarea.form-control')(
            { rows: 6, name: 'reasonApproved', disabled: !admin || null },
            reasonApproved
          )
        )
      ),
      hr(),

      row(
        colMd(4)(
          div('Director of Graduate Studies Signature:*'),
          signatureRow(admin, 'director', form),
        )
      ),
      vert,

      buttonBarWrapper(
        !isComplete
          ? [
            vert,
            x('div.hidden')({ id: 'errorMessage' }),
            x('button.btn.btn-primary.CS06-submit#submit-btn')({ type: 'submit' }, 'Submit')
          ]
        : null,
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
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save-btn').onclick(() => {
      wasSaveButtonPressed = true
    })
    const committee = ${JSON.stringify(committee)}
    const advisor = '${advisor}'
    const chairman = '${chairman}'
    const editAccess = ${editAccess}
    if (editAccess) setRadioishButtonClickHandlers()
    if (committee) setRadioishButtonDefaults(committee, advisor, chairman)
    if (editAccess) setRadioishSelectionRequirement()
    setNoCourseOverlapRequirement()
    if (editAccess) setNameChangeListeners()
  })
  let wasSaveButtonPressed = false
  
  const setRadioishButtonClickHandlers = () => {
    // can't use onclick attribute because of content security policy
    ['advisor', 'chairman'].forEach((key) => {
      document.querySelectorAll('.btn.' + key).forEach(setClickHandler(key))
    })
  }

  const setRadioishButtonDefaults = (committee, advisor, chairman) => {
    updatePage('advisor', committee.indexOf(advisor))
    updatePage('chairman', committee.indexOf(chairman))
  }

  const setRadioishSelectionRequirement = () => {
    document.querySelector('form.cs-form').addEventListener('submit', (event) => {
      const advsr = document.querySelector('[name=advisor]').value
      const chair = document.querySelector('[name=chairman]').value
      if (!advsr && !chair) showError('you must set both an advisor and a chair')
      else if (!advsr) showError('you must set an advisor')
      else if (!chair) showError('you must set a chair')
      else hideError()
      if (!wasSaveButtonPressed && (!advsr || !chair)) event.preventDefault()
    })
  }

  const setNoCourseOverlapRequirement = () => {
    document.querySelector('form.cs-form').addEventListener('submit', (event) => {
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
    document.querySelectorAll('[name=committee]').forEach((input, index) => {
      input.addEventListener('input', ({ target }) => {
        const { value } = target
        if (selectedAdvisorIndex() == index) updateValue('advisor', value)
        if (selectedChairIndex() == index) updateValue('chairman', value)
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
    const isActive = buttons[index].ariaPressed === 'true'
    const name = getValue(key, index)
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
    document.querySelector('span.label.' + name).textContent = value
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
