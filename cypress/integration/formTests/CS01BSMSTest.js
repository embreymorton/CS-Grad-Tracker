import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS01BSMS = {
    covered521: 'A',
    date521: 'A',
    covered520: 'B',
    date520: 'B',
    covered530: 'C',
    date530: 'C',
    covered524: 'D',
    date524: 'D',
    covered541: 'E',
    date541: 'E',
    covered661: 'G',
    date661: 'G',
    "student-signed": student.lastName,
    "student-signed-date": 'asd',
    "advisor-signed": data.admin.lastName,
    "advisor-signed-date": 'casc'
}

describe('Test CS01MSBS submissions', ()=>{

    beforeEach(function () {
        Cypress.Cookies.preserveOnce('connect.sid')
    })
    
    it('Submit CS01MSBS form from administrator side', ()=>{

        cy.visit('/changeUser/student')
        cy.visit('/changeUser/admin');
        cy.visit('/student');

        util.visitFormAsAdmin();

        cy.get('.CS01BSMS').click();

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())

        for(let key in CS01BSMS){
            cy.get('.' + key).clear().type(CS01BSMS[key]);
        }

        cy.get('.CS01BSMS-submit').click();

        for(let key in CS01BSMS){
            cy.get('.' + key).should('have.value', CS01BSMS[key]);
        }
    });

    it('Submit CS01BSMS form from student side', ()=>{
        cy.visit('/changeUser/student');
        cy.visit('/studentView/forms/CS01BSMS/false')

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())

        for(let key in CS01BSMS){
            if(key != "advisor-signed" && key != "advisor-signed-date"){
                cy.get('.' + key).should('have.value', CS01BSMS[key]).clear().type(CS01BSMS[key] + "A");
            }
        }

        cy.get('.CS01BSMS-submit').click();

        for(let key in CS01BSMS){
            if(key != "advisor-signed" && key != "advisor-signed-date"){
                cy.get('.' + key).should('have.value', CS01BSMS[key] + "A");
            }
        }

        cy.contains(CS01BSMS["advisor-signed"]);
        cy.contains(CS01BSMS["advisor-signed-date"]);
    });

})