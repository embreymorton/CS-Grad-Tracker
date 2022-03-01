import { student } from '../../../data/testRoles';
import util from './formUtil'

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

let CS13 = {
  jobInfo: 'ssss',
  product: 'WO',
  client: 'Tony',
  position: 'HEAD',
  alt1Signature: 'Aad',
  alt1DateSigned: 'Aae',
  alt2Signature: 'Peep',
  alt2DateSigned: 'Peeq',
}

let CS13Dropdowns = {
  comp523: 'false',
  hadJob: 'false',
  alternative: 'true'
}

describe('Test CS13 submissions', ()=>{
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })
 
  it('Give student student an advisor', () => {
    cy.visit('/changeUser/admin');
    cy.visit('/student');

    cy.get('.edit-student-button').click();

    cy.get('.student-navigation-edit-button').click()
    cy.url().should('contain', '/student/edit');
    cy.get('select[name="advisor"]').select('admin, admin')
    cy.get('.btn-success').click()
  })

  it('Submit CS13 form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS13').click()
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS13)
    util.selectDropdowns(CS13Dropdowns)
    cy.get('.CS13-submit').click()
    util.checkFormAsAdmin(CS13)
  })

  it('Submit CS13 form from student side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS13/false')
    cy.contains(name)
    cy.contains(pid.toString())

    ;[
      'alt1Signature',
      'alt1DateSigned',
      'alt2Signature',
      'alt2DateSigned',
    ].forEach((field) => {
      cy.contains(CS13[field])
      delete CS13[field]
    })

    cy.get(`.CS13-submit`).should('not.exist')
  })
})
