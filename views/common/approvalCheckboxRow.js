const x = require('hyperaxe');
const pseudoCheckbox = require('./pseudoCheckbox')

/**
 * A group of HTML elements that replace a signature box and a date box for
 * a checkbox and includes automated timestamping based on the time the checkbox was approved.
 * 
 * For it to work with the database, the form's schema must have a Boolean "{signer}Signature" field
 * and a String "{signer}DateSigned" field.
 * @param {Number} editAccess should be passed in from app.js; 0 = student, no write access
 * @param {String} signer position of person to sign the document - eg. 'advisor', 'chair', etc.
 * @param {Object} opts must include `{ cspNonce, form, student }`. 
 * `form` is the Mongo query for the current form.
 * `student` is the Mongo query for the student and should have faculty populated.
 */
const approvalCheckbox = (editAccess, signer, opts) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { advisor, otherAdvisor } = opts.student;
  
  const signerName = `${signer}Signature`;
  const dateName = `${signer}DateSigned`;
  const advisorName = advisor && advisor.lastName ? `${advisor && advisor.firstName} ${advisor && advisor.lastName}` : otherAdvisor || '(unspecified)';

  const isApproved = opts.form.advisorSignature;
  const approvedDate =  isApproved ? new Date(opts.form.advisorDateSigned) : new Date();
  const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
  const approvalLabel = isApproved ? 
    `Advisor ${advisorName} approved as of ${approvedDateMMDDYYYY}.` :
    `Advisor ${advisorName} approves:`;

  if (editAccess) {
    return ( // advisor/faculty's view 
      x('.row')(
        col(5)(
          x(`em#${signerName}Label`)(approvalLabel),
          x(`input#${signerName}Checkbox.form-control`)({type: "checkbox", checked: isApproved ? "checked" : undefined}),
          // creates a hidden text box with the same value as the checkbox so that it will send on form submission
          x(`input#${signerName}`)({type: "hidden", name: signerName, value: isApproved ? true : false}), // force true/false as cannot be undefined.
          x(`input#${dateName}`)({type: "hidden", name: dateName, value: isApproved ? approvedDate.toString() : undefined})
        ),
        pageScript(opts, {signerName, dateName, advisorName})
      )
    );
  } else {
    return ( // student's view
      x('.row')(
        col(5)(
          pseudoCheckbox(isApproved),
          x('em')(isApproved ? 
            `(Approved as of ${approvedDateMMDDYYYY})` :
            '(Advisor has not yet approved)')
        )
      )
    );
  }
}

function pageScript(opts, initialState) { 
  const { signerName, dateName, advisorName } = initialState;
  const el = x('script')({type: 'text/javascript'});

  el.innerHTML =
  `
    onLoad = () => {
      const label = document.getElementById('${signerName}Label');
      const checkbox = document.getElementById('${signerName}Checkbox');
      const approvalData = document.getElementById('${signerName}');
      const dateData = document.getElementById('${dateName}');
      const changeHandler = () => {
        if (checkbox.checked) {
          const now = new Date();
          label.innerText = "Advisor ${advisorName} approved as of " + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + ":";
          approvalData.setAttribute("value", true);
          dateData.setAttribute("value", now.toString());
        } else {
          label.innerText = "Advisor ${advisorName} approves:";
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

module.exports = approvalCheckbox;
