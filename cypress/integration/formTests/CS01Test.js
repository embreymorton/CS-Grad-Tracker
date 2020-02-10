import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS01 = {
    covered283: "A",
    date283: "1/1/1",
    covered410: "B",
    date410: "B",
    covered411: "C",
    date411: "C",
    covered455: "D",
    date455: "D",
    covered521: "E",
    date521: "E",
    covered520: "F",
    date520: "F",
    covered530: "G",
    date530: "G",
    covered524: "H",
    date524: "H",
    covered541: "I",
    date541: "I",
    covered550: "J",
    date550: "J",
    covered233: "K",
    date233: "K",
    covered381: "L",
    date381: "L",
    covered547: "M",
    date547: "M",
    covered661: "N",
    date661: "N",
    covered435: "O",
    date435: "O",
    "student-signature": student.lastName,
    "student-signature-date": "BRUH",
    "advisor-signature": data.admin.lastName,
    "advisor-signature-date": "YO yoyo"
}

describe('Test CS01 submissions', ()=>{

    beforeEach(function () {
        Cypress.Cookies.preserveOnce('connect.sid')
    })
    
    it('Submit CS01 form from administrator side', ()=>{
        

        cy.visit('/changeUser/student');
        cy.visit('/changeUser/admin');
        
        util.visitFormAsAdmin();

        cy.get('.CS01').click();

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())

        for(let key in CS01){
            cy.get('.' + key).clear().type(CS01[key]);
        }
        
        cy.get('.CS01-submit').click();

        for(let key in CS01){
            cy.get('.' + key).should('have.value', CS01[key]);
        }

    })

    it('Submit CS01 form from student side, check to make sure values from admin submission are there', ()=>{
        cy.visit('/changeUser/student')
        cy.visit('/studentView')
        cy.get('.student-forms').click();

        cy.get('.CS01').click();

        cy.get('.student-name').should('have.value', student.lastName + ", " + student.firstName)
        cy.get('.student-pid').should('have.value', student.pid.toString())


        for(let key in CS01){
            if(key != "advisor-signature" && key != "advisor-signature-date")
            cy.get('.' + key).should('have.value', CS01[key]).clear().type(CS01[key]);
        }

        cy.get('.CS01-submit').click();

        for(let key in CS01){
            if(key != "advisor-signature" && key != "advisor-signature-date")
            cy.get('.' + key).should('have.value', CS01[key]);
        }

        cy.contains(CS01["advisor-signature"])
        cy.contains(CS01["advisor-signature-date"])
    });

})