var student = require('../../../data/testRoles').student

describe('Test student routes and functionality', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  it('Make sure student can not access job, course, and student create routes', () => {
    cy.session('student_session', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/student');
    cy.contains('Not faculty');
    cy.visit('/course');
    cy.contains('Not admin');
    cy.visit('/job');
    cy.contains('Not admin');
    cy.visit('/faculty');
    cy.contains('Not admin');
  })

  it('When logged in as student, get taken to studentView page', () => {
    cy.session('student_session2', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/')
    cy.url().should('include', '/studentView')
  })

  var updateStudent = {
    'first-name':'NEWNAME',
    'last-name':'NEWLAST',
    'alternative-name':'ALT NAME',
    'gender':'MALE',
    'ethnicity':'ASIAN',
  }

  it('Able to update some basic info on the student page', () => {
    cy.session('student_session4', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/')
    cy.get('.input-first-name')
      .clear()
      .type(updateStudent['first-name'])
    cy.get('.input-last-name')
      .clear()
      .type(updateStudent['last-name'])
    cy.get('.input-alt-name')
      .clear()
      .type(updateStudent['alternative-name'])
    cy.get('.input-gender')
      .select(updateStudent.gender)
    cy.get('.input-ethnicity')
      .select(updateStudent.ethnicity)
    cy.get('.update-button-submit').click()
    cy.get('.input-gender')
      .select('OTHER')
    cy.get('.input-ethnicity')
      .select('OTHER')
    cy.get('.update-button-submit').click();
  })

  it('Should be able to click top navigation bar and be brought to correct pages', () => {
    cy.session('student_session5', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/')
      /* Removed functionality */
      /*
    cy.get('.student-jobs').click()
    cy.url().should('include', 'studentView/jobs')
    */
    cy.get('.student-forms').click()
    cy.url().should('include', 'studentView/forms')
    cy.get('.student-profile').click()
    cy.url().should('include', 'studentView')
      /* Removed content */
      /*
    cy.get('.student-courses').click()
    cy.url().should('include', 'studentView/courses')
    */
  })

    /* Removed content */
    /*
  it('Student should be able to see a job they are holding', () => {
    cy.session('admin_session', () => {
      cy.visit('/changeUser/admin');
    });
    cy.visit('/job')
    cy.get('.assign-job-button').click()
    const updatedName = updateStudent['last-name'] + ', ' + updateStudent['first-name']
    cy.get('.assign-student-select').select(updatedName)
    cy.get('.assign-job-submit-button').click()
    cy.session('student_session3', () => {
      cy.visit('/changeUser/student');
    });
    cy.visit('/studentView/jobs')
    cy.get('.student-job-table').find('tr').should('have.length', 2);
    // FIXME: next 3 lines of code are invisibly coupled to fixtures data.
    // (see this line's commit message for more info)
    cy.contains('TA')
    cy.contains(`faculty, faculty`)
    cy.contains(`FA 2018`)
  })
*/

  //include form tests and other tests as issues come up
})
