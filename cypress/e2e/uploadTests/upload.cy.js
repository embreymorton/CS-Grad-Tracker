var data = require('./data.cy')

describe('Upload data', ()=>{
  const filePath = '../../data/InOrderUploadTests/'

  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    cy.session('admin_session', () => {
      cy.visit('/changeUser/admin');
    });
  })

  it('Uploading Admin should correctly store data in database', ()=>{
    cy.visit('/faculty/upload/false')
    const fileName = filePath + '1facultyUpload.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.upload-faculty-input').attachFile({fileContent, fileName, mimeType: 'application/csv'})
    });
    cy.get('.upload-faculty-submit-button').click()
    cy.visit('/faculty')
    cy.contains(data.uploadFaculty.firstName)
    cy.contains(data.uploadFaculty.lastName)
    cy.contains(data.uploadFaculty.pid)
  })

  it('Uploading student should correctly store data in database', ()=>{
    cy.visit('/student/upload/false')
    const fileName = filePath + '2studentUpload.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.student-upload-input').attachFile({fileContent, fileName, mimeType: 'application/csv'})
    });
    cy.get('.student-upload-submit-button').click()
    cy.visit('/student')
    cy.contains(data.uploadStudent.firstName)
    cy.contains(data.uploadStudent.pid)
    cy.contains(data.uploadStudent.status)
    cy.get('.search-last-name').type('Fake')
    cy.get('.search-student-submit').click()
    cy.get('.edit-student-button').click()
    cy.get('input[name=backgroundApproved]').should('have.value', data.uploadStudent.backgroundApproved)
    cy.contains(data.uploadStudent.gender)
    cy.contains(data.uploadStudent.intendedDegree)
    cy.contains(data.uploadStudent.pronouns)
    cy.contains(data.uploadStudent.stateResidency)
    cy.contains(data.uploadStudent.USResidency)
    cy.contains(data.uploadStudent.semesterStarted)
    cy.contains(data.uploadStudent.advisor)
  })

    /* This feature doesn't really seem to work */
    /*
  it('Uploading course should correctly store data in database', ()=>{
    cy.visit('/course/upload/false')
    const fileName = filePath + '3courseUpload.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.course-upload-input').attachFile({fileContent, fileName, mimeType: 'application/csv'})
    });
    cy.get('.course-upload-submit-button').click()
    cy.visit('/course')
    cy.contains(data.uploadCourse.number)
    cy.contains(data.uploadCourse.name)
    cy.contains(data.uploadCourse.category)
    cy.contains(data.uploadCourse.topic)
    cy.contains(data.uploadCourse.hours)
    cy.contains(data.uploadCourse.faculty)
    cy.contains(data.uploadCourse.semester)
    })
    */
    /* Also broken */
    /*
  it('Uploading a grant xlsx/csv should correctly store data in the database', ()=>{
    cy.visit('/job/uploadGrant/false')
    const fileName = filePath + '4grantUpload.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.grant-upload-input').attachFile({fileContent, fileName, mimeType: 'application/csv'})
    });
    cy.get('.grant-upload-submit-button').click()
    cy.visit('/job/create')
    cy.get('.input-funding-source > option').eq(1).should('have.text', data.uploadGrant.name)
  })

  it('Uploading courseInfo xlsx/csv should correctly store data in the database', ()=>{
    cy.visit('/course/uploadinfo/false')
    const fileName = filePath + '6gradeUpload.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.upload-course-info-input').attachFile({fileContent, fileName, mimeType: 'application/csv'})
    });
    cy.get('.upload-course-info-submit').click();
    cy.visit('/course/create');
    var re = /[0-9]{3}, [a-z,A-Z, ,&]*, [0-9] hours/;
    cy.get('.input-course-info > option')
      .eq(1).invoke('text').should('match', re);
      })
      */
})
