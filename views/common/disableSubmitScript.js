const x = require('hyperaxe')
const {alertBox} = require('./alertBox')

/**
 * @param {*} opts for cspNonce 
 * @returns 
 */
function disableSubmitScript(opts){
    const el = x('script')({type: 'text/javascript'});

    el.innerHTML =
    `
      let submitAttempted = false

      document.addEventListener('DOMContentLoaded', () => {
        function disableHandler(){
          if (!submitAttempted) {
            submitAttempted = true
            document.getElementById('submit-btn').disabled = true
            setTimeout(() => {
              document.getElementById('submit-btn').disabled = false
              submitAttempted = false
            }, 2000) // added delay as going back after an error page will somehow preserve submitted state
          }
          return true
        }
    
        document.getElementById('cs-form').addEventListener('submit', disableHandler);
      });
    `;
    el.setAttribute('nonce', opts.cspNonce);
    return el
}

module.exports = disableSubmitScript