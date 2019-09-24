function visitStudentPage(){
    cy.visit('http://localhost:8080');

    //should be a new url (routes to /student because user is an admin)
    cy.url().should('include', '/student');
}

function visitPage(link){
    cy.visit('http://localhost:8080'+link);
    cy.url().should('include', link);
}

const currentDate = "2019-09-19";
const pastDate = "2019-02-02";

const studentTextFields = {
    onyen : 'fakeonyen',
    csid : 'fakecsid',
    email : 'fakeEmail@fake.com',
    'first-name' : 'fake',
    'last-name' : 'fake',
    pid : '949949949',
    'alternative-name': 'fake',
    'entering-status': 'help',
    'research-area': 'Systems',
    'leave-extension': 'NO',
    'hours-completed': '20',
    'background-approved': currentDate,
    'masters-awarded': pastDate,
    'prp-passed': currentDate,
    'background-prep-worksheet-approved': currentDate,
    'program-of-study-approved': currentDate,
    'research-planning-meeting': currentDate,
    'committee-comp-approved': currentDate,
    'phd-proposal-approved': currentDate,
    'phd-awarded': pastDate,
    'oral-exam-passed': currentDate,
    'dissertation-defence-passed': currentDate,
    'oral-exam-passed': currentDate,
    'dissertation-submitted': currentDate,
}

const studentDropdownFields = {
    pronouns: 'she, her',
    status: 'Active',
    gender: 'FEMALE',
    ethnicity: 'OTHER',
    residency: 'YES',
    'intended-degree': 'MASTERS',
    'funding-eligibility': 'GUARANTEED',
}

describe("Visits the page", function(){
    it('Visiting the homepage as admin should route to /student', function(){
        
        visitStudentPage();
        
    });

    it('Clicking on links in sidebar should route to correct pages', function(){
        
        visitStudentPage();

        const sidebarButtons = {
            '.report-button': '/report',
            '.course-button': '/course',
            '.faculty-button': '/faculty',
            '.job-button': '/job',
            '.student-button': '/student'
        }

        for(var key in sidebarButtons){
            cy.get(key).click();
            cy.url().should('contain', sidebarButtons[key]);
        }
    });

    it('Clicking page specific sidebar links should route to correct pages', function(){
        
        visitStudentPage();

        visitPage('/course');

        cy.get('.create-course-button').click();
        cy.url().should('contain', '/course/create');

        cy.get('.upload-course-button').click();
        cy.url().should('contain', '/course/upload');

        cy.get('.upload-course-info-button').click();
        cy.url().should('contain', '/course/uploadInfo');


        visitPage('/faculty');

        cy.get('.create-faculty-button').click();
        cy.url().should('contain', '/faculty/create');

        cy.get('.upload-faculty-button').click();
        cy.url().should('contain', '/faculty/upload');

        
        visitPage('/job');

        cy.get('.create-job-button').click();
        cy.url().should('contain', '/job/create');

        cy.get('.upload-job-button').click();
        cy.url().should('contain', '/job/upload');

        cy.get('.upload-grant-button').click();
        cy.url().should('contain', '/job/uploadGrant');


        visitPage('/student')

        cy.get('.create-student-button').click();
        cy.url().should('contain', '/student/create');

        cy.get('.upload-student-button').click();
        cy.url().should('contain', '/student/upload');

        cy.get('.upload-courses-button').click();
        cy.url().should('contain', '/student/uploadCourses');
    });

    it('Uploading course info should correctly store data in database', function(){

        visitPage('/course/uploadInfo/false');

        const fileName = '../../data/courseInfo.csv'
        cy.fixture(fileName).then(fileContent => {
            cy.get('.upload-course-info-input').upload({fileContent, fileName, mimeType: 'application/csv'});
        });

        cy.get('.upload-course-info-submit').click();

        visitPage('/course/create');
        
        var re = /[0-9]{3}, [a-z,A-Z, ,&]*, [0-9] hours/;
        cy.get('.input-course-info > option')
        .eq(1).invoke('text').should('match', re);
    })

    it('Creating a course should correctly add a course to the database', ()=>{
        visitPage('/course/create');

        const course = {
            univNumber: '1234',
            category: 'Theory',
            topic: 'N/A',
            section: '1',
            faculty: 'admin, admin',
            semester: 'FA 2018'
        }

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
    })

    it('Creating a Job with role RA should correctly add a job to the database', ()=>{

    })

    it('Searching for a course should return the single course and you should be able to delete it', ()=>{

    })

    it('Clicking on create student from /student and creating a student should add a student to the database', function(){

        visitPage('/student/create');

        //fill in text field data to the student create form
        for(var key in studentTextFields){
            cy.get('.input-'+key)
            .type(studentTextFields[key])
            .should('have.value', studentTextFields[key]);
        }
        
        //fill in dropdown data to the student create form
        for(var key in studentDropdownFields){
            cy.get('.input-'+key)
            .select(studentDropdownFields[key])
            .should('have.value', studentDropdownFields[key]);
        }
        
        //can't verify value on admin since its value is a database ID, the selector is the 
        //actual name of the advisor for readability/usability
        cy.get('.input-advisor')
        .select('admin, admin');

        cy.get('.create-student-submit').click();

        cy.url().should('include', '/student/edit');

        //on the edit page, verify that all fields we submitted are indeed populated with data
        for(var key in studentTextFields){
            cy.get('.input-'+key)
            .should('have.value', studentTextFields[key]);
        }
        for(var key in studentDropdownFields){
            cy.get('.input-'+key)
            .should('have.value', studentDropdownFields[key]);
        }
    });

    it('Should correctly upload courseInfo to courseInfo model in database', function(){

        cy.visit('http://localhost:8080/course');

    });



    it('Searching for and clicking the trash button on /student should delete the student from the database', function(){
        visitStudentPage();

        cy.get('.search-last-name')
        .type(studentTextFields["last-name"])
        .should('have.value', studentTextFields["last-name"])

        cy.get('.search-pid')
        .type(studentTextFields.pid)
        .should('have.value', studentTextFields.pid)

        cy.get('.search-student-submit').click();

        //select first value of table to make sure it is the student we searched for
        cy.get('tbody > tr > td').eq(0).contains(studentTextFields.onyen);

        cy.get('.delete-student-submit').click();
    });
})