const x = require('hyperaxe');
const input = require('./input')
const pseudoInput = require('./pseudoInput')
const schema = require("../../models/schema.js");
const { initialize } = require('passport');


const approvalCheckbox = (editAccess, key, opts) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(opts.form[name])) // ro for "read-only", rw for "read-write"
  const rwValue = (name) => (input('checkbox', name, opts.form[name], true))
  const value = editAccess ? rwValue : roValue
  const studentData = opts.student

  const advisor = studentData.advisor
  const otherAdvisor = studentData.otherAdvisor;

  const isApproved = opts.form.advisorSignature; 
  const approvedDate =  isApproved ? new Date(opts.form['advisorDateSigned']) : new Date();
  const notApprovedYetLabel = `Advisor ${advisor?.lastName ? `${advisor?.firstName} ${advisor?.lastName}` : otherAdvisor || '(unspecified)'} approves:`;
  const approvedLabel = `Advisor ${advisor?.lastName ? `${advisor?.firstName} ${advisor?.lastName}` : otherAdvisor || '(unspecified)'} approved as of ${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}.`
  
  return (
    x('.row')(
      col(5)(
        em({id: `${sigName}Label`}, isApproved ? approvedLabel : notApprovedYetLabel),           // advisorSignature Label
        x(`input#${sigName}Checkbox.form-control`)({type: "checkbox"}),                          // physical checkbox
        x(`input#${sigName}`)({type: "hidden", name: sigName}),                                  // hidden input for checkbox
        x(`input#${dateName}`)({type: "hidden", name: dateName, value: approvedDate.toString()}) // hidden input for the date
      ),
      pageScript(opts, key)
    )
  );
}

function pageScript(opts, key) {
  const el = x('script')({type: 'text/javascript'});

  const initialAdvisorApproval = opts.form.advisorSignature
  const initialAdvisorApprovalDate = new Date(opts.form.advisorDateSigned)
  const advisorName = opts.student.advisor?.lastName ? `${opts.student.advisor?.firstName} ${opts.student.advisor?.lastName}` : opts.student.otherAdvisor || '(unspecified)';

  const initialLabel = initialAdvisorApproval 
  ? `Advisor ${advisorName} approved as of ${initialAdvisorApprovalDate.getMonth()+1}/${initialAdvisorApprovalDate.getDate()}/${initialAdvisorApprovalDate.getFullYear()}:`
  : `Advisor ${advisorName} approves:`;

  el.innerHTML = 
  `
    const label = document.getElementById('${key}SignatureLabel');
    const checkbox = document.getElementById('${key}SignatureCheckbox');
    const approvalData = document.getElementById('${key}Signature');
    const dateData = document.getElementById('${key}DateSigned');
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

    const onLoad = () => {
      checkbox.addEventListener('change', changeHandler);
  
      label.innerText = "${initialLabel}";
  
      if (${initialAdvisorApproval}) {
        checkbox.checked = true;
        approvalData.setAttribute("value", true);
        dateData.setAttribute("value", "${initialAdvisorApprovalDate}");
      } else {
        checkbox.checked = false;
        approvalData.setAttribute("value", false);
        dateData.setAttribute("value", "");
      }
    }

    document.addEventListener('DOMContentLoaded', onLoad);
  `;
  el.setAttribute('nonce', opts.cspNonce);
  return el
}

module.exports = approvalCheckbox;