import data from '../../../data/testRoles';
import util from './formUtil';

const approvedDate = new Date();
const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
const actualApproved = new Date(approvedDateMMDDYYYY);

let CS01 = {
  comp283Covered: 'A',
  comp210Covered: 'B',
  comp311Covered: 'C',
  comp455Covered: 'D',
  comp421Covered: 'E',
  comp520Covered: 'F',
  comp530Covered: 'G',
  comp524Covered: 'H',
  comp541Covered: 'I',
  comp550Covered: 'J',
  math233Covered: 'K',
  math381Covered: 'L',
  math547Covered: 'M',
  math661Covered: 'N',
  stat435Covered: 'O',
}

let CS01cont = {
  select: {
    comp283Date: 'FA 2022',
    comp210Date: 'FA 2022',
    comp311Date: 'FA 2022',
    comp455Date: 'FA 2022',
    comp421Date: 'FA 2022',
    comp520Date: 'FA 2022',
    comp530Date: 'FA 2022',
    comp524Date: 'FA 2022',
    comp541Date: 'FA 2022',
    comp550Date: 'FA 2022',
    math233Date: 'FA 2022',
    math381Date: 'FA 2022',
    math547Date: 'FA 2022',
    math661Date: 'FA 2022',
    stat435Date: 'FA 2022',
  },
  check: {
    studentSignature: true
  }
}

describe('Test CS01 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  const { lastName, firstName, pid } = data.student
  const name = lastName + ', ' + firstName
  
  it('Give student student an advisor', () => {
    cy.visit('/changeUser/admin');
    cy.visit('/student');

    cy.get('.edit-student-button').click();

    cy.get('.student-navigation-edit-button').click()
    cy.url().should('contain', '/student/edit');
    cy.get('select[name="advisor"]').select('admin, admin')
    cy.get('.btn-success').click()
  })

  it('Submit CS01 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS01').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS01);
    util.fillFormByDataCy(CS01cont)
    cy.get('.CS01-submit').click();
    util.checkFormAsAdmin(CS01);
    util.verifyFormByDataCy(CS01cont);
  })

  it('Submit CS01 form from student side, check to make sure values from admin submission are there', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS01/false')
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillFormAsStudent(CS01);
    cy.get('.CS01-submit').click();
    util.checkFormAsStudent(CS01);
  });
})
