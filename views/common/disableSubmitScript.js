const x = require('hyperaxe')

function disableSubmitScript(opts){
    const el = x('script')({type: 'text/javascript'});
  
    el.innerHTML =
    `
      onLoad = () => {
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