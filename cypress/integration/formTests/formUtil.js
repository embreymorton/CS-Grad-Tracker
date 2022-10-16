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
  makeFormDataHandler((sel, d) => sel.clear().type(d))
util.checkFormAsAdmin =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))
util.fillFormAsStudent =
  makeFormDataHandler((sel, d) => sel.should('have.value', d).clear().type(d))
util.checkFormAsStudent =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))
util.selectDropdowns =
  makeFormDataHandler((sel, d) => sel.select(d).should('have.value', d))
util.checkDropdowns =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))

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
 */
util.fillFormByDataCy = (formData) => {
  Object.entries(formData.text || {}).forEach(([name, value]) => {
    cy.get(`[data-cy="${name}"]`).clear().type(value)
  })

  Object.entries(formData.check || {}).forEach(([name, value]) => {
    const datacy = `[data-cy="${name}"]`
    if (value === false) {
      cy.get(datacy).uncheck()
    } else if (value === true) { // is a checkbox
      cy.get(datacy).check()
    } else {
      cy.get(datacy).check(value)
    }
  })

  Object.entries(formData.select || {}).forEach(([name, value]) => {
    cy.get(`[data-cy="${name}"]`).select(value)
  })
}

/**
 * See `fillFormByDataCy` for more info. However instead of filling out the form, it just
 * verifies that each element selected by the `data-cy` attribute has this value.
 * @param {Object} formData 
 */
util.verifyFormByDataCy = (formData) => {
  Object.entries(formData.text || {}).forEach(([name, value]) => {
    cy.get(`[data-cy="${name}"]`).should('have.value', value)
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
    cy.get(`[data-cy="${name}"] option:selected`).should('have.text', value)
  })
}

module.exports = util;
