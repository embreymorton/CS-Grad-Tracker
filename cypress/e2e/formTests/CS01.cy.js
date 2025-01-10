import data from '../../../data/testRoles';
import util from './formUtil.cy';

const approvedDate = new Date();
const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
const actualApproved = new Date(approvedDateMMDDYYYY);

const form1 = {
  select: {
    comp283Covered: 'Course',
    comp210Covered: 'Independent Study',
    comp311Covered: 'Work Experience',
    comp455Covered: 'Course',
    comp421Covered: 'Independent Study',
    comp520Covered: 'Not covered',
    comp530Covered: 'Work Experience',
    comp524Covered: 'Course',
    comp541Covered: 'Course',
    comp550Covered: 'Course',
    math233Covered: 'Course',
    math381Covered: 'Course',
    math547Covered: 'Course',
    math661Covered: 'Course',
    stat435Covered: 'Course',
  },
  check: {
    studentSignature: true,
    advisorSignature: true,
  }
}

const form2 = {
  text: {
    comp283Description: 'NCSU - CSC 226',
    comp283Date: '2001-01-01',

    comp210Date: '2002-01-01',
    comp311Description: 'Amazon - SDE 1',
    comp311Date: '11/12/2022-12/20/2023',
    comp455Description: 'COMP 455',
    comp455Date: 'SP 2020',

    comp421Date: '2003-01-01',
    comp530Description: 'Apple - Hardware Engineer',
    comp530Date: '1993-2004',
    comp524Description: 'a course',
    comp524Date: 'FA 2022',
    comp541Description: 'a course',
    comp541Date: 'FA 2022',
    comp550Description: 'a course',
    comp550Date: 'FA 2022',
    math233Description: 'a course',
    math233Date: 'FA 2022',
    math381Description: 'a course',
    math381Date: 'FA 2022',
    math547Description: 'a course',
    math547Date: 'FA 2022',
    math661Description: 'a course',
    math661Date: 'FA 2022',
    stat435Description: 'a course',
    stat435Date: 'FA 2022',
  },
  select: {
    comp210Description: 'admin, admin',
    comp421Description: 'admin, admin',

  }
}

describe('Test CS01 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  const { lastName, firstName, pid } = data.student
  const name = lastName + ', ' + firstName

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

  it('Submit CS01 form from administrator side', ()=>{
    cy.session('admin_session2', () => {
      cy.visit('/changeUser/admin');
    });
    util.visitFormAsAdmin();
    cy.get('.CS01').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillFormByDataCyFiltered(form1)
    util.fillFormByDataCyFiltered(form2)
    util.submitForm();
    util.verifyFormByDataCy(form1);
    util.verifyFormByDataCy(form2);
  })

  it('Submit CS01 form from student side, check to make sure values from admin submission are there', ()=>{
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS01/false')
    cy.contains(name)
    cy.contains(pid.toString())
    delete form1.check.advisorSignature
    cy.get('#submit-btn').should('not.exist');
    util.verifyFormByDataCy(form1);
    util.verifyFormByDataCy(form2);
  });
})
