import { student } from '../../../data/testRoles';
import util from './formUtil';

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

let CS08 = {
  title : 'a',
  primaryDate : '2019-09-19',
  secondaryDate : '2019-09-20'
}

describe('Test CS08 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
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

  it('Submit CS08 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS08').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS08);
    cy.get('#primaryReaderSelect').select('faculty faculty')
    cy.get('#primaryDateSignedCheckbox').check()
    cy.get('#secondaryReaderSelect').select('admin admin')
    cy.get('.CS08-submit').click();
    util.checkFormAsAdmin(CS08);
  })

  it('Submit CS08 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS08/false');
    cy.contains(name)
    cy.contains(pid.toString())

    cy.contains('faculty faculty')
    cy.contains('admin admin')
    cy.get('.pseudo-input').contains('faculty faculty')
    cy.get('.pseudo-checked')

    delete CS08.primaryReader;
    delete CS08.primaryDate;
    delete CS08.secondaryReader;
    delete CS08.secondaryDate;

    util.fillFormAsStudent(CS08);
    cy.get('.CS08-submit').click();
    util.checkFormAsStudent(CS08);
  });
})
