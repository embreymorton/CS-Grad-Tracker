import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS02 = {
    "date-submitted" : "Feb.2, 2020",
    "course-number": "COMP 560",
    "basis-waiver" : "Taken",
    "advisor-signature": data.admin.lastName,
    "advisor-date-signed": "YO yoyo",
    "instructor-signature": "jeffe",
    "instructor-date-signed": "time"
}

describe('Test CS02 submissions', ()=>{

    beforeEach(function () {
        Cypress.Cookies.preserveOnce('connect.sid')
    })
    
    it('Submit CS02 form from administrator side', ()=>{
        

        cy.visit('/changeUser/student');
        cy.visit('/changeUser/admin');
        
        util.visitFormAsAdmin();

        cy.get('.CS02').click();

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())

        
        for(let key in CS02){
            cy.get('.' + key).clear().type(CS02[key]);
        }
        
        cy.get('.CS02-submit').click();

        for(let key in CS02){
            cy.get('.' + key).should('have.value', CS02[key]);
        }
    })

    it('Submit CS02 form from student side', ()=>{
        cy.visit('/changeUser/student');
        cy.visit('/studentView/forms/CS02/false')

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())

        for(let key in CS02){
            if(key != "advisor-signature" && key != "advisor-date-signed" && key != "instructor-signature" && key != "instructor-date-signed"){
                cy.get('.' + key).should('have.value', CS02[key]).clear().type(CS02[key] + "A");
            }
        }

        cy.get('.CS02-submit').click();

        for(let key in CS02){
            if(key != "advisor-signature" && key != "advisor-date-signed" && key != "instructor-signature" && key != "instructor-date-signed"){
                cy.get('.' + key).should('have.value', CS02[key] + "A");
            }
        }

        cy.contains(CS02["advisor-signature"]);
        cy.contains(CS02["advisor-date-signed"]);
        cy.contains(CS02["instructor-signature"]);
        cy.contains(CS02["instructor-date-signed"]);
    });

})


