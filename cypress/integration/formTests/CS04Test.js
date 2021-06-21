import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS04 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  dateSubmitted: 'Feb.2, 2020',
  projectDescription: 'ASDF',
  studentSignature: 'AA',
  studentDateSigned: 'AAA',
  chairmanSignature: 'ASDF',
  chairmanDateSigned: 'ASSDF',
}

let CS04Dropdowns = {
  docProprietary: 'false',
  approved: 'false'
}

describe('Test CS04 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS04 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS04').click();
    util.fillCleanFormAsAdmin(CS04);
    util.selectDropdowns(CS04Dropdowns);
    cy.get('.CS04-submit').click();
    util.checkFormAsAdmin(CS04);
    util.checkDropdowns(CS04Dropdowns);
  })

  it('Submit CS04 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS04/false')

    cy.contains(CS04Dropdowns.approved)
    cy.contains(CS04.chairmanSignature);
    cy.contains(CS04.chairmanDateSigned);

    delete CS04.chairmanSignature
    delete CS04.approved;
    delete CS04.chairmanDateSigned;
    delete CS04.name;
    delete CS04.pid;

    util.fillFormAsStudent(CS04);
    cy.get('.CS04-submit').click();
    util.checkFormAsStudent(CS04);
  });
})
