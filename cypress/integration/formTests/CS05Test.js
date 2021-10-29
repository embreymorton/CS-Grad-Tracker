import { student } from '../../../data/testRoles';
import util from './formUtil'

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

let CS05 = {
  nominees: ['asdas', 'ASDF' ,'asdjkn' , 'skda', 'sjakdl'],
  nomineeDepartments: ['asdas', 'ASDF' ,'asdjkn' , 'skda', 'sjakdl'],
  nomineeStatuses: ['asdas', 'ASDF' ,'asdjkn' , 'skda', 'sjakdl'],
  directorSignature: 'ASDF',
  directorDateSigned: 'ASSDF'
}

let CS05Dropdowns = {
  oralComprehensiveExam: 'false',
  thesis: 'false'
}

describe('Test CS05 submissions', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS05 form from administrator side', () => {
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS05').click()
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS05)
    util.selectDropdowns(CS05Dropdowns)
    cy.get('.advisor-buttons .row:nth-child(1) .btn').click()
    cy.get('.chair-buttons .row:nth-child(3) .btn').click()
    cy.get('.CS05-submit').click()
    cy.get('[name=thesisadvisor]').should('have.value', CS05.nominees[0])
    cy.get('[name=committeeChairman]').should('have.value', CS05.nominees[2])
    util.checkFormAsAdmin(CS05)
    util.checkDropdowns(CS05Dropdowns)
  })

  it('Submit CS05 form from student side', () => {
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS05/false')

    cy.contains(name)
    cy.contains(pid.toString())
    cy.contains(CS05.directorSignature)
    cy.contains(CS05.directorDateSigned)

    delete CS05.directorSignature
    delete CS05.directorDateSigned
    delete CS05.nomineeStatuses

    util.fillFormAsStudent(CS05)
    cy.get('.advisor-buttons .btn').eq(1).click()
    cy.get('.chair-buttons .btn').eq(3).click()
    cy.get('.CS05-submit').click()
    util.checkFormAsStudent(CS05)
    cy.get('[name=thesisadvisor]').should('have.value', CS05.nominees[1])
    cy.get('[name=committeeChairman]').should('have.value', CS05.nominees[3])
  })
})
