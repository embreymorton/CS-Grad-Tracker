const x = require('hyperaxe');
const input = require('./input')
const pseudoInput = require('./pseudoInput')
const schema = require("../../models/schema.js");
const { initialize } = require('passport');


const approvalCheckbox = (editAccess, key, form, studentData) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(form[name])) // ro for "read-only", rw for "read-write"
  const rwValue = (name) => (input('checkbox', name, form[name], true))
  const value = editAccess ? rwValue : roValue

  const advisor = studentData.advisor
  const otherAdvisor = studentData.otherAdvisor;

  const isApproved = form.advisorSignature; 
  const approvedDate =  isApproved ? new Date(form['advisorDateSigned']) : new Date();
  const notApprovedYetLabel = `Advisor ${advisor?.lastName ? `${advisor?.firstName} ${advisor?.lastName}` : otherAdvisor || '(unspecified)'} approves:`;
  const approvedLabel = `Advisor ${advisor?.lastName ? `${advisor?.firstName} ${advisor?.lastName}` : otherAdvisor || '(unspecified)'} approved as of ${approvedDate.getMonth()+1}/${approvedDate.getDate}/${approvedDate.getFullYear()}.`
  
  return (
    x('.row')(
      col(5)(
        em({id: `${sigName}Label`}, isApproved ? approvedLabel : notApprovedYetLabel),
        x(`input#${sigName}Checkbox.form-control`)({type: "checkbox", name: sigName, required: true, checked: isApproved})
      )
    )
  );
}

module.exports = approvalCheckbox;