import data from '../../../data/testRoles'
import util from './formUtil.cy';

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`

const approvedDate = new Date();
const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
const actualApproved = new Date(approvedDateMMDDYYYY);

let CS03 = {
  dept: ['COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP', 'COMP'],
  course: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  hours: ['1', '3', '4', '5', '2', '3', '5', '6', '7', '2'],
  title: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
}

let CS03Dropdowns = {
  backgroundPrep: 'true',
  programProduct: 'false',
  writingRequirement: 'cs04',
  comprehensiveExam: 'Comprehensive Paper',
}

let CS03cont = {
  select: {
    grade: ['P', 'L', 'F'],
    approved: 'true'
  },
  check: {
    studentSignature: true,
    directorSignature: true,
  },
  text: {
    semester: ['FA 2018', 'SP 2019', 'S1 2020', 'S2 2021', 'FA 2022', 'FA 2018', 'SP 2019', 'S1 2020', 'S2 2021', 'FA 2022'],
  }
}

describe('Test CS03 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  it('Give student student an advisor', () => {
    cy.session('admin_session', () => {
      cy.visit('/changeUser/admin');
    });

    cy.visit('/student');

    cy.get('.edit-student-button').click();

    cy.get('.student-navigation-edit-button').click()
    cy.url().should('contain', '/student/edit');
    cy.get('select[name="advisor"]').select('admin, admin')
    cy.get('.btn-success').click()
  })

  it('Submit CS03 form from administrator side', ()=>{
    cy.session('admin_sessions', () => {
      cy.visit('/changeUser/admin');
    });
    util.visitFormAsAdmin();
    cy.get('.CS03').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS03);
    util.fillFormByDataCy(CS03cont)
    util.selectDropdowns(CS03Dropdowns);
    util.submitForm()
    util.checkFormAsAdmin(CS03);
    util.checkDropdowns(CS03Dropdowns);
  })

  it('Submit CS03 form from student side', ()=>{
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS03/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get('[name="approved"]').should('have.value', CS03cont.select.approved)
    cy.contains('admin admin'); // the director's signature
    cy.contains(approvedDateMMDDYYYY) // shows the correct date of approval
    //cy.contains(CS03.directorDateSigned);

    delete CS03.approved;
    delete CS03.approvalReason;
    delete CS03.directorSignature;
    delete CS03.directorDateSigned;
    delete CS03.name;
    delete CS03.pid;
    delete CS03.directorCheckbox;
    //maybe don't autofill this on the html
    delete CS03.dept;

    util.fillFormAsStudent(CS03);
    util.submitForm()
    util.checkFormAsStudent(CS03);
  });
})
