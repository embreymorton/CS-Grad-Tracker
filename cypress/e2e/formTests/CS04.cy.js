import { student } from '../../../data/testRoles';
import util from './formUtil.cy';

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

const form1a = {
  text: {
    projectDescription: 'a project that is not great',
    publication: 'The Journal of Meds',
    authors: 'Me, myself, and I, et. al',
    publicationDate: '2001-01-01'
  },
  select: {
    docProprietary: 'Yes. A non-disclosure agreement is attached.'
  }
}

const form1b = {
  select: {
  },
  text: {
  },
  check: {
    advisorSignature: true,
    majorityCompleted: true,
    satisfiesComprehensiveWriting: false,
  }
}

describe('Test CS04 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  it('Give student student an advisor', () => {
    cy.session('admin_sessions', () => {
      cy.visit('/changeUser/admin');
    });
    cy.visit('/student');

    cy.get('.edit-student-button').click();

    cy.get('.student-navigation-edit-button').click()
    cy.url().should('contain', '/student/edit');
    cy.get('select[name="advisor"]').select('admin, admin')
    cy.get('.btn-success').click()
  })
  
  it('Submit CS04 form from student side', ()=>{
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS04/false')

    cy.contains(name)
    cy.contains(pid.toString())
  
    util.fillFormByDataCy(form1a)
    util.submitForm()
  })

  it('Submit CS04 form from administrator side', ()=>{
    cy.session('admin_sessions', () => {
      cy.visit('/changeUser/admin');
    });
    util.visitFormAsAdmin();
    cy.get('.CS04').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.verifyFormByDataCy(form1a)
    util.fillFormByDataCy(form1b)
    util.submitForm()
  })

})
