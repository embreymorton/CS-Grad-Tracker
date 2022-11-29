import data from '../../../data/testRoles'
import util from './formUtil'

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`

const form1 = {
  text: {
    progressMade: 'I went to class.',
    goals: 'Not fail.',
    rataPreferences: 'COMP 110',
    academicComments: 'great grades',
    // rataComments: '' // not required
  },
  check: {
    academicSignature: true,
    employmentSignature: true,
    academicRating: '4',
    rataRating: '0'
  },
  select: {
    semester: 'FA 2019'
  }
}

const form2 = {
  text: {
    progressMade: 'I went to class at least once.',
    goals: 'Not fail again.',
    rataPreferences: 'COMP 995'
  },
  select: {
    semester: 'FA 2019'
  }
}

/*
Tests these properties of the SemesterProgressReport
  - ensures students are unable to see their advisor's evaluations
  - ensure for each student, only one form/semester is allowed
  - ensure form completion works
 */
describe('Test Semester Progress Report Submissions', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Give student student an advisor', () => {
    cy.visit('/changeUser/admin')
    cy.visit('/student')

    cy.get('.edit-student-button').click()

    cy.get('.student-navigation-edit-button').click()
    cy.url().should('contain', '/student/edit')
    cy.get('select[name="advisor"]').select('admin, admin')
    cy.get('.btn-success').click()
  })

  it('Submit form from administrator side', () => {
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.SemesterProgressReport').click()
    cy.contains('Create New Form').click()
    cy.contains(name)
    cy.contains(pid.toString())
    
    util.fillFormByDataCy(form1)
    cy.get('#submit-btn').click()
    util.verifyFormByDataCy(form1)
  })

  it('Submit form from student side', () => {
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/SemesterProgressReport/false')
    cy.contains(form1.select.semester) 
    cy.contains('✅') // ensure the previously submitted form is marked as completed
    cy.contains('View').click()

    cy.contains(name)
    cy.contains(pid.toString())
    cy.contains('For Faculty:').should('not.exist')
    cy.get('[name="academicRating"]').should('not.exist')
    cy.get('[name="academicComments"]').should('not.exist')
    cy.get('[name="rataRating"]').should('not.exist')
    cy.get('[name="rataComments"]').should('not.exist')
  })

  it('Create a second form with the same semester, then change the semester upon error.', () => {
    cy.visit('/studentView/multiforms/SemesterProgressReport')
    cy.contains('Create New Form').click()
    util.fillFormByDataCy(form2)
    cy.get('#save-btn').click()
    cy.contains('already exists')
    cy.go('back')
    cy.get('[data-cy="semester"]').select('SP 2019')
    cy.get('#save-btn').click()
  })
})
