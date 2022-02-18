import data from '../../../data/testRoles'
import util from './formUtil';
const nodemailer = require("nodemailer")

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`
const studentTextFields = data.studentTextFields;
      const job = data.job;
      const studentDropdownFields = data.studentDropdownFields;
      const course = data.course;
      const note = data.note;



// data.searchStudentHelper = ()=>{
//         cy.get('.search-last-name')
//           .type(data.studentTextFields.lastName)
//           .should('have.value', data.studentTextFields.lastName)
      
//         cy.get('.search-pid')
//           .type(data.studentTextFields.pid)
//           .should('have.value', data.studentTextFields.pid)
      
//         cy.get('.search-student-submit').click();
//       }
const CS02 = {
  dateSubmitted: 'Feb.2, 2020',
    courseNumber: 'COMP 560',
    basisWaiver: 'Taken',
  }
  describe('Test Checkbox on forms pages', ()=>{
    before(() => {
      cy.request('/util/resetDatabaseToSnapshot')
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid')
    })

    it('Give student student an advisor', () => {
      cy.visit('/changeUser/admin');
      cy.visit('/student');
  
      cy.get('.edit-student-button').click();
  
      cy.get('.student-navigation-edit-button').click()
      cy.url().should('contain', '/student/edit');
      cy.get('select[name="advisor"]').select('admin, admin')
      cy.get('.btn-success').click()
    })
  
    it('Submit CS02 form from administrator side', () => {
      cy.visit('/changeUser/admin')
      util.visitFormAsAdmin()
      cy.get('.CS02').click()
      cy.contains(name)
      cy.contains(pid.toString())
      util.fillCleanFormAsAdmin(CS02)
      cy.get('#instructorSignatureSelect').select('admin admin')
      cy.get('.CS02-submit').click()
      util.fillFormAsStudent(CS02)
    })
    
    it('Test Checkbox Submission and Date Field', () => {
      cy.visit('/changeUser/student')
      cy.visit('/studentView/forms/CS02/false')
      cy.contains(name)
      cy.contains(pid.toString())
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
      cy.get('a[href^="/messages/"]').first().click()
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


