import { student } from '../../../data/testRoles';
import util from './formUtil';

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

let CS04 = {
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
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS04 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS04').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS04);
    util.selectDropdowns(CS04Dropdowns);
    cy.get('.CS04-submit').click();
    util.checkFormAsAdmin(CS04);
    util.checkDropdowns(CS04Dropdowns);
  })

  it('Submit CS04 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS04/false')

    cy.contains(name)
    cy.contains(pid.toString())
    cy.contains(CS04.chairmanSignature);
    cy.contains(CS04.chairmanDateSigned);

    delete CS04.chairmanSignature
    delete CS04.chairmanDateSigned;

    util.fillFormAsStudent(CS04);
    cy.get('.CS04-submit').click();
    util.checkFormAsStudent(CS04);
  });
})
