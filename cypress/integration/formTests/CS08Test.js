import { student } from '../../../data/testRoles';
import util from './formUtil';

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

let CS08 = {
  semester : 'asdsadsa',
  year : '1293',
  title : 'a',
  primaryReader: '1asdasd',
  primaryDate: '1asdasdqwc',
  secondaryReader: '2asdasd',
  secondaryDate: '2asdasdqwc',
}

describe('Test CS08 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS08 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS08').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS08);
    cy.get('#primarySignatureSelect').select('faculty faculty')
    cy.get('#primaryDateSignedCheckbox').check()
    cy.get('#secondarySignatureSelect').select('admin admin')
    cy.get 
    cy.get('.CS08-submit').click();
    util.checkFormAsAdmin(CS08);
  })

  it('Submit CS08 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS08/false');
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get('.form-control[name="primaryReader"]').should('have.value', CS08.primaryReader);
    cy.get('.form-control[name="primaryDate"]').should('have.value', CS08.primaryDate);
    cy.get('.form-control[name="secondaryReader"]').should('have.value', CS08.secondaryReader);
    cy.get('.form-control[name="secondaryDate"]').should('have.value', CS08.secondaryDate);
    cy.get('.pseudo-input').contains('faculty faculty')
    cy.get('.pseudo-checked')
    cy.get('#secondarySignatureSelect').should('have.value', 'admin admin')


    delete CS08.primaryReader;
    delete CS08.primaryDate;
    delete CS08.secondaryReader;
    delete CS08.secondaryDate;

    util.fillFormAsStudent(CS08);
    cy.get('.CS08-submit').click();
    util.checkFormAsStudent(CS08);
  });
})
