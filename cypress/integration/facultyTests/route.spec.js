
describe('Test the routes that a faculty should/should not be able to access', ()=>{

    it('Make sure faculty can not access job, course, and student create routes', ()=>{
        cy.visit('/student/create');
        cy.contains('Not admin');

        cy.visit('/course');
        cy.contains('Not admin');

        cy.visit('/course/create');
        cy.contains('Not admin');

        cy.visit('/job');
        cy.contains('Not admin');

        cy.visit('/job/create');
        cy.contains('Not admin');
    })

})