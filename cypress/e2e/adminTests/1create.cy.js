var data = require('./data.cy');

const studentTextFields = data.studentTextFields;
const job = data.job;
const studentDropdownFields = data.studentDropdownFields;
const course = data.course;

describe('Upload and create data', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
      cy.session('unique_identifier', () => {
	  cy.visit('/changeUser/admin');
      });
  });

  it('Uploading course info should correctly store data in database', ()=>{
    cy.visit('/course/uploadInfo/false');
    const fileName = '../../data/courseInfo.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('.upload-course-info-input').attachFile({fileContent, fileName, mimeType: 'application/csv'});
    });
    cy.get('.upload-course-info-submit').click();
    cy.visit('/course/create');
    var re = /[0-9]{3}, [a-z,A-Z, ,&]*, [0-9] hours/;
    cy.get('.input-course-info > option')
      .eq(1).invoke('text').should('match', re);
  })

  it('Creating a course should correctly add a course to the database', ()=>{
    cy.visit('/course/create');
    cy.get('select[name=courseInfo] > option')
      .eq(1)
      .then((element) => cy.get('select[name=courseInfo]').select(element.val()));
    cy.get('input[name=univNumber')
      .type(course.univNumber)
      .should('have.value', course.univNumber);
    cy.get('select[name=category]')
      .select(course.category)
      .should('have.value', course.category);
    cy.get('input[name=section]')
      .type(course.section)
      .should('have.value', course.section);
    cy.get('select[name=faculty]')
      .select(course.faculty);
    cy.get('.input-semester')
      .select(course.semester);
    cy.get('.submit-course').click();
    cy.url().should('contain', '/course/edit');
    //section where we check if the information is correctly submitted
    cy.get('input[name=univNumber')
      .should('have.value', course.univNumber);
    cy.get('select[name=category]')
      .should('have.value', course.category);
    cy.get('input[name=section]')
      .should('have.value', course.section);
    cy.get('select[name=faculty]')
      .contains(course.faculty);
    cy.get('.input-semester')
      .contains(course.semester);
  });

  it('Creating a Job with role TA should correctly add a job to the database', ()=>{
    cy.visit('/job/create');
    cy.get('.input-position')
      .select(job.position)
      .should('have.value', job.position);
    cy.get('.input-supervisor')
      .select(job.supervisor);
    // TODO: check if this is necessary (it seems out of place and the field is hidden)
    cy.get('.input-course > option')
      .eq(1)
      .then((element) => cy.get('.input-course').select(element.val()));;
    // TODO: missing semester selection...
    cy.get('.input-description')
      .type(job.description)
      .should('have.value', job.description);
    cy.get('.input-hours')
      .type(job.hours)
      .should('have.value', job.hours);
    cy.get('.submit-job').click();
    cy.url().should('contain', '/job/edit');
    cy.get('.input-position')
      .should('have.value', job.position);
    cy.get('.input-supervisor')
      .invoke('text').should('include', job.supervisor);
    cy.get('.input-description')
      .should('have.value', job.description);
    cy.get('.input-hours')
      .should('have.value', job.hours);
  })

  it('Clicking on create student from /student and creating a student should add a student to the database', ()=>{
    cy.visit('/student/create');

    //fill in text field data to the student create form
    studentTextFields.pid = '567567567'
    studentTextFields.onyen = 'student2'
    studentTextFields.email = 'student2@cs.unc.edu'
    for(var key in studentTextFields){
      cy.get(`#createStudentForm input[name=${key}]`)
        .type(studentTextFields[key])
        .should('have.value', studentTextFields[key]);
    }

    //fill in dropdown data to the student create form
    for(key in studentDropdownFields){
      cy.get(`#createStudentForm select[name=${key}]`)
        .select(studentDropdownFields[key])
        .should('have.value', studentDropdownFields[key]);
    }

    //can't verify value on admin since its value is a database ID, the selector is the
    //actual name of the advisor for readability/usability
    cy.get('#createStudentForm select[name=advisor]')
      .select('admin, admin')
    cy.get('#createStudentForm button[type=submit]')
      .click()
    cy.url().should('include', '/student/edit')

    //on the edit page, verify that all fields we submitted are indeed populated with data
    for(key in studentTextFields){
      if(key == 'csid'){
        cy.contains(`${studentTextFields[key]} (@cs.unc.edu)`)
        continue
      }

      cy.get(`#editStudentForm input[name=${key}]`)
        .should('have.value', studentTextFields[key]);
    }

    for(key in studentDropdownFields){
      cy.get(`#editStudentForm select[name=${key}]`)
        .should('have.value', studentDropdownFields[key]);
    }
    cy.contains('Graduated')
  });
});
