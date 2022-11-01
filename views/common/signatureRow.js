const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')
const pseudoCheckbox = require('./pseudoCheckbox')

const signatureRow = (editAccess, key, values) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const signerName = `${key}Signature`
  const studentName = key.charAt(0).toUpperCase() + key.slice(1);
  const dateName = `${key}DateSigned`
  const checkBoxName = `${key}Checkbox`
  //const roValue = (name, type) => (pseudoInput(values[name]))
  //const rwValue = (name, type) => (input(`${type}`, name, values[name], true))
  //const value = editAccess ? rwValue : roValue

  const isApproved = values.studentSignature;
  const approvedDate =  isApproved ? new Date(values.studentDateSigned) : new Date();
  const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
  const approvalLabel = `In place of your signature, please check the box below:`;
  if (editAccess) {
    return (
      x('.row')(
        col(5)(
          x(`input#${signerName}Checkbox.pseudo-checkbox`)({type: "checkbox", name: checkBoxName, checked: isApproved ? "checked" : undefined}),
          x('br')(),
          x('em')(isApproved ? 
            `(${studentName} approved on ${approvedDateMMDDYYYY})` :
            `(${studentName} has not yet approved)`),
          // creates a hidden text box with the same value as the checkbox so that it will send on form submission
          x(`input#${signerName}`)({type: "hidden", name: signerName, value: isApproved ? true : false}), // force true/false as cannot be undefined.
          x(`input#${dateName}`)({type: "hidden", name: dateName, value: isApproved ? approvedDate.toString() : undefined})
        ),
        pageScript(values, {signerName, dateName})
      )
    )
  } else {
    return (
      x('.row')(
        col(5)(
          pseudoCheckbox(isApproved),
          x('br')(),
          x('em')(isApproved ? 
            `(${studentName} approved on ${approvedDateMMDDYYYY})` :
            `(${studentName} has not yet approved)`)
        )
      )
    )
  }
}

function pageScript(opts, initialState) { 
  const { signerName, dateName } = initialState;
  const el = x('script')({type: 'text/javascript'});
  const approvedDate = new Date();
  const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;

  el.innerHTML =
  `
    onLoad = () => {
      const label = document.getElementById('${signerName}Label');
      const checkbox = document.getElementById('${signerName}Checkbox');
      const approvalData = document.getElementById('${signerName}');
      const dateData = document.getElementById('${dateName}');
      const changeHandler = () => {
        if (checkbox.checked) {

          approvalData.setAttribute("value", true);
          dateData.setAttribute("value", '${approvedDateMMDDYYYY}');
        } else {
          approvalData.setAttribute("value", false);
          dateData.removeAttribute("value");
        }
      }

      checkbox.addEventListener('change', changeHandler);
    }

    document.addEventListener('DOMContentLoaded', onLoad);
  `;
  el.setAttribute('nonce', opts.cspNonce);
  return el
}
module.exports = signatureRow
