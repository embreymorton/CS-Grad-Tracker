import data from '../../../data/testRoles'
import util from './formUtil.cy'

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`

const CS02 = {
  dateSubmitted: '2019-02-02',
  courseNumber: 'COMP 560',
  basisWaiver: 'Taken',
}

const secondCS02 = {
  dateSubmitted: '2021-01-01',
  courseNumber: 'COMP 101',
  basisWaiver: 'By examination'
}

const baseCS02 = {
  select: {
    instructorSignature: 'faculty, faculty'
  },
  check: {
    instructorDateSigned: true
  }
}

describe('Test CS02 submissions', () => {
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

  it('Submit CS02 form from administrator side', () => {
    cy.session('admin_session2', () => {
      cy.visit('/changeUser/admin');
    });

    util.visitFormAsAdmin()
    cy.get('.CS02').click()
    cy.contains('Create New Form').click()
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS02)
    util.fillFormByDataCy(baseCS02)
    util.submitForm()
    util.fillFormAsStudent(CS02)
  })

    it('Submit CS02 form from student side', () => {
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS02/false')
    cy.contains('View').click()
    cy.contains(name)
    cy.contains(pid.toString())
    cy.contains('faculty faculty')

    util.fillFormAsStudent(CS02)
    util.submitForm()
    util.checkFormAsStudent(CS02)
  })

    it('Create a second CS02 from the student side', () => {
    cy.session('student_session2', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/multiforms/CS02')
    cy.contains('Create New Form').click()
    util.fillCleanFormAsAdmin(secondCS02)
    cy.get('#save-btn').click()
  })

  it('Check the second CS02 form is saved from the student side.', () => {
    cy.session('student_session3', () => {
      cy.visit('/changeUser/student');
    });

    cy.visit('/studentView/multiforms/CS02')
    cy.contains('COMP 560')
    cy.contains('COMP 101')
  })
})
