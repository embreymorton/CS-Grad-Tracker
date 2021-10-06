import data from '../../../data/testRoles'
import util from './formUtil';
var nodemailer = require('nodemailer');



const CS02 = {
    dateSubmitted: 'Feb.2, 2020',
    courseNumber: 'COMP 560',
    basisWaiver: 'Taken',
    instructorSignature: 'jeffe',
    instructorDateSigned: 'time'
  }


  describe('Test Checkbox on forms pages', ()=>{
    before(() => {
      cy.request('/util/resetDatabaseToSnapshot')
    })
    
    it('Test Checkbox Submission and Date Field', () => {
        cy.visit('/changeUser/student')
        cy.visit('/studentView/forms/CS02/false')
        util.visitFormAsStudent()
        cy.get('.CS02').click()
        util.fillFormAsStudent(CS02)
        cy.get('.CS02-submit').click()
       cy.visit('/')
    })
  })


