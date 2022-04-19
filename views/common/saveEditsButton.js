const x = require('hyperaxe')


/**
 * 
 * @param {String} studentId if undefined/null, then defaults to /studentView/forms
 * @returns HTML anchor that links back to the forms page
 */
const saveEditButton = (postMethod) => {
  // for some reason HyperScript/Axe hates formNoValidate, so we make frontend add it when page is loaded in `disableSubmitScript.js`
  const splittedPostMethod = postMethod.split('/')
  splittedPostMethod[3] = "save"
  return x('button.btn.btn-success#save-btn')({type: 'submit', formaction: splittedPostMethod.join('/'), formNoValidate: true}, 'Save')
}

module.exports = saveEditButton