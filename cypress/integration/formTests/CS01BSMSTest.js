import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS01BSMS = {
  comp521Covered: 'A',
  comp521Date: 'A',
  comp520Covered: 'B',
  comp520Date: 'B',
  comp530Covered: 'C',
  comp530Date: 'C',
  comp524Covered: 'D',
  comp524Date: 'D',
  comp541Covered: 'E',
  comp541Date: 'E',
  math661Covered: 'G',
  math661Date: 'G',
  studentSignature: student.lastName,
  studentDateSigned: 'asd',
  advisorSignature: data.admin.lastName,
  advisorDateSigned: 'casc'
}

describe('Test CS01MSBS submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS01MSBS form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin');
    cy.visit('/student');
    util.visitFormAsAdmin();
    cy.get('.CS01BSMS').click();
    cy.get('.cs-form [name=name]').should('have.value', student.lastName + ', ' + student.firstName)
    cy.get('.cs-form [name=pid]').should('have.value', student.pid.toString())
    util.fillCleanFormAsAdmin(CS01BSMS);
    cy.get('.CS01BSMS-submit').click();
    util.checkFormAsAdmin(CS01BSMS);
  });

  it('Submit CS01BSMS form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS01BSMS/false')
    cy.get('.cs-form [name=name]').should('have.value', student.lastName + ', ' + student.firstName)
    cy.get('.cs-form [name=pid]').should('have.value', student.pid.toString())
    cy.contains(CS01BSMS.advisorSignature);
    cy.contains(CS01BSMS.advisorDateSigned);
    delete CS01BSMS.advisorSignature;
    delete CS01BSMS.advisorDateSigned;
    util.fillFormAsStudent(CS01BSMS);
    cy.get('.CS01BSMS-submit').click();
    util.checkFormAsStudent(CS01BSMS);
  });
})
