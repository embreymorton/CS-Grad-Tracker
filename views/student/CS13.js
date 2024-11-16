const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const input = require("../common/input");
const { row, colMd } = require("../common/grid");
const signatureRow = require("../common/signatureRow");
const approvalCheckboxRow = require("../common/approvalCheckboxRow");
const pseudoInput = require("../common/pseudoInput");
const { signatureDropdown } = require("../common/signatureDropDown");
const cancelEditButton = require("../common/cancelEditButton");
const { checkFormCompletion } = require("../../controllers/util");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const { renderCard } = require("../common/layoutComponents");

const main = (opts) => {
  const { uploadSuccess, isComplete } = opts;
  const title = "CS13";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    mainContent(opts),
    pageScript(opts.cspNonce)
  );
};

const mainContent = (opts) => {
  const { student, hasAccess } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, hr, br, strong } = x;
  return [
    h4(lastName, ", ", firstName),
    h3("Program Product Requirement"),
    h3("CS-13"),
    div(
      { class: "text-left" },
      div(
        "Program Product Definition: A program product is a piece of software that is developed for the use of people other than the developer and that is expected to be used and maintained by other developers after the initial developer is no longer working on it."
      ),
      x("p.underline.text-center")(
        br(),
        strong(
          "Complete only the section that is appropriate for your Program Product Requirement."
        ),
        br(),
        strong(
          "You can expand the section relevant to you by clicking on the title."
        )
      ),
      cs13Form(opts)
    ),
  ];
};

const cs13Form = (opts) => {
  const {
    postMethod,
    student,
    form,
    admin,
    isStudent,
    activeFaculty,
    isComplete,
    VA,
    cspNonce,
    viewer,
  } = opts;
  const editAccess = admin || isStudent;
  const { div, hr, strong, option, span, a, br, button } = x;
  const select = x("select.form-control");
  const vert = x("div.verticalSpace")();
  const range4 = [0, 1, 2, 3];
  const disabledForAdvisors = editAccess ? {} : { disabled: true };
  const disabledForComplete = isComplete && !admin ? { disabled: true } : {};
  return renderCard(
    "CS13 Form",
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      input("hidden", "student", student._id.toString()),
      namePidRow(student),
      hr(),

      input("hidden", "selectedSection", form.selectedSection),
      button(
        { type: "button" },
        {
          id: "comp523col",
          class: "comp523col",
          value: "comp523",
          ...disabledForComplete,
        },
        "Comp 523"
      ),
      div(
        { id: "comp523cont", class: "comp523cont" },
        row(
          colMd(12)(
            "Student has taken COMP 523, or an equivalent software engineering course. Syllabus must be provided."
          )
        ),
        vert,

        div("COMP 523 Instructor Approval"),
        signatureDropdown(
          "comp523Signature",
          form.comp523Signature,
          "comp523DateSigned",
          form.comp523DateSigned,
          activeFaculty,
          cspNonce,
          {
            isRequired: false,
            selectAccess: VA.allow("admin student"),
            checkboxAccess: VA.allow("admin advisor", [
              "fullName",
              form.comp523Signature,
            ]),
            allowOther: false,
          }
        )
      ),
      hr(),
      button(
        { type: "button" },
        {
          id: "indcol",
          class: "indcol",
          value: "industry",
          ...disabledForComplete,
        },
        "Industry Experience"
      ),
      div(
        { id: "indcont", class: "indcont" },
        row(
          colMd(12)(
            "Student has spent at least 3 months in a software development job in an organization with an established development process and participated substantively in the development of a program product."
          )
        ),
        vert,

        row(
          colMd(4)("Company, Development Experience, and Duration"),
          colMd(8)(
            isComplete
              ? pseudoInput(form.jobInfo)
              : x("textarea.form-control")(
                  { name: "jobInfo", rows: 6, ...disabledForAdvisors },
                  form.jobInfo
                )
          )
        ),
        vert,

        div("Advisor Approval:"),
        approvalCheckboxRow(!isStudent, "advisor", opts)
      ),
      hr(),
      button(
        { type: "button" },
        {
          id: "altcol",
          class: "altcol",
          value: "alternative",
          ...disabledForComplete,
        },
        "Alternative"
      ),

      div(
        { id: "altcont", class: "altcont" },
        row(
          colMd(12)(
            "Student has developed a program product, as defined above, and has met the expectations of the client, including product delivery and documentation for both users and other developers. ",
            br(),
            "Note: two signatures are required below."
          )
        ),
        vert,

        row(colMd(12)("Product and Deliverables:")),
        isComplete
          ? pseudoInput(form.product)
          : row(
              colMd(12)(
                x("textarea.form-control")(
                  { name: "product", rows: 6, ...disabledForAdvisors },
                  form.product
                )
              )
            ),
        vert
      ),
      hr(),
      div(
        row(
          colMd(2)("Client:"),
          colMd(4)(
            editAccess && !isComplete
              ? input("text", "client", form.client, true)
              : pseudoInput(form.client)
          ),
          colMd(2)("Position:"),
          colMd(4)(
            editAccess && !isComplete
              ? input("text", "position", form.position, true)
              : pseudoInput(form.position)
          )
        ),
        vert,

        div("Approval #1:"),
        // signatureDropdown(!isStudent, 'alt1', activeFaculty, opts, true), vert,
        signatureDropdown(
          "alt1Signature",
          form.alt1Signature,
          "alt1DateSigned",
          form.alt1DateSigned,
          activeFaculty,
          cspNonce,
          {
            isRequired: false,
            selectAccess: VA.allow("admin student"),
            checkboxAccess: VA.allow("admin advisor", [
              "fullName",
              form.alt1Signature,
            ]),
            allowOther: true,
            viewer,
          }
        ),
        vert,
        // signatureRow(!isStudent, 'alt1', form), vert,

        div("Approval #2:"),
        signatureDropdown(
          "alt2Signature",
          form.alt2Signature,
          "alt2DateSigned",
          form.alt2DateSigned,
          activeFaculty,
          cspNonce,
          {
            isRequired: false,
            selectAccess: VA.allow("admin student"),
            checkboxAccess: VA.allow("admin advisor", [
              "fullName",
              form.alt2Signature,
            ]),
            allowOther: true,
            viewer,
          }
        ),
        vert,

        buttonBarWrapper(
          submitButton(opts),
          isComplete ? null : saveEditButton(postMethod),
          cancelEditButton(isStudent ? null : student._id)
        )
      )
    )
  );
};

const namePidRow = (student) => {
  const { lastName, firstName, pid } = student;
  const name = `${lastName}, ${firstName}`;
  const { div } = x;
  return row(
    colMd(6)(div("Name"), pseudoInput(name)),
    colMd(6)(div("PID"), pseudoInput(pid))
  );
};

const pageScript = (nonce) => {
  const el = x("script")({ type: "text/javascript" });
  // must add text manually to bypass escaping of characters like > and &
  el.innerHTML = pageScriptText();
  // must add 'nonce' attribute manually because of a hyperscript limitation
  el.setAttribute("nonce", nonce);
  return el;
};

// Logic overview:
// When submitting, two conditions must be met.
// (1) Exactly one boolean "section enabled" select must be true.
// (2) All fields within the selected section must be filled out.
// We handle requirement (2) by toggling the required attribute of fields.

const pageScriptText = (form) => `

  let cols = [ // buttons
    document.getElementById("comp523col"),
    document.getElementById("indcol"),
    document.getElementById("altcol")
  ];

  let conts = [ // contents
    document.getElementById("comp523cont"),
    document.getElementById("indcont"),
    document.getElementById("altcont")
  ]

  const comp523Fields = ['comp523Signature', 'comp523DateSigned'].map(name => document.getElementsByName(name)[0]).concat(['comp523SignatureSelect']).map(name => document.getElementById(name)).filter(ele => ele)
  const industryFields = ['jobInfo', 'advisorSignature', 'advisorDateSigned'].map(name => document.getElementsByName(name)[0]).filter(ele => ele)
  const alternativeFields = ['client', 'position', 'product', 'alt1Signature', 'alt1DateSigned', 'alt2Signature', 'alt2DateSigned'].map(name => document.getElementsByName(name)[0]).map(name => document.getElementById(name)).filter(ele => ele).concat(['alt1SignatureSelect', 'alt2SignatureSelect'])

  const updateRequiredValidation = (currentSelected) => {
    switch (currentSelected) {
      case 'comp523':
        comp523Fields.forEach(field => field.required = true)
        industryFields.forEach(field => field.required = false)
        alternativeFields.forEach(field => field.required = false)
      break
      case 'industry':
        comp523Fields.forEach(field => field.required = false)
        industryFields.forEach(field => field.required = true)
        alternativeFields.forEach(field => field.required = false)
      break
      case 'alternative':
        comp523Fields.forEach(field => field.required = false)
        industryFields.forEach(field => field.required = false)
        alternativeFields.forEach(field => field.required = true)
      break
    }
  }

  let selectedSection = document.querySelector('[name="selectedSection"]')

  cols.forEach((button, i) => {
    button.addEventListener("click", function() {
      cols.forEach((button, j) => {
        if (button.id == cols[i].id) {
          button.classList.add("active")
          conts[i].style.display = "block"
          selectedSection.value = button.value
          updateRequiredValidation(button.value)
        } else {
          button.classList.remove("active")
          conts[j].style.display = "none"
        }
      });
    })
  })

  const initialButton = cols.find(button => button.value == selectedSection.value)
  if (initialButton) {
    initialButton.disabled = false
    initialButton.click()
  }
`;

module.exports = main;
