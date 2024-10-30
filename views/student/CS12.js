const x = require('hyperaxe');
const page = require('../page');
const uploadFeedback = require('../common/uploadFeedback');
const studentBar = require('../common/studentBar');
const input = require('../common/input');
const { row, colMd } = require('../common/grid');
const signatureRow = require('../common/signatureRow');
const pseudoInput = require('../common/pseudoInput');
const cancelEditButton = require('../common/cancelEditButton');
const buttonBarWrapper = require('../common/buttonBarWrapper');
const submitButton = require('../common/submitButton');
const saveEditButton = require('../common/saveEditsButton');
const baseComponents = require('../common/baseComponents');
const { dateInput } = baseComponents;
const { h3, p, strong, div, hr } = require('hyperaxe');
const approvalCheckboxRow = require('../common/approvalCheckboxRow')

const main = (opts) => {
  const { uploadSuccess, formName, VA } = opts;
  const title = `${formName} - Report of Research Discussion`;
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow('student advisor') ? mainContent(opts) : 'Error: You are not authorized to view this page.',
    pageScript(opts)
  );
};

const mainContent = (opts) => {
  const { student, hasAccess, formName } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, p, strong, hr } = x;
  const form = !hasAccess ? div('You do not have access') : cs12Form(opts);

  return [
    h4(`${lastName}, ${firstName}`),
    h3('Report of Research Discussion'),
    h3(formName),
    div(
      { class: 'text-left' },
      x('p.underline')('Instructions:'),
      p('Please complete this form to record your research discussion with three or more potential doctoral committee members. Ensure each member signs below.'),
      hr(),
      form,
    )
  ];
};

const cs12Form = (opts) => {
    const { postMethod, student, form, isStudent, admin, isComplete, cspNonce } = opts;
    const { _id, lastName, firstName, pid, email } = student;
    const { hr, div, p, label, input } = x;
  
    return (
      x('form.cs-form#cs-form')(
        { action: postMethod, method: 'post' },
        namePidRow({ lastName, firstName, pid, email }), hr(),
        p('Date of Research Discussion:'),
        dateInput('discussionDate', form.discussionDate, { isRequired: true, placeholder: 'YYYY-MM-DD' }),
        hr(),
        p(strong('Committee Members Signatures:')),
  
        // Fields for each committee member’s typed name and signature
        ...Array.from({ length: 6 }, (_, i) => [
          p(`Committee Member ${i + 1} Signature:`),
          input('text', `committeeMember${i + 1}Name`, form[`committeeMember${i + 1}Name`] || '', { placeholder: 'Type Name Here' }),
          hr()
        ]),
  
        p('Student Approval:'),
        signatureRow(admin || isStudent, 'student', form, opts.cspNonce, {isRequired: isStudent}),
        x('.verticalSpace')(),
  
        p('Advisor Approval:'),
        approvalCheckboxRow(!isStudent, 'advisor', opts),
  
        hr(),
  
        p(strong('Notes:')),
        div(
          { class: 'text-center' },
          'Target Deadline: Semester 5'
        ),
        div(
            { class: 'text-center' },
            'Final Deadline: Semester 6'
          ),
        hr(),

        buttonBarWrapper(
          submitButton(opts),
          isComplete ? null : saveEditButton(postMethod),
          cancelEditButton(isStudent ? null : student._id)
        )
      )
    );
  };
  
  

const namePidRow = ({ lastName, firstName, pid, email }) => {
  const { div } = x;
  const name = `${lastName}, ${firstName}`;
  return row(
    colMd(6)(
      div('Name'),
      pseudoInput(name)
    ),
    colMd(6)(
      div('PID'),
      pseudoInput(pid)
    ),
    colMd(6)(
      div('Email'),
      pseudoInput(email)
    )
  );
};

const pageScript = (opts) => {
  const script = x('script')({ type: 'text/javascript' });
  const javascript = `
    document.addEventListener('DOMContentLoaded', () => {
      // Add any client-side JavaScript if needed
    });
  `;
  script.innerHTML = javascript;
  script.setAttribute('nonce', opts.cspNonce);
  return script;
};

module.exports = main;