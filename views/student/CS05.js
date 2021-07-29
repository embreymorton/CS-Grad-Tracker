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
  const title = 'CS05 Request for Appointment of M.S. Committee'
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
  const form = !hasAccess
        ? div('You do not have access')
        : cs05Form(opts)
  return [
    h4(lastName, ', ', firstName),
    h3('Request for Appointment of M.S. Committee'),
    h3('CS-05'),
    div(
      { class: 'text-left' },
      form,
    )
  ]
}

const cs05Form = (opts) => {
  const { postMethod, student, form, admin, isStudent } = opts
  const editAccess = admin || isStudent
  const { courseNumber, basisWaiver } = form
  const { div, hr, strong, option, span } = x
  const select = x('select.form-control')
  const vert = x('div.verticalSpace')()
  const range5 = [0, 1, 2, 3, 4]
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

      row(
        colMd(2)(
          div('Appointment for Oral Comprehensive Examination*'),
        ),
        colMd(2)(
          select(
            { name: 'oralComprehensiveExam', required: true },
            option({ value: form.oralComprehensiveExam }, form.oralComprehensiveExam),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True'),
          )
        )
      ),
      vert,

      row(
        colMd(2)(
          div('Thesis*'),
        ),
        colMd(2)(
          select(
            { name: 'thesis', required: true },
            option({ value: form.thesis }, form.thesis),
            option({ value: 'false' }, 'False'),
            option({ value: 'true' }, 'True'),
          )
        )
      ),
      hr(),

      row(
        colMd(4)(strong('Nominee name')),
        colMd(3)(strong('Department')),
        !isStudent ? colMd(3)(strong('Graduate Faculty status')) : null,
        colMd(1)(strong('Advisor')),
        colMd(1)(strong('Chair')),
      ),

      row(
        colMd(4)(
          range5.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                input('text', 'nominees', form.nominees && form.nominees[i])
              )
            )
          ))
        ),

        colMd(3)(
          range5.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                input('text', 'nomineeDepartments', form.nomineeDepartments && form.nomineeDepartments[i])
              )
            )
          ))
        ),

        isStudent ? null : colMd(3)(
          range5.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                input('text', 'nomineeStatuses', form.nomineeStatuses && form.nomineeStatuses[i])
              )
            )
          ))
        ),

        x('div.col-md-1.advisor-buttons')(
          range5.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                x('button.btn.btn-outline-primary.thesisadvisor')(
                  buttonAttrs,
                  'A'
                )
              )
            )
          ))
        ),

        x('div.col-md-1.chair-buttons')(
          range5.map((i) => (
            x('div.form-group.row')(
              colMd(12)(
                x('button.btn.btn-outline-primary.committeeChairman')(
                  buttonAttrs,
                  'C'
                )
              )
            )
          ))
        ),
      ),
      hr(),

      row(
        colMd(1)(div('Thesis advisor:')),
        colMd(3)(
          input('hidden', 'thesisadvisor', form.thesisadvisor, true),
          x('span.label.thesisadvisor')(form.thesisadvisor),
        )
      ),
      hr(),

      row(
        colMd(1)(div('Committee chair:')),
        colMd(3)(
          input('hidden', 'committeeChairman', form.committeeChairman, true),
          x('span.label.committeeChairman')(form.committeeChairman),
        )
      ),
      hr(),

      div('Director of Graduate Studies Signature:*'),
      signatureRow(admin, 'director', form),

      editAccess
        ? [
          vert,
          x('div.hidden')({ id: 'errorMessage' }),
          x('button.btn.btn-primary.CS05-submit')({ type: 'submit' }, 'Submit')
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

const pageScript = (nonce, form) => {
  const { nominees, thesisadvisor, committeeChairman } = form
  const el = x('script')({ type: 'text/javascript' })
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText(nominees, thesisadvisor, committeeChairman)
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute('nonce', nonce)
  return el
}

const pageScriptText = (nominees, thesisadvisor, committeeChairman) => (`
  document.addEventListener('DOMContentLoaded', () => {
    const nominees = ${JSON.stringify(nominees)}
    const thesisadvisor = '${thesisadvisor}'
    const committeeChairman = '${committeeChairman}'
    setRadioishButtonClickHandlers()
    if (nominees) setRadioishButtonDefaults(nominees, thesisadvisor, committeeChairman)
    setRadioishSelectionRequirement()
    setNameChangeListeners()
  })

  const setRadioishButtonClickHandlers = () => {
    // can't use onclick attribute because of content security policy
    ['thesisadvisor', 'committeeChairman'].forEach((key) => {
      document.querySelectorAll('.btn.' + key).forEach(setClickHandler(key))
    })
  }

  const setRadioishButtonDefaults = (nominees, thesisadvisor, committeeChairman) => {
    updatePage('thesisadvisor', nominees.indexOf(thesisadvisor))
    updatePage('committeeChairman', nominees.indexOf(committeeChairman))
  }

  const setRadioishSelectionRequirement = () => {
    document.querySelector('form.cs-form').addEventListener('submit', (event) => {
      const advsr = document.querySelector('[name=thesisadvisor]').value
      const chair = document.querySelector('[name=committeeChairman]').value
      if (!advsr && !chair) showError('you must set both an advisor and a chair')
      else if (!advsr) showError('you must set an advisor')
      else if (!chair) showError('you must set a chair')
      else hideError()
      if (!advsr || !chair) event.preventDefault()
    })
  }

  const setNameChangeListeners = () => {
    document.querySelectorAll('[name=nominees]').forEach((input, index) => {
      input.addEventListener('input', ({ target }) => {
        const { value } = target
        if (selectedAdvisorIndex() == index) updateValue('thesisadvisor', value)
        if (selectedChairIndex() == index) updateValue('committeeChairman', value)
      })
    })
  }

  const setClickHandler = (key) => (el, index) => (
    el.addEventListener('click', () => { updatePage(key, index) })
  )

  const updatePage = (key, index) => {
    const buttons = document.querySelectorAll('.btn.' + key)
    const isActive = buttons[index].ariaPressed === 'true'
    const name = isActive ? '' : document.querySelectorAll('[name=nominees]')[index].value
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
