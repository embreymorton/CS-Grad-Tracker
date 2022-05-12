const x = require('hyperaxe')


/**
 * 
 * @param {String} studentId if undefined/null, then defaults to /studentView/forms
 * @returns HTML anchor that links back to the forms page
 */
const saveEditButton = (postMethod) => {
  // for some reason HyperScript does not support the formNoValidate attribute (https://github.com/1N50MN14/html-element/blob/master/html-attributes.js), so we write raw html
  const splittedPostMethod = postMethod.split('/')
  splittedPostMethod[3] = "save"
  return x('span')({innerHTML: `
    <button 
      class="btn btn-success" 
      id="save-btn" 
      type="submit" 
      formAction="${splittedPostMethod.join('/')}" 
      formNoValidate>
      Save
    </button>` })
}

module.exports = saveEditButton