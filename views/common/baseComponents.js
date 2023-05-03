const x = require('hyperaxe')
const { div } = x

/**
 * baseComponents.js
 * 
 * A series of basic form elements and their helper functions in hyperscript
 * Currently includes: checkbox, dropdown, radio, script.
 * 
 * `name` arguments are also used to generate 'data-cy' attributes for cypress testing. Currently
 * these will only show up on dev or testing env. The difference between 'data-cy' and 'name' attributes
 * is that even thought the values are the same, during cypress testing, 'data-cy' should be on the 
 * element of user interaction, while 'name' should be on the element that sends data to the server on form submission.
 * 
 * When building your own complex component from these base components, make sure to set `subcomp` to `true` in options.
 * This will turn off the `name` and `data-cy` attributes so you can set them manually. The `name` parameter will
 * instead just set the `id` field.
 * 
 * Pass in additional attributes inside the last optional argument in the attrs field, which uses this syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters#destructured_parameter_with_default_value_assignment.
 */

// for any `name` parameter, please ensure that the `name` matches a field in a form's schema AND that it only includes valid html attribute characters!

const isProd = process.env.mode == 'production' // to reduce string comparisons
const binattr = (cond) => cond ? '' : null // as in hyperscript, `''` = exists while `null` = none
const datacy = (name, subcomp) => (isProd || subcomp ? {} : {'data-cy': name})

/**
 * Creates a checkbox input with the proper styling AND unlike html's basic checkbox,
 * if this checkbox is unchecked, then a value of `false` will still be sent. If this
 * checkbox is checked, then a value of `true` will be sent. 
 * @param {String} name matches a field name on the form's schema, should be unique per page, sets the physical id of the textbox as `checkbox-${name}`
 * @param {Boolean} isChecked is the initial state of the checkbox
 * @param nonce as component uses js, nonce/cspNonce needs to be passed (usually a field in `opts`)
 * @param {Object} options
 * @param {Boolean} options.isDisabled
 * @param {Boolean} isRequired 
 * @param {String} overrideTrue instead of sending "true" when the checkbox is checked, send this value
 * @param {String} overrideFalse instead of sending "false" when the checkbox is unchecked, send this value
 * @param {Object} attrs additional attributes
 * @returns 
 */
 const checkbox = (name, isChecked, nonce, {isDisabled = false, isInline = false, isRequired = true, overrideTrue = 'true', overrideFalse = 'false', subcomp = false, attrs = {}} = {}) => {
  const id_suffix = name
  const checked = binattr(isChecked)
  const disabled = binattr(isDisabled)
  const required = binattr(isRequired)
  if (subcomp) name = null

  return [
    x(`input.form-control#checkbox-${id_suffix}`)( // the physical checkbox just functions like a button that sets a hidden input's value
      {type: 'checkbox', ...datacy(name, subcomp), required, checked, disabled, ...attrs},
    ),
    x(`input#checkboxValue-${id_suffix}`)( // this hidden input contains the actual true/false value for the checkbox
      {type: 'hidden', name, value: isChecked ? overrideTrue : overrideFalse, disabled},
    ),
    script(nonce,
      `
      document.getElementById("checkbox-${id_suffix}").addEventListener('change', () => {
        const physicalCheckbox = document.getElementById("checkbox-${id_suffix}");
        const checkboxValue = document.getElementById("checkboxValue-${id_suffix}");
        if (physicalCheckbox.checked) {
          checkboxValue.value = "${overrideTrue}";
        } else {
          checkboxValue.value = "${overrideFalse}";
        }
      })
      `
    )
  ]
}

/** a generic dropdown
 * @param name - name attribute of element, id is also set to `select-${name}`
 * @param options - list of dropdown options (use makeOption), one element in this list should have 'selected' attribute
 * @param {Boolean} isDisabled - whether the user can interact with dropdown (NOTE: ensure backend prevent submission from changing html)
 * @param {Boolean} isRequired - whether the option is
 * @param {String} blankOption - description of initial empty valued option, set to null if no blank option is desired
 * @param blankValue - if blankOption exists, this sets the default value of the null option
 */
 const dropdown = (name, options, {isDisabled = false, isRequired = true, blankOption = null, blankValue = '', subcomp = false, attrs = {}} = {}) => {
  const id = `select-${name}`
  const disabled = isDisabled ? {disabled: ''} : {}
  const required = isRequired ? {required: ''} : {}
  if (subcomp) name = null

  return x(`select.form-control#${id}`)(
    {name, ...datacy(name, subcomp), ...disabled, ...required, ...attrs}, 
    blankOption !== null ? 
      makeOption(blankValue, blankOption, true, true) 
      : null,
    options
  )
}

/**
 * makes hyperscript options for `dropdown()`
 * @param value - value of option
 * @param {String} text - innerHTML of the option
 * @param {Boolean} isSelected - whether option is *initially* selected
 * @param {Boolean} isHidden - whether the option is selectable 
 * @returns 
 */
const makeOption = (value, text, isSelected = false, isHidden = false, attrs = {}) => x('option')(
  {
    value, 
    ...(isSelected ? {selected: ''} : {}), 
    ...(isHidden ? {hidden: ''} : {}),
    ...attrs
  }, 
  text
)

/**
 * Creates an array of option elements accepting a list of options as a value-label pair like radio set.
 * @param {*} valueLabelList - a list in the form: [[value0, labelText0], [value1, labelText1], ...]
 * @param {*} currentValue 
 * @returns 
 */
const optionSet = (valueLabelList, currentValue) => valueLabelList.map((pair) => makeOption(pair[0], pair[1], pair[0] == currentValue))

/**
 * Creates a datalist object to be attached inputs to turn it into a combobox.
 * Note: attach to an input of any type by adding attribute list, eg. `<input list="id-of-datalist-here">`
 * @param {String} id of datalist
 * @param {*} valueLabelList - a list in the form: [[value0, labelText0], [value1, labelText1], ...]
 * @returns 
 */
const datalist = (id, valueLabelList) => x(`datalist#${id}`)(valueLabelList.map((pair) => makeOption(pair[0], pair[1])))

/**
 * Creates a radio button with proper styling.
 * @param {String} name matches a field name on the form's schema
 * @param {*} value
 * @param {String} label text for label next to radio button
 * @param {*} options optional kwargs:  
 * `currentValue` will auto-check the radio button if `currentValue === value`  
 * `isDisabled` will disable the radio button on the front-end  
 * `isChecked` will override `currentValue` and force radio button to be checked  
 * `isRequired` will force at least one of the radio buttons with this name to be selected  
 * `attrs` are additional attributes
 * @returns 
 */
 const radio = (name, value, label, {currentValue = null, isDisabled = false, isChecked = false, isRequired = true, subcomp = false, attrs = {}} = {}) => {
  const id = `radio-${name}`
  const checked = currentValue === value || isChecked ? { checked: '' } : {}
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  if (subcomp) name = null

  return x('div.form-check.form-radio')(
    x(`input.form-check-input.check-radio#${id}-${value}`)({name, value, type: 'radio', ...datacy(name, subcomp), ...checked, ...disabled, ...required, ...attrs}),
    x(`label.form-check-label`)({for: `${id}-${value}`}, label)
  )
}

/**
 * A button that unchecks all the radio buttons with this `name` attribute.
 * @param {*} name 
 * @param {*} nonce
 * @param {*} label 
 */
const radioReset = (name, nonce, label = 'Reset Selection') => {
  return [x('div.form-check.form-radio')(
    x(`button.btn.btn-secondary#reset-radio-${name}`)({type: 'button'}, label)
  ),
  script(nonce, 
    `document.getElementById('reset-radio-${name}').addEventListener('click', () => {
      document.querySelectorAll('input[name="${name}"]:checked').forEach((radio) => radio.checked = false)
    })`  
  )]
}

/**
 * Creates a list of radio buttons with the proper styling based on a list of value-label pairs
 * @param {*} name - matches a field name on the form's schema
 * @param {*} valueLabelList - a list in the form: [[value0, labelText0], [value1, labelText1], ...]
 * @param {*} options - optional kwargs:  
 * `currentValue` will auto-check the radio button if `currentValue === value`  
 * `isDisabled` will disable the radio buttons on the front-end  
 * `isRequired` will force at least one of the radio buttons in the set to be selected  
 */
const radioSet = (name, valueLabelList, {currentValue = null, isDisabled = false, isRequired = true} = {}) => valueLabelList.map(pair => radio(name, pair[0], pair[1], {currentValue, isDisabled, isRequired}))

/**
 * Creates a text input box.
 * @param {String} name matches a field name on the form's schema, an id of `input-${name}` will also be set
 * @param {*} value - initial value the input should have
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired defaults true 
 * @param {Boolean} isHidden defaults false
 * @param {String} placeholder hint text for input
 * @param {Object} attrs addtional attributes
 */
const input = (name, value, {isDisabled = false, isRequired = true, isHidden = false, placeholder = '', subcomp = false, attrs = {}} = {}) => {
  const id = `input-${name}`
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  const type = isHidden ? 'hidden' : 'text'
  if (subcomp) name = null

  return x(`input.form-control#${id}`)({type, name, value, ...datacy(name, subcomp), ...required, ...disabled, ...attrs, placeholder})
}

/**
 * Create a date picker input formatted as ISO8601 (YYYY-MM-DD)
 * @param {String} name matches a field name on the form's schema, an id of `input-${name}` will also be set
 * @param {*} value - initial value the input should have
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired defaults true 
 * @param {Boolean} isHidden defaults false
 * @param {String} min earliest selectable date in ISO8601 format
 * @param {String} max latest selectable date in ISO8601 format
 * @param {String} placeholder hint text for input
 * @param {Object} attrs addtional attributes
 */
const dateInput = (name, value, {isDisabled = false, isRequired = true, isHidden = false, min='', max='', placeholder = '', subcomp = false, attrs = {}} = {}) => {
  const id = `dateInput-${name}`
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  if (subcomp) name = null
  return x(`input.form-control#${id}`)({type: 'date', name, value, min, max, ...datacy(name, subcomp), ...required, ...disabled, ...attrs, placeholder})
}

/**
 * 
 * @param {String} name matches a field name on the form's scheme
 * @param {String} value initial text in the textarea
 * @param {Boolean} isDisabled default false
 * @param {Boolean} isRequired default true
 * @param {Number} rows default number of rows of text (default 8)
 * @param {Object} attrs additional attributes
 * @returns 
 */
const textarea = (name, value, {isDisabled = false, isRequired = true, rows = 8, subcomp = false, attrs = {}} = {}) => {
  const id = `textarea-${name}`
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  if (subcomp) name = null

  return x(`textarea.form-control#${id}`)({name, rows, ...datacy(name, subcomp), ...required, ...disabled, ...attrs}, value)
}

/**
 * Creates a \<script\> element for when you need front-end js execution
 * @param {*} nonce as component is js, nonce/cspNonce needs to be passed (usually a field in `opts`)
 * @param {String} scriptBody front-end js code wrapped as a string
 * @param {Object} attributes additional attributes on the \<script\>
 * 
 * What is a nonce for? https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
 */
const script = (nonce, scriptBody, attributes = {}) => {
  const script = x('script')({ type: 'text/javascript', ...attributes})
  script.innerHTML = scriptBody
  script.setAttribute('nonce', nonce)
  return script
}

module.exports = { checkbox, script, dropdown, makeOption, optionSet, datalist, radio, radioSet, radioReset, input, dateInput, textarea }