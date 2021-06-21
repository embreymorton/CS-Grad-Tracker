import data from '../../../data/testRoles';
import util from './formUtil';

let student = data.student;

let CS09 = {
  name: student.lastName + ', ' + student.firstName,
  pid: student.pid.toString(),
  prpTitle : 'I ate two socks',
  researchAdvisor : 'WITNESS!',
  authors: 'IMMORTAN JOE',
  paperNotifyDate: 'MAD MAXXXX',
  researchResponsible: 'So metaphorical',
  present: 'Oh, I see you have a plan son',
  advisorSignature: '*While hugging rock* I will make things right Dad',
  advisorDateSigned: "You've crossed the line!",
  committeeSignature: ['Omae', 'Wa', 'Mou', 'Shindeiru'],
  committeeDateSigned: ['NANI?????', '*Intense high pitched noise*', '*Explosion*', 'ARRRRRRGHHHH'],
  presentationDate: '*Weird whispy ghost* Who.... are you?',
  feedback: "This is Alterra HQ. This may be our only communications window. We can't send a rescue ship all the way out there so Aurora, you're just going to have to meet us halfway. *Offmic* We're doing a sandwich run, are you in?"
}

let CS09Dropdowns = {
  peerReviewed: 'Yes',
  paperAccepted: 'Yes',
  reviewsAvailable: 'No',
}

let CS09Sliders = {
  conceptIntegration: 1,
  creativity: 1,
  clarity: 3,
  abstractionFormality: -2,
  organization: 2,
  writing: .5,
  presentation: .25,
  answeringQuestion: -.5,
}

describe('Test CS09 submissions', ()=>{
  beforeEach(function () {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

  it('Submit CS09 form from administrator side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/changeUser/admin');
    util.visitFormAsAdmin();
    cy.get('.CS09').click();
    util.fillCleanFormAsAdmin(CS09);

    Object.entries(CS09Sliders).forEach(([key, value]) => {
      cy.get(`.cs-form [name=${key}]`)
        .invoke('val', value)
        .trigger('input', {force: true})
    })

    util.selectDropdowns(CS09Dropdowns);
    cy.get('.CS09-submit').click();
    util.checkFormAsAdmin(CS09);
  })

  it('Submit CS09 form from student side', ()=>{
    cy.visit('/changeUser/student');
    cy.visit('/studentView/forms/CS09/false');

    let deletions = ['advisorSignature', 'advisorDateSigned', 'presentationDate', 'feedback'];
    delete CS09.name;
    delete CS09.pid;
    for(let i = 0; i < deletions.length; i++){
      cy.contains(CS09[deletions[i]]);
      delete CS09[deletions[i]];
    }

    for(let i = 0; i < CS09.committeeSignature.length; i++){
      cy.contains(CS09.committeeSignature[i])
      cy.contains(CS09.committeeDateSigned[i]);
    }
    delete CS09.committeeDateSigned;
    delete CS09.committeeSignature;

    util.fillFormAsStudent(CS09);
    cy.get('.CS09-submit').click();
    util.checkFormAsStudent(CS09);
  });
})
