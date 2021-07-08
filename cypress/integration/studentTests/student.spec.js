var student = require('../../../data/testRoles').student

describe('Test student routes and functionality', ()=>{
  let job, supervisor, semester
  before(async () => {
    const { body } = await cy.request('/util/resetDatabaseToSnapshot')
    job = body.job
    // FIXME: coupled to implementation details in fixtures namespace
    supervisor = body.roles.faculty
    semester = body.semesters[0]
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Make sure student can not access job, course, and student create routes', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/student');
    cy.contains('Not faculty');
    cy.visit('/course');
    cy.contains('Not admin');
    cy.visit('/job');
    cy.contains('Not admin');
    cy.visit('/faculty');
    cy.contains('Not admin');
  })

  it('When logged in as student, get taken to studentView page', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/')
    cy.url().should('include','/studentView')
  })

  var updateStudent = {
    'first-name':'NEWNAME',
    'last-name':'NEWLAST',
    'alternative-name':'ALT NAME',
    'gender':'MALE',
    'ethnicity':'ASIAN',
  }

  it('Able to update some basic info on the student page', ()=>{
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

  it('Should be able to click top navigation bar and be brought to correct pages', ()=>{
    cy.visit('/')
    cy.get('.student-jobs').click()
    cy.url().should('include', 'studentView/jobs')
    cy.get('.student-forms').click()
    cy.url().should('include', 'studentView/forms')
    cy.get('.student-profile').click()
    cy.url().should('include', 'studentView')
    cy.get('.student-courses').click()
    cy.url().should('include', 'studentView/courses')
  })

  it('Student should be able to see a job they are holding', ()=>{
    cy.visit('/changeUser/admin')
    cy.visit('/job')
    cy.get('.assign-job-button').click()
    const updatedName = updateStudent['last-name'] + ', ' + updateStudent['first-name']
    cy.get('.assign-student-select').select(updatedName)
    cy.get('.assign-job-submit-button').click()
    cy.visit('/changeUser/student')
    cy.visit('/studentView/jobs')
    cy.get('.student-job-table').find('tr').should('have.length', 2);
    cy.contains(job.position)
    const superName = `${supervisor.lastName}, ${supervisor.firstName}`
    cy.contains(superName)
    const semesterStr = `${semester.season} ${semester.year}`
    cy.contains(semesterStr)
  })

  //include form tests and other tests as issues come up
})
