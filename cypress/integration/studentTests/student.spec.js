describe('Test student routes and functionality', ()=>{
    it('When logged in as student, get taken to studentView page', ()=>{
        cy.visit('/changeUser/student')

        cy.visit('/')
        cy.url().should('include','/studentView')
    })

    var updateStudent = {
        "first-name":"NEWNAME",
        "last-name":"NEWLAST",
        "alternative-name":"ALT NAME",
        "gender":"MALE",
        "ethnicity":"ASIAN",
        "residency": "APPLIED"
    }

    it('Able to update some basic info on the student page', ()=>{
        cy.get('.input-first-name')
        .type(updateStudent["first-name"])

        cy.get('.input-last-name')
        .type(updateStudent["last-name"])

        cy.get('.input-alt-name')
        .type(updateStudent["alternative-name"])

        cy.get('.select-gender')
        .select(updateStudent.gender)

        cy.get('.select-ethnicity')
        .select(updateStudent.ethnicity)

        cy.get('.select-residency')
        .select(updateStudent.residency)

        cy.get('.update-button-submit').click()

        for(var key in updateStudent){
            console.log(updateStudent[key])
            cy.get('.student-table').contains(updateStudent[key])
        }

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
        router.post("/post", job.post);
    })

    
    //include form tests and other tests as issues come up
})