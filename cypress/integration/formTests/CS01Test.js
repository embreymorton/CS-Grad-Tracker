import data from '../../../data/testRoles';
import util from './formUtil';

const approvedDate = new Date();
const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
const actualApproved = new Date(approvedDateMMDDYYYY);

let CS01 = {
  comp283Covered: 'A',
  comp283Date: '2021-01-01',
  comp410Covered: 'B',
  comp410Date: '2021-01-01',
  comp411Covered: 'C',
  comp411Date: '2021-01-01',
  comp455Covered: 'D',
  comp455Date: '2021-01-01',
  comp521Covered: 'E',
  comp521Date: '2021-01-01',
  comp520Covered: 'F',
  comp520Date: '2021-01-01',
  comp530Covered: 'G',
  comp530Date: '2021-01-01',
  comp524Covered: 'H',
  comp524Date: '2021-01-01',
  comp541Covered: 'I',
  comp541Date: '2021-01-01',
  comp550Covered: 'J',
  comp550Date: '2021-01-01',
  math233Covered: 'K',
  math233Date: '2021-01-01',
  math381Covered: 'L',
  math381Date: '2021-01-01',
  math547Covered: 'M',
  math547Date: '2021-01-01',
  math661Covered: 'N',
  math661Date: '2021-01-01',
  stat435Covered: 'O',
  stat435Date: '2021-01-01',
  studentSignature: 'true',
  studentDateSigned: `${actualApproved}`,
  studentCheckbox: 'on',
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
    cy.get('.CS01-submit').click();
    util.checkFormAsAdmin(CS01);
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
