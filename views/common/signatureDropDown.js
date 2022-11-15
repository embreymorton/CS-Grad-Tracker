const x = require('hyperaxe')
// const input = require('./input')
const pseudoInput = require('./pseudoInput')
const pseudoCheckbox = require('./pseudoCheckbox')
// const { dropdown, makeOption, input, checkbox } = require('./baseComponents')
const { b } = x

const otherkey = '_'

/**
 * A component that lets you choose from a list of names for an approval signature. Automatically changes label
 * based on the date when the dropdown is changed.
 * @param {Boolean} editAccess whether user is an admin/faculty -> true, or a student -> false
 * @param {String} key represents the type of value being selected, also functions as an HTML element's `id` so it should be distinct
 * @param {[Object]} values a list of names to choose from, each object should be in form `{firstName: ..., lastName: ...}`
 * @param {Object} opts looks for {cspNone, form} where form is the query from the database
 * @param {Boolean} required whether the dropdown should be require or not to submit the form; true by default
 * @returns 
 */
const signatureDropDown = (editAccess, key, values, opts, required = true) => {
  const row = x('row')
  const col = (n) => (x(`div.col-md-${n}`))
  const vert = x('div.verticalSpace')()
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(values[name]))
  const rwValue = (name) => (input('select', name, values[name], true))
  const value = editAccess ? rwValue : roValue
  const instructorSelected = opts.form[sigName]|| "";
  
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
    `(${instructorSelected} approved on ${approvedDateMMDDYYYY}.)` :
    instructorSelected ? `(${instructorSelected || '(blank)'} has not yet approved.)` : '(None selected)'
  let dateInput
  if (editAccess) {
    dateInput = col(5)(
      x(`input#${dateName}Checkbox.form-control`)({type: "checkbox", checked: isApproved ? "checked" : undefined}),
      x(`input#${dateName}`)({type: "hidden", name: dateName, value: isApproved ? approvalDate.toString() : undefined}),
      x(`em#${dateName}Label`)(approvalLabel),
    )
  } else {
    dateInput = col(5)(
      pseudoCheckbox(isApproved),
      x('em')(approvalLabel)
    )
  }

  return [
    x('.row')(
      col(6)(
        em('Please select the name of the approver:'),
        !editAccess && isApproved ? pseudoInput(instructorSelected) : x(`select#${sigName}Select.form-control`)({value: instructorSelected, required: required ? true : null},
            options
        ),
      ),
      col(6)(
        em({ id: `${sigName}OtherLabel`, hidden: isNonDeptMember ? null : true }, 'Please type in their name:'),
        x(`input#${sigName}.form-control`)({type: isNonDeptMember ? "text" : "hidden", name: sigName, value: instructorSelected, required: ''}),
      )
    ),
    vert,
    x('.row')(
      dateInput,
      pageScript(opts, {editAccess, sigName, dateName})
    )
  ]
}

function pageScript(opts, initialState) { 
    const { sigName, dateName, editAccess } = initialState;
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML = //TODO: just remake this using new base components
    `
    if (${editAccess}) {
      // dropdown handler - updates the value in the value box and resets checkbox
      document.getElementById('${sigName}Select')?.addEventListener('change', (e) => {
        const instructorData = document.getElementById('${sigName}')
        const otherLabel = document.getElementById('${sigName}OtherLabel')
        const checkbox = document.getElementById('${dateName}Checkbox')
        const dropdown = e.target
  
        if (checkbox) {
          checkbox.checked = false
        }
  
        if (dropdown.value === '${otherkey}') {
          instructorData.type = 'text'
          otherLabel.removeAttribute('hidden')
        } else {
          instructorData.type = 'hidden'
          otherLabel.setAttribute('hidden', true)
        }
        
        instructorData.value = dropdown.value === '${otherkey}' ? '' : dropdown.value
        instructorData.dispatchEvent(new Event('change'))
      })
  
      // checkbox handler
      document.getElementById('${dateName}Checkbox')?.addEventListener('change', (e) => {
        const instructorData = document.getElementById('${sigName}')
        instructorData.dispatchEvent(new Event('change'))
      })
  
      // value box handler
      document.getElementById('${sigName}')?.addEventListener('change', (e) => {
        const instructorData = e.target
        const approvalLabel = document.getElementById('${dateName}Label')
        const checkbox = document.getElementById('${dateName}Checkbox')
        const checkboxLabel = document.getElementById('${dateName}Label')
        const dateData = document.getElementById('${dateName}')
  
        instructorData.value = instructorData.value.trim()
        const name = instructorData.value || '(blank)'
        if (checkbox.checked) {
          const now = new Date()
          checkboxLabel.innerText = '(' + name + ' approved on ' + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + '.)';
          dateData.setAttribute("value", now.toString());
        } else {
          checkboxLabel.innerText = '(' + name + ' has not yet approved.)';
          dateData.removeAttribute("value");
        }
      })
    }
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = signatureDropDown