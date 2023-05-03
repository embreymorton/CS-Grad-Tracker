const x = require('hyperaxe')
const { dropdown, makeOption } = require('../common/baseComponents')

const DEFAULT_OTHER_KEY = '_'
const getOtherKey = () => DEFAULT_OTHER_KEY

/**
 * A dropdown that creates a list of faculty options for you. Saves the selected value as `firstName lastName`.
 * @param {String} name - name attribute of element, id is also set to `select-${name}`
 * @param {Array} options - list of dropdown options (use makeOption), one element in this list should have 'selected' attribute
 * @param {Array[FacultySchema]} faculty - list of faculty from the database
 * @param {Boolean} isDisabled - whether the user can interact with dropdown (NOTE: ensure backend prevent submission from changing html)
 * @param {Boolean} isRequired - whether the option is
 * @param {String} blankOption - description of initial empty valued option, set to null if no blank option is desired
 * @param blankValue - if blankOption exists, this sets the default value of the null option
 * @param {Boolean} allowOther - whether to have an others option. If `value` is truthy AND doesn't match any of the faculty, other will be selected
 * @param {*} otherValue - if allowOther, this will be the value of the "Other" option
 * @param {String} otherPlaceholder - if allowOther, this will be the text of the "Other" option
 */
const facultyDropdown = (name, value, faculty, {isDisabled = false, isRequired = true, blankOption = 'Select faculty member.', blankValue = '', allowOther = false, otherValue = getOtherKey(), otherPlaceholder = 'Other', subcomp = false, attrs = {}} = {}) => {
  let hasMatch = false
  const options = [...faculty]
    .sort((a, b) => a.lastName.localeCompare(b.lastFirst))
    .map((f) => { 
      if (f.fullName == value) {
        hasMatch = true
      }
      return makeOption(f.fullName, f.lastFirst, f.fullName == value)
    })
  
  if (allowOther) {
    options.push(makeOption(otherValue, otherPlaceholder, Boolean(value) && !hasMatch))
  }

  return dropdown(
    name, 
    options, 
    {
      isDisabled,
      isRequired,
      blankOption,
      blankValue,
      subcomp,
      attrs
    }
  )
}

module.exports = {facultyDropdown, DEFAULT_OTHER_KEY}