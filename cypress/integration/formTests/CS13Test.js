import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS13 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  email: '@yahoo.com',
  dateMet: 'Here',
  comp523Signature : 'asdas',
  comp523Name: 'dddd',
  jobInfo: 'ssss',
  advisorName: 'asdasd',
  advisorSignature: 'NAme',
  product: 'WO',
  client: 'Tony',
  position: 'HEAD',
  altSignature1: 'Aad',
  altSignature2: 'Peep'
}

let CS13Dropdowns = {
  comp523: 'true',
  hadJob: 'false',
  alternative: 'true'
}

describe('Test CS13 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS13 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS13').click();
    util.fillCleanFormAsAdmin(CS13);
    util.selectDropdowns(CS13Dropdowns);
    cy.get('.CS13-submit').click();
    util.checkFormAsAdmin(CS13);
  })

  it('Submit CS13 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS13/false');

    cy.contains(CS13.advisorSignature);
    cy.contains(CS13.altSignature1);
    cy.contains(CS13.altSignature2);
    cy.contains(CS13.comp523Signature);

    delete CS13.name;
    delete CS13.pid;
    delete CS13.advisorName;
    delete CS13.advisorSignature;
    delete CS13.comp523Name;
    delete CS13.comp523Signature;
    delete CS13.altSignature1;
    delete CS13.altSignature2;

    util.fillFormAsStudent(CS13);
    cy.get('.CS13-submit').click();
    util.checkFormAsStudent(CS13);
  });
})
