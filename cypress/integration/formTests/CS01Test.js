import data from '../../../data/testRoles';
import util from './formUtil';

let CS01 = {
  comp283Covered: 'A',
  comp283Date: '1/1/1',
  comp410Covered: 'B',
  comp410Date: 'B',
  comp411Covered: 'C',
  comp411Date: 'C',
  comp455Covered: 'D',
  comp455Date: 'D',
  comp521Covered: 'E',
  comp521Date: 'E',
  comp520Covered: 'F',
  comp520Date: 'F',
  comp530Covered: 'G',
  comp530Date: 'G',
  comp524Covered: 'H',
  comp524Date: 'H',
  comp541Covered: 'I',
  comp541Date: 'I',
  comp550Covered: 'J',
  comp550Date: 'J',
  math233Covered: 'K',
  math233Date: 'K',
  math381Covered: 'L',
  math381Date: 'L',
  math547Covered: 'M',
  math547Date: 'M',
  math661Covered: 'N',
  math661Date: 'N',
  stat435Covered: 'O',
  stat435Date: 'O',
  studentSignature: data.student.lastName,
  studentDateSigned: 'BRUH',
  advisorSignature: data.admin.lastName,
  advisorDateSigned: 'YO yoyo'
}

describe('Test CS01 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  const { lastName, firstName, pid } = data.student
  const name = lastName + ', ' + firstName

  it('Submit CS01 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS01').click();
    cy.get('.cs-form [name=name]').should('have.value', name)
    cy.get('.cs-form [name=pid]').should('have.value', pid.toString())
    util.fillCleanFormAsAdmin(CS01);
    cy.get('.CS01-submit').click();
    util.checkFormAsAdmin(CS01);
  })

  it('Submit CS01 form from student side, check to make sure values from admin submission are there', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS01/false')
    cy.get('.cs-form [name=name]').should('have.value', name)
    cy.get('.cs-form [name=pid]').should('have.value', pid.toString())
    cy.contains(CS01.advisorSignature);
    cy.contains(CS01.advisorDateSigned);
    delete CS01.advisorSignature;
    delete CS01.advisorDateSigned;
    util.fillFormAsStudent(CS01);
    cy.get('.CS01-submit').click();
    util.checkFormAsStudent(CS01);
  });
})
