import data from '../../../data/testRoles'
import util from './formUtil'

const { lastName, firstName, pid } = data.student
const name = `${lastName}, ${firstName}`

const CS02 = {
  dateSubmitted: 'Feb.2, 2020',
  courseNumber: 'COMP 560',
  basisWaiver: 'Taken',
}

describe('Test CS02 submissions', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
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

  it('Submit CS02 form from administrator side', () => {
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS02').click()
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS02)
    cy.get('#instructorSignatureSelect').select('faculty faculty')
    cy.get('.CS02-submit').click()
    util.fillFormAsStudent(CS02)
  })

  it('Submit CS02 form from student side', () => {
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS02/false')
    cy.contains(name)
    cy.contains(pid.toString())
    cy.contains('faculty faculty')

    util.fillFormAsStudent(CS02)
    cy.get('.CS02-submit').click()
    util.checkFormAsStudent(CS02)

  })
})
