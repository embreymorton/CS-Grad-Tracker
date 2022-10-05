const x = require('hyperaxe')
const { div } = x

// for any `name` parameter, please ensure that the `name` matches a field in a form's schema AND that it only includes valid html attribute characters!

/**
 * Creates a checkbox input with the proper styling AND unlike html's basic checkbox,
 * if this checkbox is unchecked, then a value of `false` will still be sent. If this
 * checkbox is checked, then a value of `true` will be sent. 
 * @param {String} name matches a field name on the form's schema, should be unique per page
 * @param {Boolean} isChecked is the initial state of the checkbox
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired 
 * @returns 
 */
 const checkbox = (name, isChecked, {isDisabled = false, isInline = false, isRequired = true} = {}) => {
  const checked = isChecked ? { checked: '' } : {}
  const disabled = isDisabled ? { disabled: '' } : {}
  const required = isRequired ? { required: '' } : {}
  return div(
    x(`input.form-control#checkbox-${name}`)( // the physical checkbox just functions like a button that sets a hidden input's value
      {type: 'checkbox', ...required, ...checked, ...disabled},
    ),
    x(`input#checkboxValue-${name}`)( // this hidden input contains the actual true/false value for the checkbox
      {type: 'hidden', name, value: false, ...disabled},
    ),
    x('script')( // this script sets up the handler to connect the physical checkbox and the hidden input
      `
      const changeHandler = () => {
      document.getElementById("checkbox-${name}").addEventListener('change', () => {
        const physicalCheckbox = document.getElementById("checkbox-${name}");
        const checkboxValue = document.getElementById("checkboxValue-${name}");
        if (physicalCheckbox.checked) {
          physicalCheckbox.setAttribute('value', true);
        } else {
          physicalCheckbox.setAttribute('value', false);
        }
      });
      `
    )
  )
}

module.exports = {checkbox}