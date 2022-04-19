const x = require('hyperaxe')


/**
 * 
 * @param {String} studentId if undefined/null, then defaults to /studentView/forms
 * @returns HTML anchor that links back to the forms page
 */
const saveEditButton = (studentId) => {
return  x('a.btn.btn-success')({role: "button", href: studentId ? `/student/forms/${studentId}` : "/studentView/forms"}, 'Save')
}

module.exports = saveEditButton