import { student } from '../../../data/testRoles';
import util from './formUtil.cy'

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

const alternativeCS13_S = {
  select: {
    alt1Signature: 'admin, admin',
    alt2Signature: 'faculty, faculty'
  }
}

const alternativeCS13_A = {
  check: {
    alt1DateSigned: true,
    alt2DateSigned: true,
  }
}

describe('Test CS13 Submissions', () => {
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

  it('Submit CS13 form from the student side first, with alternative filled out.', () => {
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS13/false')

    cy.contains(name)
    cy.contains(pid.toString())

    cy.get('#altcol').click()
    cy.get('textarea[name="product"]').type('Hey guys, this is the product I made.')
    cy.get('input[name="client"]').type('Moi')
    cy.get('input[name="position"]').type('Filling out required boxes that is what I do~~')
    util.fillFormByDataCy(alternativeCS13_S)
    util.submitForm()
    util.verifyFormByDataCy(alternativeCS13_S)
  })

  it('Edit and approve of CS13 form from the admin side.', () => {
    cy.session('admin_session2', () => {
      cy.visit('/changeUser/admin');
    });

    util.visitFormAsAdmin()
    cy.get('.CS13').click()

    util.fillFormByDataCy(alternativeCS13_A)

    util.submitForm()
  })

  it('Check that student fields were updated upon completion of the form.', () => {
    cy.session('admin_session3', () => {
      cy.visit('/changeUser/admin');
    });

    cy.visit('/student')
    cy.get('.edit-student-button').click()
    let date = new Date()
    cy.get('[name="programProductRequirement"]').should('have.value', `${date.getFullYear()}-${date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`) // js dates suck
  })

  it('Go back to student side and checks that the submit button is gone.', () => {
    cy.session('student_session2', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/forms/CS13/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get(`#submit-btn`).should('not.exist')
    cy.get('textarea[name="product"]').should('not.exist')
  })
})
