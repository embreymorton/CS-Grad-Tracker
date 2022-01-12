const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')
const pseudoCheckbox = require('./pseudoCheckbox')

/**
 * A component that lets you choose from a list of names for an approval signature. Automatically changes label
 * based on the date when the dropdown is changed.
 * @param {Number} editAccess NOT DECIDED YET
 * @param {String} key represents the type of value being selected, also functions as an HTML element's `id` so it should be distinct
 * @param {Array<Object>} values a list of names to choose from, each object should be in form `{firstName: ..., lastName: ...}`
 * @param {Object} opts looks for {cspNone, form} where form is the query from the database
 * @returns 
 */
const signatureDropDown = (editAccess, key, values, opts) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  console.log(sigName);
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(values[name]))
  const rwValue = (name) => (input('select', name, values[name], true))
  const value = editAccess ? rwValue : roValue
  const instructorSelected = opts.form.instructorSignature || "";
  
  // list of dropdown options
  let options = []
  options.push(x('option')({value: "", selected: "", disabled: "", hidden: ""}, "Select instructor to approve."))
  for (var i = 0; i < values.length; i++) {
    if (`${values[i].firstName} ${values[i].lastName}` === instructorSelected) {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`, selected: ""}, `${values[i].firstName} ${values[i].lastName}`))
    } else {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`}, `${values[i].firstName} ${values[i].lastName}`))
    }
  }

  // check if signer has approved yet; approval depends solely on whether the date field is filled
  const isApproved = opts.form[dateName] != ""
  const approvalDate = isApproved ? new Date(opts.form[dateName]) : new Date()
  const approvedDateMMDDYYYY = `${approvalDate.getMonth()+1}/${approvalDate.getDate()}/${approvalDate.getFullYear()}`;
  const approvalLabel = isApproved ? 
    `${instructorSelected} approved as of ${approvedDateMMDDYYYY}.` :
    `Not yet approved.`
  let dateInput
  if (editAccess) {
    dateInput = col(4)(
      x(`em#${dateName}Label`)(approvalLabel),
      x(`input#${dateName}Checkbox.form-control`)({type: "checkbox", checked: isApproved ? "checked" : undefined}),
      x(`input#${dateName}`)({type: "hidden", name: dateName, value: isApproved ? approvalDate.toString() : undefined})
    )
  } else {
    dateInput = col(4)(
      pseudoCheckbox(isApproved),
      x('em')(approvalLabel)
    )
  }

  return (
      x('.row')(
      col(5)(
        em('In place of your signature, please select your name:'),
        x(`select#${sigName}Select`)({value: instructorSelected, required: true},
            options
        ),
        x(`input#${sigName}`)({type: "hidden", name: sigName, value: instructorSelected}),
      ),
      dateInput,
      pageScript(opts, {instructorSelected, sigName, dateName})
    )
  )
}

// TODO: if anyone touches the dropdown, unapprove the checkbox, unless someone reselects the original person
function pageScript(opts, initialState) { 
    const { sigName, dateName, instructorSelected } = initialState;
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML =
    `
    onLoad = () => {
      let select = document.getElementById('${sigName}Select');
      let checkbox = document.getElementById('${dateName}Checkbox');
      let checkboxLabel = document.getElementById('${dateName}Label')
      let instructorData = document.getElementById('${sigName}');
      let dateData = document.getElementById('${dateName}');
      let refreshCheckbox = () => {
        if (checkbox.checked) {
          const now = new Date();
          checkboxLabel.innerText = instructorData.value + ' approved as of ' + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + '.';
          dateData.setAttribute("value", now.toString());
        } else {
          checkboxLabel.innerText = 'Not yet approved.';
          dateData.removeAttribute("value");
        }  
      }
      let checkboxHandler = () => {
        refreshCheckbox();
      }
      let selectHandler = () => {
        instructorData.setAttribute("value", select.value);
        if (instructorData.value != '${instructorSelected}') {
          checkbox.checked = false;
          refreshCheckbox();
        }
      }

      select.onchange = selectHandler;
      select.addEventListener('onchange', selectHandler);
      checkbox.addEventListener('change', checkboxHandler);
    }
    document.addEventListener('DOMContentLoaded', onLoad);
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = signatureDropDown