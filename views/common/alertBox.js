// const {} = require('./baseComponents')
const x = require('hyperaxe')
const {div, h5, button} = x

/**
 * @param {String} id attribute of the element
 * @param {*} title for the alert
 * @param {*} description for the alert
 * @param {*} buttons list of additional buttons to include
 * @returns 
 */
function alertBox(id, title, description, buttons) { // https://getbootstrap.com/docs/4.0/components/modal/
  return div({id, class:'modal fade', tabindex: -1, role:'dialog'},
    div({class: 'center-modal-parent'}, // needs this extra div because for some reason, bootstrap doesn't like how our forms are setup
      div({class: 'modal-dialog center-modal-child', role:'document'},
        div({class: 'modal-content'},
          div({class: 'modal-header'},
            h5({class: 'modal-title'}, title),
            button({type: 'button', class: 'close', 'data-dismiss': 'modal', 'aria-label':'Close', 'aria-hidden':true},
            '✖️'),
          ),
          div({class: 'modal-body'},
            description
          ),
          div({class: 'modal-footer'},
            buttons,
            button({type:'button', class: 'btn btn-secondary', 'data-dismiss': 'modal'},
              'Close'
            )
          )
        )
      )
    )
  )
}

/**
 * 
 * @param {Object} attrs - html attributes for the button 
 * @param {*} subelements - text that the button should have OR child elements
 * @param {String} modal_id - id of the modal element the button should trigger
 * @returns 
 */
function triggerModalButton(attrs, subelements, modal_id) {
  return button({'data-toggle': 'modal', 'data-target': '#' + modal_id, ...attrs},
    subelements
  )
}

module.exports = {alertBox, triggerModalButton}