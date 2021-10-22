import data from '../../../data/testRoles'
import util from './formUtil';
const nodemailer = require("nodemailer")

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`


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

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid')
    })
  
    it('Submit CS02 form from administrator side', () => {
      cy.visit('/changeUser/admin')
      util.visitFormAsAdmin()
      cy.get('.CS02').click()
      cy.contains(name)
      cy.contains(pid.toString())
      util.fillCleanFormAsAdmin(CS02)
      cy.get('.CS02-submit').click()
      util.fillFormAsStudent(CS02)
    })
    
    it('Test Checkbox Submission and Date Field', () => {
      cy.visit('/changeUser/student')
      cy.visit('/studentView/forms/CS02/false')
      cy.contains(name)
      cy.contains(pid.toString())
  
      ;[
        'instructorSignature',
        'instructorDateSigned',
      ].forEach((field) => {
        cy.contains(CS02[field])
        delete CS02[field]
      })
  
      util.fillFormAsStudent(CS02)
      cy.get('.CS02-submit').click()
      util.checkFormAsStudent(CS02)
    })

    it('Logging into Ethereal to check', () => {
      cy.visit('https://ethereal.email/login')
      cy.get('#address').type('retta.doyle50@ethereal.email')
      cy.get('#password').type('J7PWfjJ4FewKyAQhRj')
      cy.get('.btn').first().click()
      cy.visit('https://ethereal.email/messages')
      cy.get('td a').eq(2).click()
      const now = new Date()
      cy.get('.datestring').first().invoke('attr', 'title').then(title => {
        const mailDate = new Date(title);
        if (Math.abs(now.getTime() - mailDate.getTime()) <= 60*2*1000) {
          cy.contains('Today');
        } else {
          cy.contains('This is cy.fail()');
        }
      })
    })

  })


