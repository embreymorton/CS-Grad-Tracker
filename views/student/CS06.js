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
  const title = 'CS06 PhD Program of Study'
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    bootstrapScripts(),
    pageScript(opts.cspNonce, opts.form),
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
      { style: { 'text-align': 'left' }},
      cs06Form(opts),
    )
  ]
}

const cs06Form = (opts) => {
  const { postMethod, student, form, admin, isStudent } = opts
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

  return (
    x('form.cs-form')(
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
        colMd(6)(input('text', 'dissTitle', dissTitle, true))
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
          select(
            { name: 'comp915' },
            option({ value: comp915 }, comp915),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True'),
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
            select(
              { name: 'breadthCourseCategory', required: true },
              breadthCourseCategory == null
                ? null
                : option({ value: breadthCourseCategory[i] }, breadthCourseCategory[i]),
              option({ value: 'T' }, 'T'),
              option({ value: 'S' }, 'S'),
              option({ value: 'A' }, 'A'),
              option({ value: 'O' }, 'O'),
            )
          ))
        ),

        colMd(6)(
          div('Course Number, Title, & Name of Univ.*'),
          range6.map((i) => (
            input('text', 'breadthCourseInfo', breadthCourseInfo && breadthCourseInfo[i], true)
          ))
        ),

        colMd(2)(
          div('Semester/Year*'),
          range6.map((i) => (
            input('text', 'breadthCourseDate', breadthCourseDate && breadthCourseDate[i], true)
          ))
        ),

        colMd(2)(
          div('Grade*'),
          range6.map((i) => (
            input('text', 'breadthCourseGrade', breadthCourseGrade && breadthCourseGrade[i], true)
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
            input('text', 'concentrationCourseInfo', concentrationCourseInfo && concentrationCourseInfo[i])
          ))
        ),
        colMd(3)(
          div('Semester/Year*'),
          range4.map((i) => (
            input('text', 'concentrationCourseDate', concentrationCourseDate && concentrationCourseDate[i])
          ))
        ),
        colMd(3)(
          div('Credit/Hours*'),
          range4.map((i) => (
            input('number', 'concentrationCourseHours', concentrationCourseHours && concentrationCourseHours[i])
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
            input('text', 'otherCourseInfo', otherCourseInfo && otherCourseInfo[i])
          ))
        ),
        colMd(2)(
          div('Credit Hours*'),
          range4.map((i) => (
            input('number', 'otherCourseHours', otherCourseHours && otherCourseHours[i])
          ))
        ),
      ),

      row(
        colMd(4)(
          div('Note:'),
          x('textarea.form-control')(
            { rows: 6, name: 'note' },
            note
          )
        )
      ),
      hr(),

      row(
        colMd(4)(
          div('List any other courses here that you believe are relevant to your program of study.'),
          x('textarea.form-control')(
            { rows: 6, name: 'otherCourses' },
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
          x('textarea.form-control')(
            { rows: 6, name: 'minor' },
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
        select(
          { name: 'backgroundPrepWorkSheet' },
          option({ value: backgroundPrepWorkSheet }, backgroundPrepWorkSheet),
          option({ value: 'false' }, 'False'),
          option({ value: 'true' }, 'True'),
        )
      ),

      div('B. Program Product requirement*'),
      colMd(4)(
        select(
          { name: 'programProductRequirement' },
          option({ value: programProductRequirement }, programProductRequirement),
          option({ value: 'false' }, 'False'),
          option({ value: 'true' }, 'True'),
        )
      ),

      div('C. PhD. Written Exam (a.k.a. the writing requirement)*'),
      colMd(4)(
        select(
          { name: 'PHDWrittenExam' },
          option({ value: PHDWrittenExam }, PHDWrittenExam),
          option({ value: 'false' }, 'False'),
          option({ value: 'true' }, 'True'),
        )
      ),

      div('D. PhD Oral Comprehensive Exam*'),
      colMd(4)(
        select(
          { name: 'PHDOralExam' },
          option({ value: PHDOralExam }, PHDOralExam),
          option({ value: 'false' }, 'False'),
          option({ value: 'true' }, 'True'),
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
        colMd(2)('Select Advisor'),
        colMd(2)('Select Chair'),
      ),

      row(
        colMd(6)(
          range6.map((i) => (
            x('div.form-group.row')(
              x('label.col-md-2')(`${i+1}.* `),
              colMd(10)(
                input('text', 'committee', committee && committee[i], true)
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
          { name: 'approved' },
          option({ value: approved }, approved),
          option({ value: 'Approved' }, 'Approved'),
          option({ value: 'Disapproved' }, 'Disapproved'),
        )
      ),
      hr(),

      row(
        colMd(4)(
          div('Reason for Disapproved and Needed Adjustments Stated Here '),
          x('textarea.form-control')(
            { rows: 6, name: 'reasonApproved' },
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

      editAccess
        ? [
          vert,
          x('div.hidden')({ id: 'errorMessage' }),
          x('button.btn.btn-primary.CS06-submit')({ type: 'submit' }, 'Submit')
        ]
      : null,
    )
  )
}

const namePidRow = (opts, editAccess) => {
  const { student, form } = opts
  const { lastName, firstName, pid } = student
  const { dateEntered } = form
  const name = `${lastName}, ${firstName}`
  const { div } = x
  const value = editAccess
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val))
  return (
    row(
      colMd(4)(
        div('Name*'),
        value('text', 'name', name)
      ),
      colMd(4)(
        div('PID*'),
        value('number', 'pid', pid)
      ),
      colMd(4)(
        div('Date entered program*'),
        value('text', 'dateEntered', dateEntered)
      ),
    )
  )
}

const pageScript = (nonce, form) => {
  const { committee, advisor, chairman } = form
  const el = x('script')({ type: 'text/javascript' })
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText(committee, advisor, chairman)
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute('nonce', nonce)
  return el
}

const pageScriptText = (committee, advisor, chairman) => (`
  document.addEventListener('DOMContentLoaded', () => {
    const committee = ${JSON.stringify(committee)}
    const advisor = '${advisor}'
    const chairman = '${chairman}'
    setRadioishButtonClickHandlers()
    if (committee) setRadioishButtonDefaults(committee, advisor, chairman)
    setRadioishSelectionRequirement()
    setNoCourseOverlapRequirement()
    setNameChangeListeners()
  })

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
      if (!advsr || !chair) event.preventDefault()
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

  const updatePage = (key, index) => {
    const buttons = document.querySelectorAll('.btn.' + key)
    const isActive = buttons[index].ariaPressed === 'true'
    const name = isActive ? '' : document.querySelectorAll('[name=committee]')[index].value
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
    document.querySelector('[name=' + name + ']').value = value
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
