let util = {};

util.visitFormAsAdmin = () => {
  cy.visit('/student');
  cy.get('.search-pid').type(777777777);
  cy.get('.search-student-submit').click();
  cy.get('.edit-student-button').click();
  cy.get('.student-navigation-forms-button').click();
}

const toArray = (x) => (
  Array.isArray(x) ? x : [x]
)

const makeFormDataHandler = (affectSelection) => (formData) => (
  Object.entries(formData).forEach(([key, value]) => (
    toArray(value).forEach((d, i) => (
      affectSelection(cy.get(`.cs-form [name=${key}]`).eq(i), d)
    ))
  ))
)

util.fillCleanFormAsAdmin =
  makeFormDataHandler((sel, d) => {
    sel.then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        var attr = Cypress.dom.stringify($el);
        if (attr.includes('checkbox')) {
          cy.wrap($el).check()
        } else {
          cy.wrap($el).clear().type(d)
        }
      }
    })
  
  })
util.checkFormAsAdmin =
  makeFormDataHandler((sel, d) => 
    sel.should('have.value', d)
  )
util.fillFormAsStudent =
  makeFormDataHandler((sel, d) => {
    sel.then(($el) => {
      if (Cypress.dom.isVisible($el)) {
        var attr = Cypress.dom.stringify($el);
        if (attr.includes('checkbox')) {
          cy.wrap($el).check()
        } else {
          cy.wrap($el).should('have.value', d).clear().type(d)
        }
      }
    })
  })
util.checkFormAsStudent =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))
util.selectDropdowns =
  makeFormDataHandler((sel, d) => sel.select(d).should('have.value', d))
util.checkDropdowns =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))

  /** calls cy.get(selector) and checks if there are multiple elements selected, if so, it will expect values to be an array of values
   * @param {Function(*) : [*]} makeArgs should be a lambda function that create the arguments for the method being called
   */
const cyGetApply = (selector, values, method, makeArgs) => {
  if (Array.isArray(values)) {
    cy.get(selector).each(($el, i, $list) => i < values.length && cy.wrap($el)[method](...makeArgs(values[i]))) // quick ends loop when i >= value.length (by returning false)
  } else {
    cy.get(selector).filter(':visible')[method](...makeArgs(values))
  }
}

/**
 * fills form elements with a `data-cy` attribute (https://docs.cypress.io/guides/references/best-practices#Selecting-Elements)
 * It's best to make the `data-cy` attribute equivalent to the element's `name` attribute. But we use the `data-cy` attribute as 
 * elements like buttons or especially checkboxes may just activate a script that modifies a hidden textbox.
 * Note: Checkbox should have a value of true/false corresponding to checked/unchecked
 * @param {Object} formData object with this format:
```js
{
  text: {...},
  check: {...},
  select: {...}
}
```
where each of the objects inside are data-cy:value pairs:
```js
text: {
  'name-1': 123,
  'name-2': 'hello'
}
```
If multiple elements have the same corresponding `data-cy` attribute, give an array of values in the order that the elements
appear on the page, e.g.:
```js
text: {
  'names': ['John', 'Jane', 'Judy']
}
```
 */
util.fillFormByDataCy = (formData) => {
  Object.entries(formData.check || {}).forEach(([name, value]) => {
    const datacy = `[data-cy="${name}"]`
    if (value === false) {
      cy.get(datacy).uncheck()
    } else if (value === true) { // is a checkbox
      cy.get(datacy).check()
    } else { // is a radio
      cyGetApply(datacy, value, 'check', (val) => [val])
    }
  })
  
  Object.entries(formData.select || {}).forEach(([name, value]) => {
    cyGetApply(`[data-cy="${name}"]`, value, 'select', (val) => [val])
  })
  
  Object.entries(formData.text || {}).forEach(([name, value]) => {
    cyGetApply(`[data-cy="${name}"]`, value, 'clear', () => [])
    cyGetApply(`[data-cy="${name}"]`, value, 'type', (val) => [val])
  })
}

/**
 * See `fillFormByDataCy` for more info. However instead of filling out the form, it just
 * verifies that each element selected by the `data-cy` attribute has this value.
 * @param {Object} formData 
 */
util.verifyFormByDataCy = (formData) => {
  Object.entries(formData.text || {}).forEach(([name, value]) => {
    cyGetApply(`[data-cy="${name}"]`, value, 'should', (val) => ['have.value', val])
  })

  Object.entries(formData.check || {}).forEach(([name, value]) => {
    const datacy = `[data-cy="${name}"]`
    if (value === false) {
      cy.get(datacy).should('not.be.checked')
    } else if (value === true) { // is a checkbox
      cy.get(datacy).should('be.checked')
    } else { // is a radio
      cy.get(datacy + `[value*="${value}"]`).should('be.checked')
    }
  })

  Object.entries(formData.select || {}).forEach(([name, value]) => {
    cyGetApply(`[data-cy="${name}"] option:selected`, value, 'should', (val) => ['have.text', val])
  })
}

/** will submit the form, even if there is a modal pop-up */
util.submitForm = () => {
  cy.get('#cs-form').then(($form => {
    if ($form.find('#submit-btn-modal').length) { // has modal
      cy.get('#submit-btn-modal').click();
    }
    cy.get('#submit-btn').click()
  }))
}

util.By = {}
util.By.datacy = (s) => `[data-cy="${s}"]`
util.By.name = (s) => `[name="${s}"]`
util.By.id = (s) => `#${s}`

module.exports = util;
