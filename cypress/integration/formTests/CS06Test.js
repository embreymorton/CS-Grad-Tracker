import data from '../../../data/testRoles'
import util from './formUtil'

let student = data.student

let CS06 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  dateEntered: 'feb. 3, 2020',
  dissTitle: 'THE HISTORY OF A JEDI TURNED SITH',
  breadthCourseInfo: ['I', 'AM' ,'YOUR' , 'FATHER', '...', 'NOOOOOOOOOOOOOOO'],
  breadthCourseDate: ['I', 'AM' ,'YOUR' , 'FATHER', '...', 'NOOOOOOOOOOOOOOO'],
  breadthCourseGrade: ['I', 'AM' ,'YOUR' , 'FATHER', '...', 'NOOOOOOOOOOOOOOO'],
  concentrationCourseInfo: ['YOU', 'WERE' , 'MY', 'BROTHER'],
  concentrationCourseDate:  ['YOU', 'WERE' , 'MY', 'BROTHER'],
  concentrationCourseHours: ['6', '9' , '6', '9'],
  otherCourseInfo:  ['III', 'HATTTTEEE' , 'YOUUUUU', 'UUUUUU'],
  otherCourseHours:  ['6', '9' , '6', '9'],
  note: 'I HATTTTE YOUUUUU',
  otherCourses: 'YOU WERE MY BROTHER',
  minor: 'WE WERE SUPPOSED TO DESTROY THE SITH NOT JOIN THEM',
  committee: ['I', 'AM' ,'YOUR' , 'FATHER', '...', 'NOOOOOOOOOOOOOOO'],
  chairSignature: 'AJ',
  chairDateSigned: 'AJJ',
  reasonApproved: 'Your left arm',
  directorSignature: 'LIAAAAR',
  directorDateSigned: 'LIAAAARJ',
}

let CS06Dropdowns = {
  comp915: 'true',
  breadthCourseCategory: ['S', 'A', 'O', 'T', 'T', 'T'],
  backgroundPrepWorkSheet: 'false',
  programProductRequirement: 'false',
  PHDWrittenExam: 'false',
  PHDOralExam: 'true',
  approved: 'Approved',
}

describe('Test CS06 submissions', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS06 form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS06').click()
    util.fillCleanFormAsAdmin(CS06)
    util.selectDropdowns(CS06Dropdowns)
    cy.get('.advisor-buttons .btn').eq(5).click()
    cy.get('.chair-buttons .btn').eq(2).click()
    cy.get('.CS06-submit').click()
    cy.get('[name=advisor]').should('have.value', CS06.committee[5])
    cy.get('[name=chairman]').should('have.value', CS06.committee[2])
    util.checkFormAsAdmin(CS06)
    util.checkDropdowns(CS06Dropdowns)
  })

  it('Submit CS06 form from student side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS06/false')

    cy.get('.advisor-buttons .btn').eq(3).click()
    cy.get('.chair-buttons .btn').eq(3).click()

    delete CS06.chairSignature
    delete CS06.chairDateSigned
    delete CS06.directorSignature
    delete CS06.directorDateSigned
    delete CS06.name
    delete CS06.pid

    util.fillFormAsStudent(CS06)
    cy.get('.CS06-submit').click()
    util.checkFormAsStudent(CS06)
    cy.get('[name=advisor]').should('have.value', CS06.committee[3] + '1')
    cy.get('[name=chairman]').should('have.value', CS06.committee[3] + '1')
  })
})
