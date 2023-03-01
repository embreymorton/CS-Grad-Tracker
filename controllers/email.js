const nodemailer = require('nodemailer')
const htmlToText = require('nodemailer-html-to-text').htmlToText

const _ = {}
_._transporter = null

_.testAccount = {user: "norris.ziemann@ethereal.email", pass: "v3tzrfwAcFM9Dzg4nq"}

_.managerInfo = {
  name: "Kris Jordan",
  email: "kris@cs.unc.edu"
}

_.default = {
  from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
}

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
      user: _.testAccount.user,
      pass: _.testAccount.pass
    }
  })
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
    subject: `[UNC-CS] ${subjectTitle} Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${formName}`,
    html: `
      <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName} as part of the requirements for their graduate degree. Your approval is needed for the following section(s): <b>${subjectTitle}</b>. To view their submission, go here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
      <p>If you do not approve, please work with your student on what needs to be done to correct the form, have them resubmit, and then approve it when you are satisfied.</p>
      <p>For questions about this app, contact ${_.managerInfo.name} &lt;${_.managerInfo.email}&gt;.</p>
    `
  }
}

_.generateSupervisorEmail = (studentInfo, formName, linkToForm) => {
  return {
    from: _.default.from,
    to: 'kenney@cs.unc.edu',
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} ${formName} form submission`,
    html: `
      <p>Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${formName}. Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName}.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
      <p>For questions about this app, contact ${_.managerInfo.name} &lt;${_.managerInfo.email}&gt;.</p>
    `
  }
}

_.generatePhdAdvisorEmail = (studentInfo, advisorInfo, linkToForm, isApproved, reason) => {
  if(isApproved == "Approved") {  return{
    from: _.default.from,
    to: `${advisorInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} PhD Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form CS06 (Ph.D. Program of Study). Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName} has approved their PhD Program of Study.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
  else {
    return{
    from: _.default.from,
    to: `${advisorInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} PhD Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>Student ${studentInfo.firstName} ${studentInfo.lastName} submitted form CS06 (Ph.D. Program of Study). Their advisor is ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName} has disapproved their PhD Program of Study because of ${reason}.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
}
_.generatePhdStudentEmail = (studentInfo, advisorInfo, linkToForm, isApproved, reason) => {
  if(isApproved == "Approved") {  return{
    from: _.default.from,
    to: `${studentInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} PhD Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>Your advisor ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName} has approved your PhD Program of Study.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
  else {
    return{
    from: _.default.from,
    to: `${studentInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} PhD Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>Your advisor ${studentInfo.advisor.firstName} ${studentInfo.advisor.lastName} has disapproved your PhD Program of Study because of ${reason}.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
}

_.generatemsStudentEmail = (studentInfo, advisorInfo, linkToForm, isApproved, reason) => {
  if(isApproved) {  return{
    from: _.default.from,
    to: `${studentInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>The Graduate Studies Committee has approved your M.S. Program of Study.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
  else {
    return{
    from: _.default.from,
    to: `${studentInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study APPROVAL PROCESS Update `,
    html: `
    <p>The Graduate Studies Committee has disapproved your M.S. Program of Study because of ${reason}.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
}

_.generatemsAdvisorEmail = (studentInfo, advisorInfo, linkToForm, isApproved, reason) => {
  if(isApproved) {  return{
    from: _.default.from,
    to: `${advisorInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study APPROVAL PROCESS Update `,
    html: `
      <p>The Graduate Studies Committee has approved  ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
  else {
    return{
    from: _.default.from,
    to: `${advisorInfo.email}`,
    subject: `[UNC-CS] ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study APPROVAL PROCESS Update `,
    html: `
    <p>The Graduate Studies Committee has disapproved  ${studentInfo.firstName} ${studentInfo.lastName} M.S. Program of Study because of ${reason}.</p>
      <p>View the form here:</p>
      <a href="${linkToForm}">${linkToForm}</a>
    `
    }}
}

const developerEmails = "kris@cs.unc.edu, pozefsky@cs.unc.edu, kekevi@live.unc.edu, abz@email.unc.edu, lamaab@email.unc.edu"
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
