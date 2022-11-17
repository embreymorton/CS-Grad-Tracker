const { dropdown, makeOption } = require('../common/baseComponents')
const grades = ['H+','H-', 'P+','P-','L+','L-', 'F+', 'F-']

/**
 * 
 * @param {String} name name of field in the schema
 * @param {Schema.Types.ObjectId} value `._id` property of the current semester schema object
 * @param {[GradeSchema]} semesters list of semesters from opts object
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired
 * @param {String} placeholder text displayed when no option is selected
 * @returns 
 */
const gradeDropdown = (name, value, isDisabled, {isRequired = true, placeholder = 'Select a grade from the dropdown'} = {}) => {
  return dropdown(
    name, 
    grades.map((grade) => makeOption(grade, grade, value?.equals(grade))), 
    {
      isDisabled, 
      isRequired,
      blankOption: placeholder
    }
  )
}

module.exports = {gradeDropdown}