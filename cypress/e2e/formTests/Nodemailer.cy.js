
describe('Checking Email Receival', ()=>{
  before(() => {
    console.log("testing, testing.")
    cy.request('/etherealEmail').then(res => {
      cy.wrap(res.body.user).as('user')
      cy.wrap(res.body.pass).as('pass')
    })
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  // we assume that the previous tests have sent some emails
  it('Logging into Ethereal to check', function () {

    cy.visit('https://ethereal.email/login')
    cy.get('#address').type(this.user)
    cy.get('#password').type(this.pass)
    cy.get('.btn').first().click()
    cy.visit('https://ethereal.email/messages')
    cy.get('a[href^="/messages/"]').first().click()
    const now = new Date()
    cy.get('.datestring').first().invoke('attr', 'title').then(title => {
      const mailDate = new Date(title);
      if (Math.abs(now.getTime() - mailDate.getTime()) <= 60*2*1000) {
        cy.contains('Today');
      } else {
        cy.contains('This is cy.fail()');
      }
    })
  })

})


