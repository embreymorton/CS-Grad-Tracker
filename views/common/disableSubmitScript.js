const x = require('hyperaxe')

/**
 * @param {*} opts for cspNonce 
 * @returns 
 */
function disableSubmitScript(opts){
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML =
    `
      document.addEventListener('DOMContentLoaded', () => {
        function disableHandler(){
          document.getElementById('submit-btn').disabled = true
          return true
        }
    
        document.getElementById('cs-form').addEventListener('submit', disableHandler);
      });
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = disableSubmitScript