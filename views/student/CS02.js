const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const input = require("../common/input");
const { row, colMd } = require("../common/grid");
const approvalCheckbox = require("../common/approvalCheckboxRow");
const pseudoInput = require("../common/pseudoInput");
const {signatureDropdown} = require("../common/signatureDropDown");
const cancelEditButton = require("../common/cancelEditButton");
const { is } = require("bluebird");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const {script} = require("../common/baseComponents");
let complete = false;


const main = opts => {
  const { uploadSuccess, isComplete, VA, form } = opts;
  complete = isComplete;
  const title = "CS02 Course Waiver";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow("student advisor", ["fullName", form.instructorSignature]) ? mainContent(opts) : "You are not authorized to view this page."
  );
};

const mainContent = opts => {
  const { student, hasAccess, isStudent, seeAllSubmissions } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, strong, hr, a } = x;
  const form = !hasAccess
        ? div("You do not have access")
        : cs02Form(opts);
  return [
    h4(lastName, ", ", firstName),
    h3("Course Waiver"),
    h3("CS-02"),
    a({href: seeAllSubmissions, class: "btn btn-primary"}, "See More Submissions"),
    div(
      { class: "text-left" },
      div("This student is exempt from the breadth requirement listed below."),
      strong("All fields required!"),
      hr(),
      form,
    )
  ];
};

const cs02Form = opts => {
  const { postMethod, student, form, admin, viewer, isStudent, activeFaculty, isComplete, VA, cspNonce } = opts;
  const editAccess = admin || isStudent;
  const frow = formRow(form, editAccess);
  const { courseNumber, basisWaiver } = form;
  const { div, hr } = x;
  const vert = x("div.verticalSpace")();
  const basisForWaiverLabel = [
    div("Basis for Waiver"),
    div("Options: Prior course work, More Advanced Course Here, Other"),
  ];
  return (
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      input("hidden", "student", student._id.toString()),
      namePidDateRow(opts, editAccess), hr(),
      frow(div("Course Number:"), "courseNumber"), vert,
      frow(basisForWaiverLabel, "basisWaiver"), hr(),
      div("Advisor Approval:"),
      approvalCheckbox(VA.allow("advisor"), "advisor", opts),
      vert,
      div("Designated Instructor Approval:"),
      signatureDropdown(
        "instructorSignature",
        form["instructorSignature"],
        "instructorDateSigned",
        form["instructorDateSigned"],
        activeFaculty,
        cspNonce,
        {
          isRequired: false,
          selectAccess: VA.allow("admin student"),
          checkboxAccess: VA.isAdvisor && activeFaculty.every(f => f.fullName != form.instructorSignature) || VA.allow("admin", ["fullName", form.instructorSignature]),
          allowOther: true,
          viewer
        }
      ),
      buttonBarWrapper(
        submitButton(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  );
};

const namePidDateRow = (opts, editAccess) => {
  const { student, form, isComplete } = opts;
  const { lastName, firstName, pid } = student;
  const { dateSubmitted } = form;
  const name = `${lastName}, ${firstName}`;
  const { div } = x;
  const value = editAccess && !isComplete
        ? (type, name, val) => (input(type, name, val, true))
        : (type, name, val) => (pseudoInput(val));
  return (
    row(
      colMd(4)(
        div("Name"),
        pseudoInput(name)
      ),
      colMd(4)(
        div("PID"),
        pseudoInput(pid)
      ),
      colMd(4)(
        div("Date submitted"),
        value("date", "dateSubmitted", dateSubmitted)
      ),
    )
  );
};

const formRow = (values, editAccess) => (label, name) => {
  const value = editAccess && !complete
        ? input("text", name, values[name], true)
        : pseudoInput(values[name]);
  return (
    row(
      colMd(6)(
        label,
        value,
      )
    )
  );
};



module.exports = main;
