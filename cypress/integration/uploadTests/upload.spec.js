var data = require('./data.js')

describe("Upload data", ()=>{
    const filePath = '../../data/InOrderUploadTests/'

    it('Uploading Admin should correctly store data in database', ()=>{

        cy.visit('/changeUser/admin')

        cy.visit('/faculty/upload/false')

        const fileName = filePath + '1facultyUpload.csv'
        cy.fixture(fileName).then(fileContent => {
            cy.get('.upload-faculty-input').upload({fileContent, fileName, mimeType: 'application/csv'})
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
            cy.get('.student-upload-input').upload({fileContent, fileName, mimeType: 'application/csv'})
        });

        cy.get('.student-upload-submit-button').click()

        cy.visit('/student')

        cy.contains(data.uploadStudent.firstName)
        cy.contains(data.uploadStudent.pid)
        cy.contains(data.uploadStudent.status)
        cy.get('.edit-student-button').click()
        cy.get('.input-background-approved').should('have.value', data.uploadStudent.backgroundApproved)
        cy.contains(data.uploadStudent.gender)
        cy.contains(data.uploadStudent.intendedDegree)
        cy.contains(data.uploadStudent.pronouns)
        cy.contains(data.uploadStudent.residency)
        cy.contains(data.uploadStudent.semesterStarted)
        cy.contains(data.uploadStudent.advisor)
    })

    it('Uploading course should correctly store data in database', ()=>{
        cy.visit('/course/upload/false')
        
        const fileName = filePath + '3courseUpload.csv'
        cy.fixture(fileName).then(fileContent => {
            cy.get('.course-upload-input').upload({fileContent, fileName, mimeType: 'application/csv'})
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

    it('Uploading a grant xlsx/csv should correctly store data in the database', ()=>{
        
    })

})