const x = require('hyperaxe')

/**
 * 
 * @param {String} studentId if undefined/null, then defaults to /studentView/forms
 * @returns HTML anchor that links back to the forms page
 */
const cancelEditButton = (studentId) => {
  return x('a.btn.btn-secondary')({role: "button", href: studentId ? `/student/forms/${studentId}` : "/studentView/forms"}, 'Cancel')
}

module.exports = cancelEditButton