import { student } from '../../../data/testRoles';
import util from './formUtil'

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

const jobInfoMsg = `Hello everyone, I am checking to see if submission will retain data even if not approved in this section.`

describe('Test CS13 Submissions', () => {
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

  it('Submit CS13 form from the student side first, with alternative filled out.', () => {
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS13/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get('select[name="alternative"]').select('true')
    cy.get('textarea[name="product"]').type('Hey guys, this is the product I made.')
    cy.get('input[name="client"]').type('Moi')
    cy.get('input[name="position"]').type('Filling out required boxes that is what I do~~')
    cy.get('#alt1SignatureSelect').select('admin, admin')
    cy.get('#alt2SignatureSelect').select('faculty, faculty')
    cy.get('.CS13-submit').click()

    cy.get('#alt1SignatureSelect').contains('admin, admin')
    cy.get('#alt2SignatureSelect').contains('faculty, faculty')    
  })

  it('Edit and approve of CS13 form from the admin side.', () => {
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS13').click()

    cy.get('#alt1DateSignedCheckbox').click()
    cy.get('#alt2DateSignedCheckbox').click()

    cy.get('textarea[name="jobInfo"]').type(jobInfoMsg)

    cy.get('.CS13-submit').click()
    
    cy.contains(jobInfoMsg)
  })

  it('Go back to student side and checks that the submit button is gone.', () => {
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS13/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get(`.CS13-submit`).should('not.exist')
    cy.contains(jobInfoMsg) // boxes should be locked down, but the info should still be visible
    cy.get('textarea[name="jobInfo"]').should('not.exist') 
  })
})
