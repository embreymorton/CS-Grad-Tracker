const x = require('hyperaxe')
const page = require('../page')
const uploadFeedback = require('../common/uploadFeedback')
const studentBar = require('../common/studentBar')
const input = require('../common/input')
const { row, colMd } = require('../common/grid')
const signatureRow = require('../common/signatureRow')
const approvalCheckboxRow = require('../common/approvalCheckboxRow')
const pseudoInput = require('../common/pseudoInput')
const cancelEditButton = require('../common/cancelEditButton')
const buttonBarWrapper = require('../common/buttonBarWrapper')
const disableSubmitScript = require('../common/disableSubmitScript')
const saveEditButton = require('../common/saveEditsButton')
const util = require('../../controllers/util')

const main = (opts) => {
  const { formName } = opts
  const title = `Submitted ${formName} Forms`
  return page(
    {...opts, title},
    studentBar(opts),
    mainContent(opts)
  )
}

const mainContent = (opts) => {
  const { student, formName, forms, titleField, subtitleField, isStudent } = opts
  const { lastName, firstName } = student
  const { h4, h3, div, p, strong, hr, a } = x
  const flexdiv = x('div.d-flex.flex-wrap.justify-content-start.align-items-center')

  const formBlocks = forms.map((form) => singleForm(form, opts))

  return [
    h4(lastName, ', ', firstName),
    h3(formName),
    h3(`Saved Submissions`),
    flexdiv(
      formBlocks.length == 0 ? div("No saved forms.") : null,
      ...formBlocks
    ),
    a({href: isStudent ? 
        `/studentView/multiforms/${formName}/new/false` 
        : `/student/multiforms/view/${student._id}/${formName}/new/false`, 
      class: 'btn btn-primary'
    }, 'Create New Form')
  ]
}

const singleForm = (form, opts) => {
  const { formName, titleField, subtitleField, isStudent, student } = opts
  const { h6, div, i } = x
  const gutterbox = x('div.col-md-4.col-12')
  const box = x('div.bg-light.rounded.p-2.m-2')
  const abutton = x('a.btn.btn-primary')

  return gutterbox(box(
    h6(form[titleField] || "Untitled"),
    div(form[subtitleField] || "---"),
    div(`Completed: ${util.checkFormCompletion(formName, form) ? '✅ Yes' : '❌ No'}`),
    abutton({href: isStudent ? 
      `/studentView/multiforms/${formName}/${form._id}/false` 
      : `/student/multiforms/view/${student._id}/${formName}/${form._id}/false`
    }, 'View')
  ))
}


module.exports = main