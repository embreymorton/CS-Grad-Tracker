const x = require('hyperaxe')
const {facultyDropdown, DEFAULT_OTHER_KEY} = require('./facultyDropdown')
const { input, checkbox, script } = require('./baseComponents')
const { b, em, div } = x
const row = x('div.row')
const col = (n) => (x(`div.col-md-${n}`))
const vert = x('div.verticalSpace')()

/**
 * A component that lets you choose from a list of names for an approval signature. Automatically changes label
 * based on the date when the dropdown is changed. (TODO: rename as signatureDropdownRow)
 * @param {String} nameField name attribute / schema field of where faculty name should be stored
 * @param {*} nameValue initial value of faculty name
 * @param {String} dateField name attribute / schema field of where date signed should be stored 
 * @param {*} dateValue inital value of date
 * @param {Array} faculty list of faculty 
 * @param {*} nonce 
 * @param {Boolean} isRequired whether an instructor must be selected in order to progress
 * @param {Boolean} selectAccess can access the dropdown to choose faculty
 * @param {Boolean} checkboxAccess can access the checkbox to sign
 * @param {Boolean} allowOther whether to allow other option
 * @param {facultySchema | studentSchema} viewer object of {firstName, lastName}, must be defined if allowOther
 * @returns 
 */
const signatureDropdown = (nameField, nameValue, dateField, dateValue, faculty, nonce, {isRequired = true, checkboxAccess = false, selectAccess = true, blankOption = 'Select instructor to approve.', blankValue = '', allowOther = false, viewer = null, attrs = {}} = {}) => {
  if (allowOther && !viewer) {
    throw new Error(`Viewer must be defined if allowOther so we know who is signing on behalf of other option.`)
  }

  return [
    row(
      col(6)(
        em('Please select the name of the approver:'),
        facultyDropdown(
          nameField, 
          nameValue, 
          faculty, 
          {
            isDisabled: !selectAccess, 
            isRequired, 
            blankOption, 
            blankValue, 
            allowOther, 
            otherPlaceholder: 'Other, please specify',
            subcomp: true, 
            attrs: {'data-cy': nameField}}
        )
      ),
      col(6)(
        em({id: `label-${nameField}`, hidden: true},'Please type in their name:'),
        input(nameField, nameValue, {isDisabled: !selectAccess, isRequired: false, subcomp: true, isHidden: true, attrs: {name: nameField}})
      )
    ),
    vert,
    row(
      col(5)(
        checkbox(dateField, Boolean(dateValue), nonce, {isDisabled: !checkboxAccess, isRequired: false, subcomp: true, attrs: {'data-cy': dateField}}),
        input(dateField, dateValue, {isDisabled: !checkboxAccess, isRequired: false, isHidden: true, subcomp: true, attrs: {name: dateField}})
      )
    ),
    row(
      col(12)(
        em({id: `label-${dateField}`}, 'You must enable javascript for this form to work!')
      )
    ),
    script(nonce,
      `
      document.addEventListener('DOMContentLoaded', () => {
        const OTHER_VAL = '${DEFAULT_OTHER_KEY}'

        const dropdown = document.getElementById('select-${nameField}')
        const actualName = document.querySelector('[name="${nameField}"]')
        const nameLabel = document.getElementById('label-${nameField}')

        const checkbox = document.getElementById('checkbox-${dateField}')
        const actualDate = document.querySelector('[name="${dateField}"]')
        const checkboxLabel = document.getElementById('label-${dateField}')

        // dropdown handler - updates the value in the value box and resets the checkbox
        dropdown.addEventListener('change', (e) => {
          // change name in actual input if not Other
          if (dropdown.value === OTHER_VAL) { // other selected
            nameLabel.removeAttribute('hidden')
            actualName.value = ''
            actualName.type = 'text'
          } else {
            nameLabel.setAttribute('hidden', true)
            actualName.value = dropdown.value
            actualName.type = 'hidden'
          }  

          actualName.dispatchEvent(new Event('change'))
        })

        // checkbox handler
        checkbox?.addEventListener('change', (e) => {
          actualName.dispatchEvent(new Event('change'))
        })

        // actual name box handler
        actualName.addEventListener('change', (e) => {
          actualName.value = actualName.value.trim()
          const name = actualName.value || '(blank)'
          if (checkbox && checkbox.checked) {
            const now = new Date()
            if (dropdown.value === OTHER_VAL) {
              checkboxLabel.innerText = \`(${viewer?.fullName} approved on \${now.getMonth()+1}/\${now.getDate()}/\${now.getFullYear()} on behalf of \${name}.)\`
            } else {
              checkboxLabel.innerText = \`(\${name} approved on \${now.getMonth()+1}/\${now.getDate()}/\${now.getFullYear()}.)\`
            }
            if (actualDate) {
              actualDate.value = now
            }
          } else {
            // student mode will always go through this
            checkboxLabel.innerText = '(' + name + ' has not yet approved.)'
            actualDate?.removeAttribute('value')
          }
        })

        if (dropdown.value == '${DEFAULT_OTHER_KEY}') {
          nameLabel.removeAttribute('hidden')
          actualName.type = 'text'
        }
        actualName.dispatchEvent(new Event('change'))
      })
      `,
      {defer: true})
  ]
}

module.exports = {signatureDropdown}