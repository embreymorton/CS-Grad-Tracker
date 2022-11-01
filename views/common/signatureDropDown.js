const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')
const pseudoCheckbox = require('./pseudoCheckbox')
const { b } = x

const otherkey = '_'

/**
 * A component that lets you choose from a list of names for an approval signature. Automatically changes label
 * based on the date when the dropdown is changed.
 * @param {Boolean} editAccess whether user is an admin/faculty -> true, or a student -> false
 * @param {String} key represents the type of value being selected, also functions as an HTML element's `id` so it should be distinct
 * @param {Array<Object>} values a list of names to choose from, each object should be in form `{firstName: ..., lastName: ...}`
 * @param {Object} opts looks for {cspNone, form} where form is the query from the database
 * @param {Boolean} required whether the dropdown should be require or not to submit the form; true by default
 * @returns 
 */
const signatureDropDown = (editAccess, key, values, opts, required = true) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(values[name]))
  const rwValue = (name) => (input('select', name, values[name], true))
  const value = editAccess ? rwValue : roValue
  const instructorSelected = opts.form[sigName] || "";
  
  // list of dropdown options
  let options = []
  options.push(x('option')({value: "", selected: "", disabled: "", hidden: ""}, "Select instructor to approve."))
  values = [...values].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)) // sort names by last, first name
  let matchesDeptMember = false
  for (var i = 0; i < values.length; i++) {
    if (`${values[i].firstName} ${values[i].lastName}` === instructorSelected) {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`, selected: ""}, `${values[i].lastName}, ${values[i].firstName}`))
      matchesDeptMember = true
    } else {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`}, `${values[i].lastName}, ${values[i].firstName}`))
    }
  }
  const isNonDeptMember = instructorSelected && !matchesDeptMember
  options.push(x('option')({value: otherkey, selected: isNonDeptMember ? true : null }, b('Other, please specify:' )))

  // check if signer has approved yet; approval depends solely on whether the date field is filled
  const isApproved = opts.form[dateName] != undefined && opts.form[dateName] != "" 
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

  return [
    x('.row')(
      col(5)(
        em('In place of your signature, please select your name:'),
        !editAccess && isApproved ? pseudoInput(instructorSelected) : x(`select#${sigName}Select.form-control`)({value: instructorSelected, required: required ? true : null},
            options
        ),
      ),
      col(5)(
        em({ id: `${sigName}OtherLabel`, hidden: isNonDeptMember ? null : true }, 'Please type in their name:'),
        x(`input#${sigName}.form-control`)({type: isNonDeptMember ? "text" : "hidden", name: sigName, value: instructorSelected, required: ''}),
      )
    ),
    x('.row')(
      dateInput,
      pageScript(opts, {instructorSelected, sigName, dateName})
    )
  ]
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
      let otherBoxLabel = document.getElementById('${sigName}OtherLabel');
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
        if (instructorData.value != '${instructorSelected}' && checkbox) {
          checkbox.checked = false;
          refreshCheckbox();
        }
        if (select.value === '${otherkey}') {
          instructorData.setAttribute("type", "text")
          instructorData.setAttribute("value", "")
          otherBoxLabel.removeAttribute("hidden")
        } else {
          instructorData.setAttribute("type", "hidden")
          otherBoxLabel.setAttribute("hidden", true)
        }
      }

      select ? select.onchange = selectHandler : null;
      // select.addEventListener('onchange', selectHandler);
      checkbox ? checkbox.addEventListener('change', checkboxHandler) : null;
    }
    document.addEventListener('DOMContentLoaded', onLoad);
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = signatureDropDown