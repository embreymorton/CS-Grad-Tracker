import data from '../../../data/testRoles'
import util from './formUtil';

const CS02 = {
  dateSubmitted: 'Feb.2, 2020',
  courseNumber: 'COMP 560',
  basisWaiver: 'Taken',
}

describe('Test Checkbox on forms pages', ()=>{
    before(() => {
      cy.request('/util/resetDatabaseToSnapshot')
    })
    
    it('Test Checkbox Submission and Date Field', () => {
        cy.visit('/changeUser/admin')
        util.visitFormAsAdmin()
        cy.get('.CS02').click()
        util.fillCleanFormAsAdmin(CS02)
        cy.get('[type="checkbox"]').check()
        cy.get('.CS02-submit').click()
        cy.get('[type="checkbox"]').uncheck()
        cy.get('.CS02-submit').click()
        cy.get('[type="checkbox"]').check()
        cy.get("#advisorSignatureLabel").contains("as of")
    })
  })
  