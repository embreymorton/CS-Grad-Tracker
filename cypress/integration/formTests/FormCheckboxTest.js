import data from '../../../data/testRoles'
import util from './formUtil';

const CS04 = {
  projectDescription: 'blah blah',
}

describe('Test Checkbox on forms pages', ()=>{
    before(() => {
      cy.request('/util/resetDatabaseToSnapshot')
    })
    
    it('Test Checkbox Submission and Date Field', () => {
        cy.visit('/changeUser/admin')
        util.visitFormAsAdmin()
        cy.get('.CS04').click()
        util.fillCleanFormAsAdmin(CS04)
        cy.get('[type="checkbox"]').check()
        cy.get('.CS04-submit').click()
        cy.get('[type="checkbox"]').uncheck()
        cy.get('.CS04-submit').click()
        cy.get('[type="checkbox"]').check()
        cy.get("#advisorSignatureLabel").contains("as of")
    })
  })
  