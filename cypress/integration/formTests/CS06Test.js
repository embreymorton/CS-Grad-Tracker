import { student } from '../../../data/testRoles';
import util from './formUtil'

const { lastName, firstName, pid } = student
const name = `${lastName}, ${firstName}`

const approvedDate = new Date();
const approvedDateMMDDYYYY = `${approvedDate.getMonth()+1}/${approvedDate.getDate()}/${approvedDate.getFullYear()}`;
const actualApproved = new Date(approvedDateMMDDYYYY);
const yyyyMMDD = approvedDate.toISOString().split('T')[0]

let CS06 = {
  dateEntered: `${yyyyMMDD}`,
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
  chairDateSigned: `${actualApproved}`,
  chairCheckbox: 'on',
  reasonApproved: 'Your left arm',
  directorSignature: 'LIAAAAR',
  directorDateSigned: `${actualApproved}`,
  directorCheckbox: 'on',
}

let CS06Dropdowns = {
  comp915: 'true',
  breadthCourseCategory: ['S', 'A', 'O', 'T', 'T', 'T'],
  breadthCourseGradeModifier: ['+', '-', '', '-', '+'],
  backgroundPrepWorkSheet: 'false',
  programProductRequirement: 'false',
  PHDWrittenExam: 'false',
  PHDOralExam: 'true',
  approved: '',
}

describe('Test CS06 submissions', () => {
  before(() => {
    cy.request('/util/resetDatabaseToSnapshot')
  })

  beforeEach(() => {
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

  it('Submit CS06 form from administrator side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/changeUser/admin')
    util.visitFormAsAdmin()
    cy.get('.CS06').click()
    cy.contains(name)
    cy.contains(pid.toString())
    util.fillCleanFormAsAdmin(CS06)
    util.selectDropdowns(CS06Dropdowns)
    cy.get('.advisor-buttons .btn').eq(5).click()
    cy.get('.chair-buttons .btn').eq(2).click()
    cy.get('.CS06-submit').click()
    cy.get('[name=advisor]').should('have.value', CS06.committee[5])
    cy.get('[name=chairman]').should('have.value', CS06.committee[2])

    delete CS06.chairSignature
    delete CS06.chairDateSigned
    delete CS06.chairCheckbox
    delete CS06.directorSignature
    delete CS06.directorDateSigned
    delete CS06.directorCheckbox

    util.checkFormAsAdmin(CS06)
    util.checkDropdowns(CS06Dropdowns)
  })

  it('Submit CS06 form from student side', ()=>{
    cy.visit('/changeUser/student')
    cy.visit('/studentView/forms/CS06/false')
    cy.contains(name)
    cy.contains(pid.toString())

    cy.get('.advisor-buttons .btn').eq(3).click()
    cy.get('.chair-buttons .btn').eq(3).click()

    delete CS06.chairSignature
    delete CS06.chairDateSigned
    delete CS06.chairCheckbox
    delete CS06.directorSignature
    delete CS06.directorDateSigned
    delete CS06.directorCheckbox
    delete CS06.reasonApproved

    util.fillFormAsStudent(CS06)
    cy.get('.CS06-submit').click()
    util.checkFormAsStudent(CS06)
    cy.get('[name=advisor]').should('have.value', CS06.committee[3])
    cy.get('[name=chairman]').should('have.value', CS06.committee[3])
  })
})
