const x = require('hyperaxe')
const pseudoInput = require('./pseudoInput')

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
  text)

module.exports = {dropdown, makeOption}