function visitStudentPage(){
    cy.visit('http://localhost:8080');

    //should be a new url (routes to /student because user is an admin)
    cy.url().should('include', '/student');
}

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
        
    })

    it('Click on create student from /student and creating a student should add a student to the database', function(){

        visitStudentPage();

        cy.get('.create-student').click();
        
        cy.url().should('include', '/student/create');

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