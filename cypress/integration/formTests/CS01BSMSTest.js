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
  studentDateSigned: 'asd'
}

describe('Test CS01MSBS submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  const { lastName, firstName, pid } = student
  const name = lastName + ', ' + firstName

  it('Submit CS01MSBS form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin');
    cy.visit('/student');
    util.visitFormAsAdmin();
    cy.get('.CS01BSMS').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS01BSMS);
    cy.get('.CS01-submit').click();
    util.checkFormAsAdmin(CS01BSMS);
  });

  it('Submit CS01BSMS form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS01BSMS/false')
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillFormAsStudent(CS01BSMS);
    cy.get('.CS01-submit').click();
    util.checkFormAsStudent(CS01BSMS);
  });
})
