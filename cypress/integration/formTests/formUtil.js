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
  makeFormDataHandler((sel, d) => sel.should('have.value', d).clear().type(d + '1'))
util.checkFormAsStudent =
  makeFormDataHandler((sel, d) => sel.should('have.value', d + '1'))
util.selectDropdowns =
  makeFormDataHandler((sel, d) => sel.select(d).should('have.value', d))
util.checkDropdowns =
  makeFormDataHandler((sel, d) => sel.should('have.value', d))

module.exports = util;
