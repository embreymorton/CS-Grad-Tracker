import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS08 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  semester : 'asdsadsa',
  year : '1293',
  title : 'a',
  primaryReader: '1asdasd',
  primaryDate: '1asdasdqwc',
  secondaryReader: '2asdasd',
  secondaryDate: '2asdasdqwc',
  primarySignature: '1asdasd',
  primarySignedDate: '1asdasdqwc',
  secondarySignature: '2asdasd',
  secondarySignedDate: '2asdasdqwc',
}

describe('Test CS08 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS08 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS08').click();
    util.fillCleanFormAsAdmin(CS08);
    cy.get('.CS08-submit').click();
    util.checkFormAsAdmin(CS08);
  })

  it('Submit CS08 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS08/false');

    cy.contains(CS08.primaryReader);
    cy.contains(CS08.primaryDate);
    cy.contains(CS08.secondaryReader);
    cy.contains(CS08.secondaryDate);
    cy.contains(CS08.primarySignature);
    cy.contains(CS08.secondarySignature);
    cy.contains(CS08.primarySignedDate);
    cy.contains(CS08.secondarySignedDate);

    delete CS08.primaryReader;
    delete CS08.primaryDate;
    delete CS08.secondaryReader;
    delete CS08.secondaryDate;
    delete CS08.primarySignature;
    delete CS08.secondarySignature;
    delete CS08.primarySignedDate;
    delete CS08.secondarySignedDate;
    delete CS08.name;
    delete CS08.pid;

    util.fillFormAsStudent(CS08);
    cy.get('.CS08-submit').click();
    util.checkFormAsStudent(CS08);
  });
})
