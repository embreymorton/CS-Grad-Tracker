const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const oldInput = require("../common/input");
const { row, colMd } = require("../common/grid");
const signatureRow = require("../common/signatureRow");
const pseudoInput = require("../common/pseudoInput");
const approvalCheckboxRow = require("../common/approvalCheckboxRow");
const cancelEditButton = require("../common/cancelEditButton");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const { checkbox, input, textarea, dropdown, makeOption, dateInput } = require("../common/baseComponents");


const main = opts => {
  const { uploadSuccess, VA } = opts;
  const title = "CS04 Outside Review Option";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow("student advisor") ? mainContent(opts) : "You are not authorized to view this page."
  );
};

const mainContent = opts => {
  const { student, hasAccess } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, strong, hr } = x;
  const form = !hasAccess
    ? div("You do not have access")
    : cs04Form(opts);
  return [
    h4(lastName, ", ", firstName),
    h3("Outside Review Option"),
    h3("CS-04"),
    div(
      { class: "text-left" },
      form,
    )
  ];
};

const cs04Form = opts => {
  const { postMethod, student, form, admin, isStudent, isComplete, cspNonce, VA } = opts;
  const editAccess = admin || isStudent;
  const { courseNumber, basisWaiver } = form;
  const { div, hr, strong, option, b } = x;
  const select = x("select.form-control");
  const vert = x("div.verticalSpace")();
  const disabled = editAccess && !isComplete ? {} : { disabled: true };
  const approvedGSCText = "Approved by Graduate Studies Committee";
  const disapprovedGSCText = "Disapproved";
  const { dateEntered } = form;

  return [
    div("This student has successfully written a paper as a thesis substitute in partial fulfillment of the requirements for the degree of Master of Science in Computer Science."),

    div("In order to complete this review, the student is to upload it to the Carolina Digital Repository.  Even if the paper is available in the public domain, it must be uploaded to the Carolina Digital Repository in order to assure that it will remain available to the department."),

    div("Instructions for uploading:"),

    div("1. Go to Carolina Digital Repository (cdr.lib.unc.edu) and login with your onyen."),
    div("2. Select Student Papers"),
    div("3. Select Master's Papers and then “Create Work”"),
    div("4. Select “Department of Computer Science”"),
    div("5. Fill in the “Work Deposit Form.” You do not need an ORCID. Check the deposit agreement and save."),
    div("6. Submit the URL on this form."),

    div("The Student Services Manager will be notified when you have completed the upload."),

    div("In addition, the student is required to give a copy of all external reviews to their adviser."),
    strong("All fields required!"),
    hr(),
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      oldInput("hidden", "student", student._id.toString()),
      namePidRow(student), hr(),

      row(
        colMd(6)(
          div(strong("Name of project:")),
          textarea(
            "projectDescription",
            form.projectDescription,
            { isRequired: true, isDisabled: disabled.disabled, rows: 1 })
        ),
      ),
      row(
        colMd(6)(
          div(strong("Publication: (journal or conference)")),
          textarea(
            "publication",
            form.publication,
            { isRequired: true, isDisabled: disabled.disabled, rows: 1 })
        ),
      ),
      row(
        colMd(6)(
          div(strong("Author(s)")),
          textarea(
            "authors",
            form.authors,
            { isRequired: true, isDisabled: disabled.disabled, rows: 1 })
        ),
      ),
      row(
        colMd(4)(
          div(strong("Publication Date")),
          dateInput(
            "publicationDate",
            form.publicationDate,
            {
              isDisabled: VA.not("admin student"),
              isRequired: VA.hasLevel("student"),
            })
        ),
      ),
      row(colMd(6)(
        div(strong("Link to Paper")),
        input(
          "attachmentURL",
          form.attachmentURL,
          {
            isDisabled: isComplete || VA.not("admin student"),
            isRequired: false,
            placeholder: "URL starting with https://",
            attrs: { pattern: "^($)|(https?:\\/\\/.*)" }
          }),
      )),
      hr(),

      row(
        colMd(6)(
          div("Is the documentation proprietary?"),
          dropdown(
            "docProprietary",
            [
              makeOption(false, "No. The documentation is attached.", !form.docProprietary),
              makeOption(true, "Yes. A non-disclosure agreement is attached.", form.docProprietary)
            ],
            { isDisabled: disabled.disabled, blankOption: "None selected." }
          )
        ),
      ),
      hr(),

      div({ class: "text-center" }, b("(Below is to be completed by the advisor.)")),
      hr(),

      row(
        colMd(12)(
          div("The majority of the publication was completed by the student:"),
          checkbox(
            "majorityCompleted",
            form.majorityCompleted,
            cspNonce,
            {
              isDisabled: isStudent,
              isRequired: false,
            }
          )
        )
      ),
      hr(),

      row(
        colMd(12)(
          div("The student has revised the externally reviewed publication such that it also satisfies the Comprehensive Writing requirement (e.g., extending the related work section to be broad and detailed):"),
          checkbox(
            "satisfiesComprehensiveWriting",
            form.satisfiesComprehensiveWriting,
            cspNonce,
            {
              isDisabled: isStudent,
              isRequired: false,
            }
          )
        )
      ),
      hr(),

      row(
        colMd(12)(
          div("The student has provided me with copies of external reviews."),
          checkbox(
            "providedCopiesExternalReviews",
            form.providedCopiesExternalReviews,
            cspNonce,
            {
              isDisabled: isStudent,
              isRequired: false,
            }
          )
        )
      ),
      hr(),

      div("Advisor Approval:"),
      approvalCheckboxRow(!isStudent, "advisor", opts),
      hr(),
      buttonBarWrapper(
        submitButton(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      ),
    )
  ];
};

const namePidRow = student => {
  const { lastName, firstName, pid } = student;
  const name = `${lastName}, ${firstName}`;
  const { div } = x;
  return (
    row(
      colMd(6)(
        div("Name"),
        pseudoInput(name),
      ),
      colMd(6)(
        div("PID"),
        pseudoInput(pid),
      )
    )
  );
};

module.exports = main;
