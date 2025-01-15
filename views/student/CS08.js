const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const input = require("../common/input");
const { row, colMd } = require("../common/grid");
const pseudoInput = require("../common/pseudoInput");
const cancelEditButton = require("../common/cancelEditButton");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const pseudoCheckbox = require("../common/pseudoCheckbox");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const { dateInput, input: bcInput } = require("../common/baseComponents");
const {facultyDropdown} = require("../common/facultyDropdown");

const main = opts => {
  const { uploadSuccess, VA, form } = opts;
  const title = "CS08 M.S. Technical Writing Requirement";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow("admin advisor student", ["fullName", form.primarySignature], ["fullName", form.secondarySignature]) ? mainContent(opts) : "You are not authorized to view this page.",
  );
};

const mainContent = opts => {
  const { student, hasAccess } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, hr, p } = x;
  return [
    h4(lastName, ", ", firstName),
    h3("M.S. Technical Writing Requirement"),
    h3("CS-08"),
    x("strong.verticalSpace")("All fields required!"),
    hr(),
    div(
      { class: "text-left" },
      cs08Form(opts),
    )
  ];
};

const cs08Form = opts => {
  const { postMethod, student, form, admin, isStudent, activeFaculty, isComplete, VA } = opts;
  const editAccess = admin || isStudent;
  const { div, hr, strong, option, span, a, p, ul, ol, li } = x;
  const vert = x("div.verticalSpace")();
  const range4 = [0, 1, 2, 3];
  const range6 = [0, 1, 2, 3, 4, 5];
  const buttonAttrs = {
    type: "button",
    "aria-pressed": "false",
    autocomplete: "off",
  };
  const disabled = editAccess ? {} : { disabled: true };

  return (
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      input("hidden", "student", student._id.toString()),
      namePidRow(student),
      hr(),

      strong("Title of Paper:"),
      isComplete ? pseudoInput(form.title) : colMd(4)(
        x("textarea.form-control")(
          { rows: 6, name: "title", required: true, ...disabled },
          form.title
        )
      ),
      hr(),

      strong("Agreement to Review"),
      div("The final draft to the primary reader must be delivered 4 weeks before the last day of classes of the semester in which the student plans to graduate.  We recommend that you work with the primary reader throughout the semester, first creating an outline, and then iterating over several drafts."),

      readerDateRow(opts, editAccess, "primary"),
      vert,
      div("The final draft to the secondary reader must be delivered 2 weeks before the last day of classes of the semester in which the student plans to graduate."),
      readerDateRow(opts, editAccess, "secondary"), hr(),

      p("Once the paper has been approved by both readers, the student is to upload it to the Carolina Digital Repository. Instructions for uploading:"),
      ol(
        li("Go to Carolina Digital Repository (cdr.lib.unc.edu) and login with your onyen."),
        li("Select Student Papers"),
        li("Select Master's Papers and then “Create Work”"),
        li("Select “Department of Computer Science”"),
        li("Fill in the “Work Deposit Form.” You do not need an ORCID. Check the deposit agreement and save."),
        li("Submit the URL on this form.")
      ),
      p("The Student Services Manager will be notified when you have completed the upload."),
      div("Attachment Link"),
      bcInput(
        "attachmentURL", 
        form.attachmentURL,
        {
          isDisabled: isComplete || VA.not("admin"),
          isRequired: false,
          placeholder: "URL starting with https://",
          attrs: {pattern: "^($)|(https?:\\/\\/.*)"}
        }),
      hr(),

      strong("Approval"),
      div("We have judged this paper in both substance and presentation to satisfy the writing requirement for the M.S. in Computer Science."),
      div("Primary Reader Approval"),
      approvalRow(opts, "primary"),

      div("Secondary Reader Approval"),
      approvalRow(opts, "secondary"),

      buttonBarWrapper(
        submitButton(opts),
        pageSubmitScript(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  );
};

function pageSubmitScript(opts) {
  const script = x("script")({type: "text/javascript"});
  const javascript = `
  let onLoad = () => {
    const inputChangeCheck = () => {
      const primaryField = document.getElementsByName("primaryReader")[0]
      const secondaryField = document.getElementsByName("secondaryReader")[0]
      const primaryLabel = document.getElementById("primary-pseudo")
      const secondaryLabel = document.getElementById("secondary-pseudo")
      var primarySigField = document.getElementById("primarySignature")
      var secondarySigField = document.getElementById("secondarySignature")
      primarySigField.value = primaryField.value
      secondarySigField.value = secondaryField.value
      primaryLabel.innerText = primaryField.value
      secondaryLabel.innerText = secondaryField.value
      return true
    }
    document.getElementById("select-primaryReader").addEventListener('change', inputChangeCheck)
    document.getElementById("select-secondaryReader").addEventListener('change', inputChangeCheck)
  }
  document.addEventListener('DOMContentLoaded', onLoad)
  `;
  script.innerHTML = javascript;
  script.setAttribute("nonce", opts.cspNonce);
  return script;
}

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

const readerDateRow = (opts, editAccess, modifier) => {
  const { form, isComplete, isStudent, activeFaculty, VA } = opts;
  const readerField = `${modifier}Reader`;
  const dateField = `${modifier}Date`;
  const readerValue = form[readerField];
  const dateValue = form[dateField];
  const { div } = x;
  const modifierLabel = modifier.toUpperCase()[0] + modifier.substr(1);
  return (
    row(
      isComplete ?
      colMd(6)(
        div(`${modifierLabel} Reader`),
        pseudoInput(readerValue)
      ) :
      colMd(6)(
        div(`${modifierLabel} Reader`),
        facultyDropdown(
          readerField,
          readerValue,
          activeFaculty,
          {
            isDisabled: isComplete || VA.not("admin student"),
            isRequired: true
          }
        )
      ),
      colMd(6)(
        div("Date Draft Received"),
        dateInput(dateField, dateValue, {
          isDisabled: VA.not("admin", ["fullName" , readerValue]),
          isRequired: false
        }
      ),
    )
  ));
};

const approvalRow = (opts, modifier) => {
  const { form, isStudent, VA } = opts;
  const vert = x("div.verticalSpace")();
  const readerField = `${modifier}Reader`;
  const readerName = form[readerField];
  const dateField = `${modifier}DateSigned`;
  const dateSigned = new Date(form[dateField]);
  const dateSignedMMDDYYYY = `${dateSigned.getMonth()+1}/${dateSigned.getDate()}/${dateSigned.getFullYear()}`;
  const isApproved = !isNaN(dateSigned);
  const sigField = `${modifier}Signature`;
  const approvalLabel = isApproved ? 
  `(${readerName} approved on ${dateSignedMMDDYYYY}.)` :
  "(Not yet approved.)";
  return [
    row(
      colMd(6)(
        pseudoInput(readerName, `#${modifier}-pseudo`)
      ),
    ),
    vert,
    row(
      !isStudent ?
      colMd(6)(
        x(`input#${dateField}Checkbox.pseudo-checkbox`)({type: "checkbox", checked: isApproved ? "checked" : undefined, disabled: VA.not("admin", ["fullName", readerName]) || undefined}),
        x(`input#${dateField}`)({type: "hidden", name: dateField, value: isApproved ? dateSigned.toString() : undefined}),
        x(`input#${sigField}`)({type: "hidden", name: sigField, value: form[sigField] ? form[sigField] : ""}),
        pageScript(opts, { dateField, readerName, })
      ) :
      colMd(6)(
        pseudoCheckbox(isApproved),
        x(`input#${sigField}`)({type: "hidden", name: sigField, value: form[sigField] ? form[sigField] : ""}),
      ),
    ),
    row(
      colMd(5)(
        x(`em#${dateField}Label`)(approvalLabel),
      )
    )
  ];

};

function pageScript(opts, initialState) { 
  const { dateField, readerName } = initialState;
  const el = x("script")({type: "text/javascript"});

  el.innerHTML =
  `
    onLoad = () => {
      const label = document.getElementById('${dateField}Label');
      const checkbox = document.getElementById('${dateField}Checkbox');
      // const approvalData = document.getElementById('${dateField}');
      const dateData = document.getElementById('${dateField}');
      const changeHandler = () => {
        if (checkbox.checked) {
          const now = new Date();
          label.innerText = "(${readerName} approved as of " + (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear() + ".)";
          // approvalData.setAttribute("value", true);
          dateData.setAttribute("value", now.toString());
        } else {
          label.innerText = "(${readerName} has not yet approved.)";
          // approvalData.setAttribute("value", false);
          dateData.removeAttribute("value");
        }
      }

      checkbox.addEventListener('change', changeHandler);
    }

    document.addEventListener('DOMContentLoaded', onLoad);
  `;
  el.setAttribute("nonce", opts.cspNonce);
  return el;
}

module.exports = main;