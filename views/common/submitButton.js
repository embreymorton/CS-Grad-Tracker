const x = require('hyperaxe')
const disableSubmitScript = require('./disableSubmitScript')
const {alertBox, triggerModalButton} = require('./alertBox')

function submitButton(opts) {
  const {isComplete, VA, formName} = opts
  if (isComplete) {
    return null
  }

  const submitButton = x(`button.btn.btn-primary.submit-btn#submit-btn`)(
    { type: 'submit' }, 'Submit'
  )

  if (VA.hasLevel('admin')) {
    return [
      triggerModalButton({id: 'submit-btn-modal',class: `submit-btn btn btn-primary`, type: 'button'},
        'Submit',
        `${formName}-confirm-submit`
      ),
      alertBox(
        `${formName}-confirm-submit`,
        'Submit Confirmation',
        'Are you sure you want to edit this page?',
        submitButton
      )
    ]
  }
  return isComplete ? 
    null 
    : 
    [
      submitButton,
      disableSubmitScript(opts)
    ]
}

module.exports = submitButton