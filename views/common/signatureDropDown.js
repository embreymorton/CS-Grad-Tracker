const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')

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
  let options = []
  options.push(x('option')({value: "", selected: "", disabled: "", hidden: ""}, "Select instructor to approve."))
  for (var i = 0; i < values.length; i++) {
    options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`}, `${values[i].firstName} ${values[i].lastName}`))
  }
  const instructorSelected = opts.form.instructorSignature || "";
  return (
      x('.row')(
      col(5)(
        em('In place of your signature, please select your name:'),
        x(`select#${sigName}Select`)({value: instructorSelected, required: true},
            options
        ),
        x(`input#${sigName}`)({type: "hidden", name: sigName, value: instructorSelected}), // force true/false as cannot be undefined.
        // x(`input#${dateName}`)({type: "hidden", name: dateName, value: instructorSelected ? approvedDate.toString() : undefined})
        
      ),
      pageScript(opts, {sigName, dateName}),
      col(3)(
        div('Date signed'),
        value(dateName),
      ),
    )
  )
}

function pageScript(opts, initialState) { 
    const { sigName, dateName } = initialState;
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML =
    `
    onLoad = () => {
      console.log("loaded")

      let select = document.getElementById('${sigName}Select');
      let instructorData = document.getElementById('${sigName}');
      let dateData = document.getElementById('${dateName}');
      let changeHandler = () => {
        console.log("activated")
        const now = new Date();
        instructorData.setAttribute("value", select.value);
        // dateData.setAttribute("value", now.toString());
      }

      select.onchange = changeHandler;
      select.addEventListener('onchange', changeHandler);
    }
      
    console.log('does this script run?');
    document.addEventListener('DOMContentLoaded', onLoad);
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = signatureDropDown