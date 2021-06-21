import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS02 = {
  dateSubmitted: 'Feb.2, 2020',
  courseNumber: 'COMP 560',
  basisWaiver: 'Taken',
  advisorSignature: data.admin.lastName,
  advisorDateSigned: 'YO yoyo',
  instructorSignature: 'jeffe',
  instructorDateSigned: 'time'
}

describe('Test CS02 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS02 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS02').click();
    cy.get('.student-name').should('have.value', student.lastName + ', ' + student.firstName)
    cy.get('.student-pid').should('have.value', student.pid.toString())
    util.fillCleanFormAsAdmin(CS02);
    cy.get('.CS02-submit').click();
    util.fillFormAsStudent(CS02);
  })

  it('Submit CS02 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS02/false')

    cy.get('.student-name').should('have.value', student.lastName + ', ' + student.firstName)
    cy.get('.student-pid').should('have.value', student.pid.toString())

    cy.contains(CS02.advisorSignature);
    cy.contains(CS02.advisorDateSigned);
    cy.contains(CS02.instructorSignature);
    cy.contains(CS02.instructorDateSigned);

    delete CS02.advisorSignature;
    delete CS02.advisorDateSigned;
    delete CS02.instructorSignature;
    delete CS02.instructorDateSigned;

    util.fillFormAsStudent(CS02);
    cy.get('.CS02-submit').click();
    util.checkFormAsStudent(CS02);
  });
})
