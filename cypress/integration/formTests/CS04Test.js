import { student } from '../../../data/testRoles';
import util from './formUtil';

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

const form1a = {
  check: {
    majorityCompleted: true,
    satisfiesComprehensiveWriting: false,
  },
  text: {
    projectDescription: 'a project that is not great',
  },
  select: {
    docProprietary: 'Yes. A non-disclosure agreement is attached.'
  }
}

const form1b = {
  select: {
    approved: 'Disapproved'
  },
  text: {
    approvalReason: 'because it\'s bad.'
  },
  check: {
    advisorSignature: true
  }
}

describe('Test CS04 submissions', ()=>{
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
  
  it('Submit CS04 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS04/false')

    cy.contains(name)
    cy.contains(pid.toString())
  
    util.fillFormByDataCy(form1a)
    cy.get('.CS04-submit').click()
  })

  it('Submit CS04 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS04').click();
    cy.contains(name)
    cy.contains(pid.toString())
    util.verifyFormByDataCy(form1a)
    util.fillFormByDataCy(form1b)
    cy.get('.CS04-submit').click();
  })

})
