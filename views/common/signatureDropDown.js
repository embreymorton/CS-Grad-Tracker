const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')

const signatureDropDown = (editAccess, key, values, opts) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name) => (pseudoInput(values[name]))
  const rwValue = (name) => (input('select', name, values[name], true))
  const value = editAccess ? rwValue : roValue
  let options = []
  for (var i = 0; i < values.length; i++) {
    options.push(x('option')({value: `${values[i].firstName} ${values[i].lastName}`}, `${values[i].firstName} ${values[i].lastName}`))
  }
  const instructorSelected = opts.form.instructorSignature || "";
  return (
      x('.row')(
      col(5)(
        em('In place of your signature, please select your name:'),
        x('select#' + sigName + 'select')(
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
      const select = document.getElementById('${sigName}select');
      const instructorData = document.getElementById('${sigName}');
      const dateData = document.getElementById('${dateName}');
      const changeHandler = () => {
        console.log("activated")
        const now = new Date();
        instructorData.setAttribute("value", select.value);
        // dateData.setAttribute("value", now.toString());
      }
  
      const onLoad = () => {
        select.addEventListener('change', changeHandler);
      }
  
      document.addEventListener('DOMContentLoaded', onLoad);
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = signatureDropDown