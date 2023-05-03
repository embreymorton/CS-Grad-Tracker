const x = require('hyperaxe')
const { checkbox, script, input } = require('./baseComponents')

const row = x('.row')
const col = (n) => (x(`div.col-md-${n}`))
const { em, div } = x

/**
 * Like `signatureRow` except will automatically fill out approval with the name of the viewer.
 * Note: it is not recommended to use this for students because students who know F12 can easily impersonate others.
 * 
 * @param {String} nameField field where signer's name should be set
 * @param {String} dateField field where date signed should be set
 * @param {CSXX} form object with the fieldname specified
 * @param {facultySchema | studentSchema} viewer from `opts`, a Faculty or Student profile of the person currently viewing the form
 * @param {*} nonce 
 * @param options
 * @returns 
 */

const viewerApprovalRow = (nameField, dateField, form, viewer, nonce, {signerTitle = '', isRequired = false, isDisabled = false} = {}) => {
  // selectors
  const signerName = form[nameField] // has a value only if previously approved
  const viewerName = viewer.fullName

  // initial values
  const isApproved = Boolean(form[nameField]) && form[nameField] !== 'false';
  const approvedDate =  isApproved ? new Date(form[dateField]) : new Date();
  const makeApprovedText = signerTitle ? 
    (dateobj, name) => `(${signerTitle} ${name} signed on ${dateobj.getMonth()+1}/${dateobj.getDate()}/${dateobj.getFullYear()})`
    : (dateobj, name) => `(${name} signed on ${dateobj.getMonth()+1}/${dateobj.getDate()}/${dateobj.getFullYear()})`
  const approvedText = makeApprovedText(approvedDate, signerName)
  const hasNotYetApprovedText = signerTitle ? `(${signerTitle} has not yet signed.)` : `(Has not yet been signed.)`
  return [
    row(
      col(5)(
        checkbox(
          nameField,
          isApproved,
          nonce,
          {
            isDisabled,
            isRequired,
            overrideFalse: "",
            overrideTrue: viewerName
          }
        ),
        input( // hidden input field for date's value
          dateField,
          isApproved ? approvedDate.toString() : '',
          {isHidden: true}
        ),
        )
        ),
    row(
      col(12)(
        x(`em#label-${nameField}`)(isApproved ? 
            approvedText :
            hasNotYetApprovedText
        ),
        script(nonce,
            `
            document.getElementById('checkbox-${nameField}').addEventListener('change', (e) => {
              const signerTitle = "${signerTitle}"
              const makeApprovedText = ${makeApprovedText.toString()}
              const checkbox = e.target;
              const dateSigned = document.getElementById('input-${dateField}');
              const label = document.getElementById('label-${nameField}');
              if (checkbox.checked) {
                const now = new Date();
                label.innerText = makeApprovedText(now, "${viewerName}");
                dateSigned.value = now.toString();
              } else {
                label.innerText = "${hasNotYetApprovedText}";
                dateSigned.value = null
              }
            })
            
            // set initial value of checkbox's value to be whatever was originally in the db if already approved
            if (${isApproved}) {
              document.getElementById('checkboxValue-${nameField}').value = "${signerName}";
            }
            `,
            {defer: ''}
        )
      )
    )
  ]
}

module.exports = viewerApprovalRow
