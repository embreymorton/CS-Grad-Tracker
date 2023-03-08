const x = require('hyperaxe')
const { checkbox, script, input } = require('../common/baseComponents')

/**
 * Row for a checkbox signature with a label that updates the date signed. The 'Signature' field it updates should be a Boolean in the schema.
 * 
 * @param {Boolean} editAccess 
 * @param {String} name of schema field without the text 'Signature'. e.g. if schema field is `studentSignature`, then the argument passed should be 'student'.  
 * @param {CSXX} form object with a schema field
 * @param {*} nonce 
 * @param {Boolean} isRequired
 * @returns 
 */
const signatureRow = (editAccess, name, form, nonce, {isRequired = false} = {}) => {
  const row = x('.row')
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x

  // selectors
  const fieldSignature = `${name}Signature`
  const fieldDateSigned = `${name}DateSigned`
  const signerTitle = name.charAt(0).toUpperCase() + name.slice(1);

  // initial values
  const isApproved = Boolean(form[fieldSignature]) && form[fieldSignature] !== 'false';
  const approvedDate =  isApproved ? new Date(form[fieldDateSigned]) : new Date();
  const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
  const hasNotYetApprovedText = `(${signerTitle} has not yet approved.)`
  return row(
    col(5)(
      checkbox(
        fieldSignature,
        isApproved,
        nonce,
        {
          isDisabled: !editAccess,
          isRequired,
          overrideFalse: ""
        }
      ),
      input( // hidden input field for date's value
        fieldDateSigned,
        isApproved ? approvedDate.toString() : '',
        {isHidden: true}
      ),
      x(`em#label-${fieldSignature}`)(isApproved ? 
        `(${signerTitle} approved on ${approvedDateMMDDYYYY})` :
        hasNotYetApprovedText
      ),
      script(nonce,
        `
        document.getElementById('checkbox-${fieldSignature}').addEventListener('change', (e) => {
          const checkbox = e.target;
          const dateSigned = document.getElementById('input-${fieldDateSigned}');
          const label = document.getElementById('label-${fieldSignature}');
          if (checkbox.checked) {
            const now = new Date();
            label.innerText = "(${signerTitle} approved on " + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + ".)";
            dateSigned.value = now.toString();
          } else {
            label.innerText = "${hasNotYetApprovedText}";
            dateSigned.value = null
          }
        })
        `,
        {defer: ''}
      )
    )
  )
}

module.exports = signatureRow
