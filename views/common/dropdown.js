const x = require('hyperaxe')
const pseudoInput = require('./pseudoInput')

/**
 * A dropdown component that lets you choose from a list of faculty members.
 * @param {Boolean} editAccess whether user is an admin/faculty -> true, or a student -> false
 * @param {String} name represents the type of value being selected, also functions as an HTML element's `id` so it should be distinct
 * @param {Array<Object>} values a list of names to choose from, each object should be in form `{firstName: ..., lastName: ...}`
 * @param {Object} opts looks for {cspNone, form} where form is the query from the database
 * @param {Boolean} required whether the dropdown should be require or not to submit the form; true by default
 * @returns 
 */
const dropdown = (editAccess, name, values, opts, label = null, required = true) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const facultySelected = opts.form[name] || ""
  
  // list of dropdown options
  let options = []
  options.push(x('option')({value: "", selected: "", disabled: "", hidden: ""}, "Select faculty member."))
  values = [...values].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)) // sort names by last, first name
  for (var i = 0; i < values.length; i++) {
    if (`${values[i].firstName} ${values[i].lastName}` === facultySelected) {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`, selected: ""}, `${values[i].lastName}, ${values[i].firstName}`))
    } else {
      options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`}, `${values[i].lastName}, ${values[i].firstName}`))
    }
  }

  return (
    col(6)(
      label,
      !editAccess && isApproved ? pseudoInput(facultySelected) : x(`select#${name}Select.form-control`)({value: facultySelected, required: required ? true : null},
          options
      ),
      x(`input#${name}`)({type: "hidden", name, value: facultySelected}),
      pageScript(opts, {facultySelected, name})
    )
  )
}

function pageScript(opts, initialState) { 
  const { name, facultySelected } = initialState;
  const el = x('script')({type: 'text/javascript'});

  el.innerHTML =
  `
  onLoad = () => {
    let select = document.getElementById('${name}Select');
    let instructorData = document.getElementById('${name}');

    let selectHandler = () => {
      instructorData.setAttribute("value", select.value);
    }

    select ? select.onchange = selectHandler : null;
  }
  document.addEventListener('DOMContentLoaded', onLoad);
  `;
  el.setAttribute('nonce', opts.cspNonce);
  return el
}

module.exports = dropdown