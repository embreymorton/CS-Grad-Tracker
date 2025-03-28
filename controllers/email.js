const nodemailer = require('nodemailer')
const htmlToText = require('nodemailer-html-to-text').htmlToText

/**  
# email module:

## Sending:
1. use one of the `generate-` functions to construct an email's html/text and its recipients
2. use `send` to actually send the email

## Account Information:
* testing emails are saved below under the field `testAccount`, new accounts can be generated at https://ethereal.email
* actual emails are sent using the login credentials under the `.env.{development/production}` file
    - we currently use gmail app passwords for credentials but in these are rate limited: https://support.google.com/a/answer/166852?hl=en
    - 1500 multi-send emails per day
* if these rates aren't good enough, potentially switch to Amazon SES 
*/
const _ = {}
_._transporter = null

_.testAccount = {user: "", pass: ""}

_.managerInfo = {
  name: "CS Help",
  email: "help@cs.unc.edu"
}

_.studentServicesManager = {
  name: 'Denise Kenney',
  email: 'kenney@cs.unc.edu'
}

_.default = {
  from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
}

/**
 * Manually (re)start transporter. 
 * @param {Boolean} forceProduction forces using the Gmail transporter in process.env.gmailUser or process.env.gmail
 */
_.startTransporter = async (forceProduction = false) => {
  if (process.env.mode == 'production' || forceProduction) {
    _._transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.gmailUser,
        pass: process.env.gmailPass
    }})
  } else {
    _.testAccount = await nodemailer.createTestAccount()
    _._transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: _.testAccount.user,
        pass: _.testAccount.pass
      }
    })
  }

  _._transporter.use('compile', htmlToText({
    wordwrap: false,
    hideLinkHrefIfSameAsText: true
  }))
}

/**
 * Manually closes nodemailer transporter. May be useful if pooling is implemented.
 */
_.closeTransporter = () => {
  _._transporter.close()
}

/**
   * Creates a preformatted email body and header ready to be used by nodemailer.
   * @param {String} to list of email addresses separated by ", " 
   * @param {String} subjectTitle what type of approval person is needed, eg. 'Advisor', Instructor, Primary Reader, etc.
   * @param {Object} studentInfo information about the student
   * @param {String} formName 
   * @param {String} linkToForm 
   * @returns preformatted email object
   */
_.generateApprovalEmail = (to, subjectTitle, studentInfo, formName, linkToForm) => {
  return {
    from: _.default.from,
    to,
    subject: `[UNC-CS] ${subjectTitle} Approval needed: ${studentInfo.fullName} - ${formName}`,
    html: `
      <p>Your student ${studentInfo.fullName} submitted form ${formName} as part of the requirements for their graduate degree. Your approval is needed for the following section(s): <b>${subjectTitle}</b>. To view their submission, go here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
      <p>If you do not approve, please work with your student on what needs to be done to correct the form, have them resubmit, and then approve it when you are satisfied.</p>
      <p>For questions about this app, contact ${_.managerInfo.name} &lt;${_.managerInfo.email}&gt;.</p>
    `
  }
}

_.generateStudentServicesEmail = (studentInfo, formName, linkToForm, submitter = 'student') => {
  if (submitter == 'student') {
    return {
      from: _.default.from,
      to: _.studentServicesManager.email,
      subject: `[UNC-CS] ${studentInfo.fullName} ${formName} form submission`,
      html: `
        <p>Student ${studentInfo.fullName} submitted form ${formName}. Their advisor is ${studentInfo.advisor.fullName}.</p>
        <p>View the form here:</p>
        <a href="${linkToForm}">${linkToForm}</a>
        <p>For questions about this app, contact ${_.managerInfo.name} &lt;${_.managerInfo.email}&gt;.</p>
      `
    }
  } else {
    return {
      from: _.default.from,
      to: _.studentServicesManager.email, 
      subject: `[UNC-CS] Advisor ${studentInfo.advisor.fullName} submitted ${formName} for ${studentInfo.fullName}`,
      html: `
        <p>Advisor ${studentInfo.advisor.fullName} submitted ${formName} for ${studentInfo.fullName}.</p>
        <p>View the form here:</p>
        <a href="${linkToForm}">${linkToForm}</a>
        <p>For questions about this app, contact ${_.managerInfo.name} &lt;${_.managerInfo.email}&gt;.</p>
      `
    }
  }
}

_.generateGraduateStudiesEmail = (formName, student, advisor, linkToForm, approved, reason) => {
  const formDescriptions = {
    CS03: `CS03 M.S. Program of Study`,
    CS04: `CS04 Outside Review Option`,
    CS06: `CS06 Ph.D. Program of Study`
  }
  return {
    from: _.default.from,
    to: `${advisor.email}, ${student.email}`,
    cc: `${_.studentServicesManager.email}`,
    subject: `[UNC-CS] ${student.fullName} ${formDescriptions[formName]} GSC Approval Update`,
    html: `
      <p>The Graduate Student Committee has examined student ${student.fullName}'s submission of ${formDescriptions[formName]} and has <b>${approved ? 'APPROVED' : 'NOT APPROVED'}</b>.</p>
      ${approved ? '' : `<p>The reason for the non-approval is as follows: ${reason}</p>`}
      <p>View the form here: <a href=${linkToForm}>${linkToForm}</a></p>
    `
  }
}

const developerEmails = "kris@cs.unc.edu, pozefsky@cs.unc.edu, abz@email.unc.edu, lamaab@email.unc.edu, elaine13@email.unc.edu"
_.generateDeveloperEmail = (subjectText, bodyText, to = developerEmails) => {
  return {
    from: '"CS-GradTracking" <noreply@cs.unc.edu>',
    to,
    subject: `CS-GradTracking Site: ${subjectText}`,
    text: `${new Date()}: ${bodyText}`
  }
}

/**
* Given an argument list of formatted/generated email objects, sends all emails parallel-ly. 
* @param  {...GeneratedEmail} toSend 
* @returns true if all emails sent, false if any failed
*/
_.send = async (...toSend) => {
  
 const email = async (email) => {
   const response = await _._transporter.sendMail(email).catch(console.error)
   if (!response) {
     return false
   } else {
     console.log(`Emailed: ${response.accepted} | failed to send: ${response.rejected} | preview at: ${nodemailer.getTestMessageUrl(response)}`)
     return true
   }
   
 }

 const result = await Promise.all(toSend.map(letter => email(letter)))
 return result.every(res => res === true)
}

const transporter = _.startTransporter()
module.exports = _
