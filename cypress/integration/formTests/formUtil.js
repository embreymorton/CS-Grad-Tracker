let util = {};
util.visitFormAsAdmin = ()=> {
    cy.visit('/student');
    cy.get('.search-pid').type(777777777);
    cy.get('.search-student-submit').click();
    cy.get('.edit-student-button').click();
    cy.get('.student-navigation-forms-button').click();
}

util.visitFormAsStudent = ()=> {

}

module.exports = util;