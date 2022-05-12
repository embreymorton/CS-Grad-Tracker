const nodemailer = require('nodemailer');

const testAccount = {user: "retta.doyle50@ethereal.email", pass: "J7PWfjJ4FewKyAQhRj"}

const _ = {}
_._transporter = null

/**
 * Manually (re)start transporter. 
 * @param {Boolean} forceProduction forces using the Gmail transporter in process.env.gmailUser or process.env.gmail
 */
_.startTransporter = (forceProduction = false) => {
  _._transporter = (process.env.mode == 'production' || forceProduction) // && false // uncomment to force nodemailer
  ? nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.gmailUser,
      pass: process.env.gmailPass
    }
  })
  : nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })
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
    from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
    to,
    subject: `[UNC-CS] ${subjectTitle} Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${formName}`,
    text: `Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:\n
        ${linkToForm}\n\nIf you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.\n\nFor questions about this app, contact Jeff Terrell <terrell@cs.unc.edu>.`,
    html: `
      <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
      <p>If you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.</p>
      <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
    `
  }
}

_.generateSupervisorEmail = (studentInfo, formName, linkToForm) => {
  return {
    from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
    to: 'kenney@cs.unc.edu',
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} ${formName} form submission`,
    text: `Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName} as part of the requirements for their graduate degree.\n\n
    Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName}.\n\ngo here: `,
    html: `
      <p>Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName}. Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName}, go here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
      <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
    `
  }
}

const developerEmails = "terrell@cs.unc.edu, kekevi@live.unc.edu, elaine13@email.unc.edu, zkhan@unc.edu"
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

transporter = _.startTransporter()
module.exports = _
