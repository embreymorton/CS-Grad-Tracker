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

const job = {
    position: "TA",
    supervisor: "admin, admin",
    description: "A TA JOB",
    hours: "4",
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

const course = {
    univNumber: '1234',
    category: 'Theory',
    topic: 'N/A',
    section: '1',
    faculty: 'admin, admin',
    semester: 'FA 2018'
}

describe("Upload and create data", function(){

    it('Uploading course info should correctly store data in database', function(){

        cy.visit('/course/uploadInfo/false');

        const fileName = '../../data/courseInfo.csv'
        cy.fixture(fileName).then(fileContent => {
            cy.get('.upload-course-info-input').upload({fileContent, fileName, mimeType: 'application/csv'});
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

        cy.get('.input-course > option')
        .eq(1)
        .then((element) => cy.get('.input-course').select(element.val()));;
        
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


    it('Clicking on create student from /student and creating a student should add a student to the database', function(){

        cy.visit('/student/create');

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



});

describe("Delete data", function(){

    it('Searching for a job should return the single job and you should be able to delete it', ()=>{
        cy.visit('/job');

        searchJobHelper();

        cy.get('.job-table').find('tr').should('have.length', 2);

        //first column is position, check if it contains the expected value
        cy.get('tbody > tr > td').eq(0).contains(job.position);

        console.log(cy.get('tbody > tr > td').eq(1).invoke('text'));
        cy.get('tbody > tr > td').eq(1).contains(job.supervisor);

        cy.get('tbody > tr > td').eq(4).contains(job.hours);

        cy.get('.delete-job-button').click();

        searchJobHelper();

        cy.contains('No jobs found.');
    })

    function searchJobHelper(){
        cy.get('input[name=position]')
        .type(job.position);

        cy.get('select[name=supervisor]')
        .select(job.supervisor);

        cy.get('.search-job-submit').click();
    }

    it('Searching for a course should return the single course and you should be able to delete it', ()=>{
        cy.visit('/course');

        /*
        Right now, I can't think of a good solution for getting the name/course number
        to search for the course that was created earlier, because that data 
        was uploaded in a separate csv and is not defined in this file. 
        */
        searchCourseHelper();

        cy.get('.course-table').find('tr').should('have.length', 2);

        cy.get('tbody > tr > td').eq(0).contains('101');

        cy.get('tbody > tr > td').eq(3).contains('Fluency in Information Technology');

        cy.get('.delete-course-button').click();

        searchCourseHelper();

        cy.contains('No courses found.');
    })

    function searchCourseHelper(){
        cy.get('input[name=number]')
        .type('101')

        cy.get('input[name=name]')
        .type('Fluency in Information Technology')

        cy.get('.search-course-button').click();
    }

    it('Searching for a student should return the single student and you should be able to delete it', function(){
        cy.visit('/student');

        searchStudentHelper();

        cy.get('.student-table').find('tr').should('have.length', 2);

        //select first value of table to make sure it is the student we searched for
        cy.get('tbody > tr > td').eq(0).contains(studentTextFields.onyen);

        cy.get('.delete-student-submit').click();

        searchStudentHelper();

        cy.contains('No student found.');
    });

    function searchStudentHelper(){
        cy.get('.search-last-name')
        .type(studentTextFields["last-name"])
        .should('have.value', studentTextFields["last-name"])

        cy.get('.search-pid')
        .type(studentTextFields.pid)
        .should('have.value', studentTextFields.pid)

        cy.get('.search-student-submit').click();
    }
})