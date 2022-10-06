const x = require('hyperaxe')
const { div } = x

/**
 * baseComponents.js
 * 
 * A series of basic form elements and their helper functions in hyperscript
 * Currently includes: checkbox, dropdown, radio, script
 */

// for any `name` parameter, please ensure that the `name` matches a field in a form's schema AND that it only includes valid html attribute characters!

/**
 * Creates a checkbox input with the proper styling AND unlike html's basic checkbox,
 * if this checkbox is unchecked, then a value of `false` will still be sent. If this
 * checkbox is checked, then a value of `true` will be sent. 
 * @param {String} name matches a field name on the form's schema, should be unique per page
 * @param {Boolean} isChecked is the initial state of the checkbox
 * @param nonce as component uses js, nonce/cspNonce needs to be passed (usually a field in `opts`)
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired 
 * @returns 
 */
 const checkbox = (name, isChecked, nonce, {isDisabled = false, isInline = false, isRequired = true} = {}) => {
  const checked = isChecked ? { checked: '' } : {}
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}

  return div(
    x(`input.form-control#checkbox-${name}`)( // the physical checkbox just functions like a button that sets a hidden input's value
      {type: 'checkbox', ...required, ...checked, ...disabled},
    ),
    x(`input#checkboxValue-${name}`)( // this hidden input contains the actual true/false value for the checkbox
      {type: 'hidden', name, value: isChecked, ...disabled},
    ),
    frontendScript(nonce,
      `
      document.getElementById("checkbox-${name}").addEventListener('change', () => {
        const physicalCheckbox = document.getElementById("checkbox-${name}");
        const checkboxValue = document.getElementById("checkboxValue-${name}");
        if (physicalCheckbox.checked) {
          checkboxValue.setAttribute('value', true);
        } else {
          checkboxValue.setAttribute('value', false);
        }
      })
      `
    )
  )
}

/** a generic dropdown
 * @param name - name attribute of element, id is also set to `select-${name}`
 * @param options - list of dropdown options (use makeOption), one element in this list should have 'selected' attribute
 * @param isDisabled - boolean on whether the user can interact with dropdown (NOTE: ensure backend prevent submission from changing html)
 * @param isRequired - boolean on whether the option i
 * @param blankOption - String description of initial empty valued option, set to null if no blank option is desired
 */
 const dropdown = (name, options, {isDisabled = false, isRequired = true, blankOption = null} = {}) => {
  if (blankOption !== null)
    options.unshift(makeOption('', blankOption, true, true))
  const disabled = isDisabled ? {disabled: ''} : {}
  const required = isRequired ? {required: ''} : {}
  return x(`select.form-control#select-${name}`)({name, ...disabled, ...required}, options)
}

/**
 * makes hyperscript options for `dropdown()`
 * @param value - value of option
 * @param text - innerHTML of the option
 * @param isSelected - boolean on whether option is *initially* selected
 * @param isHidden - boolean on whether the option is selectable 
 * @returns 
 */
const makeOption = (value, text, isSelected = false, isHidden = false) => x('option')(
  {
    value, 
    ...(isSelected ? {selected: ''} : {}), 
    ...(isHidden ? {hidden: ''} : {})
  }, 
  text
)

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
 * @returns 
 */
 const radio = (name, value, label, {currentValue = null, isDisabled = false, isChecked = false, isRequired = true} = {}) => {
  const checked = currentValue === value || isChecked ? { checked: '' } : {}
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  return x('div.form-check.form-radio')(
    x(`input.form-check-input.check-radio#radio-${name}-${value}`)({name, value, type: 'radio', ...checked, ...disabled, ...required}),
    x(`label.form-check-label`)({for: `radio-${name}-${value}`}, label)
  )
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
 * Creates a \<script\> element for when you need front-end js execution
 * @param {*} nonce as component is js, nonce/cspNonce needs to be passed (usually a field in `opts`)
 * @param {String} scriptBody front-end js code wrapped as a string
 * @param {Object} attributes additional attributes on the \<script\>
 * 
 * What is a nonce for? https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
 */
const frontendScript = (nonce, scriptBody, attributes = {}) => {
  const script = x('script')({ type: 'text/javascript', ...attributes})
  script.innerHTML = scriptBody
  script.setAttribute('nonce', nonce)
  return script
}


module.exports = {checkbox, frontendScript, dropdown, makeOption, radio, radioSet}