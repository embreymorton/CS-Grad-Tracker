const x = require('hyperaxe')

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

module.exports = {radio, radioSet}