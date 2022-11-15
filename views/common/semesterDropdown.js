const { dropdown, makeOption } = require('../common/baseComponents')

/**
 * 
 * @param {String} name name of field in the schema
 * @param {Schema.Types.ObjectId} value `._id` property of the current semester schema object
 * @param {[SemesterSchema]} semesters list of semesters from opts object
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired
 * @param {String} placeholder text displayed when no option is selected
 * @returns 
 */
const semesterDropdown = (name, value, semesters, isDisabled, {isRequired = true, placeholder = 'Select a semester from the dropdown'} = {}) => {
  return dropdown(
    name, 
    semesters.map((semester) => makeOption(semester._id.toString(), semester.semesterString, value?.equals(semester._id))), 
    {
      isDisabled, 
      isRequired,
      blankOption: placeholder
    }
  )
}

module.exports = {semesterDropdown}