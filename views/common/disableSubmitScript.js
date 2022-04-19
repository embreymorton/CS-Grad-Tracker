const x = require('hyperaxe')

/**
 * Also adds formNoValidate to save button
 * @param {*} opts for cspNonce 
 * @returns 
 */
function disableSubmitScript(opts){
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML =
    `
      onLoad = () => {
        const save_button = document.getElementById('save-btn')
        save_button ? save_button.formNoValidate = true : null
        function disableHandler(){
          document.getElementById('submit-btn').disabled = true
          return true
        }
    
        document.getElementById('cs-form').addEventListener('submit', disableHandler);
    }
  
      document.addEventListener('DOMContentLoaded', onLoad);
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = disableSubmitScript