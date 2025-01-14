const x = require('hyperaxe')
const { checkbox, script, input } = require('../common/baseComponents')

/**
 * Like `signatureRow` except can only be checked off by admins and will include the name of the admin checking off this form! This is for Director or Chair positions. In the schema, the signature field should be a string.
 *
 * @param {facultySchema | studentSchema} viewer from `opts`, a Faculty or Student profile of the person currently viewing the form
 * @param {String} name of schema field without the text 'Signature'. e.g. if schema field is `directorSignature`, then the argument passed should be 'director'.
 * @param {CSXX} form object with a schema field
 * @param {*} nonce
 * @returns
 */

const adminApprovalCheckboxRow = (viewer, name, form, nonce) => {
  const row = x('.row')
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x

  // selectors
  const fieldSignature = `${name}Signature`
  const fieldDateSigned = `${name}DateSigned`
  const signerTitle = name.charAt(0).toUpperCase() + name.slice(1);
  const signerName = form[fieldSignature] // has a value only if previously approved
  const viewerName = viewer.fullName

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
          isDisabled: !((name === 'director' && viewer.directorOfGraduateStudies) ||
                        viewer.admin),
          isRequired: false,
          overrideFalse: "",
          overrideTrue: viewerName
        }
      ),
      input( // hidden input field for date's value
        fieldDateSigned,
        isApproved ? approvedDate.toString() : '',
        {isHidden: true}
      ),
      x(`em#label-${fieldSignature}`)(isApproved ?
        `(${signerTitle} ${signerName} approved on ${approvedDateMMDDYYYY})` :
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
            label.innerText = "(${signerTitle} ${viewerName} approved on " + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + ".)";
            dateSigned.value = now.toString();
          } else {
            label.innerText = "${hasNotYetApprovedText}";
            dateSigned.value = null
          }
        })

        // set initial value of checkbox's value to be whatever was originally in the db if already approved
        if (${isApproved}) {
          document.getElementById('checkboxValue-${fieldSignature}').value = "${signerName}";
        }
        `,
        {defer: ''}
      )
    )
  )
}

module.exports = adminApprovalCheckboxRow
