import data from '../../../data/testRoles'
import util from './formUtil';

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`

let CS03 = {
  DR: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  dept: ['COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP'],
  course: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  hours: ['1', '3', '4', '5', '2', '3', '5', '6', '7', '2'],
  semester: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  title: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  studentSignature: 'A',
  studentDateSigned: 'AA',
  approvalReason: 'ASDF',
  directorSignature: 'ASDF',
  directorDateSigned: 'YOYOYO'
}

let CS03Dropdowns = {
  backgroundPrep: 'true',
  programProduct: 'false',
  comprehensivePaper: 'true',
  thesis: 'true',
  outsideReview: 'true',
  comprehensiveExam: 'Comprehensive Paper',
  approved: 'Approved by Graduate Studies Committee'
}

describe('Test CS03 submissions', ()=>{
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

  it('Submit CS03 form from administrator side', ()=>{
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS03').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS03);
    util.selectDropdowns(CS03Dropdowns);
    cy.get('.CS03-submit').click();
    util.checkFormAsAdmin(CS03);
    util.checkDropdowns(CS03Dropdowns);
  })

  it('Submit CS03 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS03/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.contains(CS03Dropdowns.approved)
    cy.contains(CS03.approvalReason);
    cy.contains(CS03.directorSignature);
    cy.contains(CS03.directorDateSigned);

    delete CS03.approved;
    delete CS03.approvalReason;
    delete CS03.directorSignature;
    delete CS03.directorDateSigned;
    delete CS03.name;
    delete CS03.pid;
    //maybe don't autofill this on the html
    delete CS03.dept;

    util.fillFormAsStudent(CS03);
    cy.get('.CS03-submit').click();
    util.checkFormAsStudent(CS03);
  });
})
