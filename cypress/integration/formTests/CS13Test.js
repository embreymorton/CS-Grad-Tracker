import data from '../../../data/testRoles'
import util from './formUtil'

let student = data.student

let CS13 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  comp523Signature : 'asdas',
  comp523DateSigned: 'dddd',
  jobInfo: 'ssss',
  advisorSignature: 'NAme',
  advisorDateSigned: 'asdasd',
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

  it('Submit CS13 form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS13').click()
    util.fillCleanFormAsAdmin(CS13)
    util.selectDropdowns(CS13Dropdowns)
    cy.get('.CS13-submit').click()
    util.checkFormAsAdmin(CS13)
  })

  it('Submit CS13 form from student side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS13/false')

    cy.get('[name=name]').should('have.value', CS13.name)
    cy.get('[name=pid]').should('have.value', CS13.pid)
    delete CS13.name
    delete CS13.pid

    ;[
      'comp523Signature',
      'comp523DateSigned',
      'advisorSignature',
      'advisorDateSigned',
      'alt1Signature',
      'alt1DateSigned',
      'alt2Signature',
      'alt2DateSigned',
    ].forEach((field) => {
      cy.contains(CS13[field])
      delete CS13[field]
    })

    util.fillFormAsStudent(CS13)
    cy.get('.CS13-submit').click()
    util.checkFormAsStudent(CS13)
  })
})
