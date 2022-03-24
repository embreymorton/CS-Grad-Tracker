const nodemailer = require('nodemailer');

const testAccount = {user: "retta.doyle50@ethereal.email", pass: "J7PWfjJ4FewKyAQhRj"}

const _ = {}
_._transporter = null

/**
 * Manually (re)start transporter. 
 * @param {Boolean} forceProduction forces using the Gmail transporter in process.env.gmailUser or process.env.gmail
 */
_.startTransporter = (forceProduction = false) => {
  _._transporter = process.env.mode == 'production' || forceProduction 
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
   * @param {Object} req Express.js request information
   * @returns preformatted email object
   */
_.generateApprovalEmail = (to, subjectTitle, studentInfo, req) => {
  return { 
    from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>', 
    to,
    subject: `[UNC-CS] ${subjectTitle} Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${req.params.title}`,
    text: `Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:\n
        ${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false\n\nIf you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.\n\nFor questions about this app, contact Jeff Terrell <terrell@cs.unc.edu>.`,
    html: `
      <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:</p>
      <a href="${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false">${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false</a>
      <p>If you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.</p>
      <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
    `
  }
}

_.generateSupervisorEmail = (to, studentInfo, req) => {
  return {
    from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
    to: 'kenny@cs.unc.edu',
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} ${req.params.title} form submission`,
    text: `Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree.`,
    html: `
      <p>Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title}. Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName}, go here:</p>
      <a href="${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false">${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false</a>
      <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
    `
  }
}

_.generateDeveloperEmail = (text) => {
  return {
    from: '"CS-GradTracking" <noreply@cs.unc.edu>',
    to: "terrell@cs.unc.edu, kekevi@live.unc.edu",
    subject: `CS-GradTracking Site is ${text}`,
    text: `${new Date()}: ${text}`
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
