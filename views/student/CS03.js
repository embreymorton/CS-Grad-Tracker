const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const input = require("../common/input");
const { row, colMd } = require("../common/grid");
const signatureRow = require("../common/signatureRow");
const approvalCheckboxRow = require("../common/approvalCheckboxRow");
const pseudoInput = require("../common/pseudoInput");
const cancelEditButton = require("../common/cancelEditButton");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const {
  semesterDatalist,
  semesterInput,
} = require("../common/semesterDropdown");
const adminApprovalCheckboxRow = require("../common/adminApprovalCheckboxRow");
const { gradeDropdown } = require("../common/gradesDropdown");
const { script, dropdown, makeOption } = require("../common/baseComponents");
const { renderCard } = require("../common/layoutComponents");

const main = (opts) => {
  const { uploadSuccess, VA } = opts;
  const title = "CS03 M.S. Program of Study";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow("student advisor")
      ? mainContent(opts)
      : "You are not authorized to view this page."
  );
};

const mainContent = (opts) => {
  const { student, hasAccess } = opts;
  const { lastName, firstName } = student;
  const { h4, h3, div, strong, hr } = x;
  const form = !hasAccess ? div("You do not have access") : cs03Form(opts);
  return [
    h4(lastName, ", ", firstName),
    h3("M.S. Program of Study"),
    h3("CS-03"),
    div({ class: "text-left" }, hr(), form),
  ];
};

const cs03Form = (opts) => {
  const {
    postMethod,
    student,
    form,
    admin,
    isStudent,
    isComplete,
    semesters,
    viewer,
  } = opts;
  const editAccess = admin || isStudent;
  const { courseNumber, basisWaiver } = form;
  const { div, hr, strong, option, a, p, span } = x;
  const select = x("select.form-control");
  const approvedGSCText = "Approved by Graduate Studies Committee";
  const disapprovedGSCText = "Not Approved";
  const vert = x("div.verticalSpace")();
  const basisForWaiverLabel = [
    div("Basis for Waiver"),
    div("Options: Prior course work, More Advanced Course Here, Other"),
  ];
  const range = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const range6 = [0];
  const disabled = editAccess && !isComplete ? {} : { disabled: true };

  const distRow = (label, form, i, { editAccess, isComplete }) => {
    return [
      row(colMd(12)(x("div")(label))),
      row(
        colMd(1)(
          div("University"),
          editAccess && !isComplete
            ? input("text", "university", form.university && form.university[i])
            : pseudoInput(form.university && form.university[i])
        ),
        colMd(1)(
          div("Dept"),
          editAccess && !isComplete
            ? input("text", "dept", form.dept && form.dept[i])
            : pseudoInput(form.dept && form.dept[i])
        ),
        colMd(2)(
          div("Course Number"),
          editAccess && !isComplete
            ? input("text", "course", form.course && form.course[i])
            : pseudoInput(form.course && form.course[i])
        ),
        colMd(1)(
          div("Hours"),
          editAccess && !isComplete
            ? input("number", "hours", form.hours && form.hours[i])
            : pseudoInput(form.hours && form.hours[i])
        ),
        colMd(2)(
          div("Semester"),
          semesterInput("semester", form.semester && form.semester[i], {
            isDisabled: !editAccess || isComplete,
            isRequired: false,
            isSS_YYYY: false,
            placeholder: "SS YYYY",
          })
        ),
        colMd(3)(
          div("Brief Title"),
          editAccess && !isComplete
            ? input("text", "title", form.title && form.title[i])
            : pseudoInput(form.title && form.title[i])
        ),
        colMd(2)(
          div("Grade*"),
          range6.map((i) =>
            gradeDropdown(
              "grade",
              form.grade && form.grade[i],
              !editAccess || isComplete,
              { placeholder: "None selected." }
            )
          )
        )
      ),
      hr,
    ];
  };

  return renderCard(
    "CS03 Form",
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      input("hidden", "student", student._id.toString()),
      namePidRow(student),
      hr(),
      semesterDatalist(8),

      div(
        "Instructions:  This form details an individual program of study for the MS Degree.  It should be filed with the Student Services Manager when the program is substantially planned ",
        strong("(typically after two semesters)"),
        ", and can be amended subsequently. Forms mentioned in this program of study can be filed separately and at a later date."
      ),
      strong("All fields except Reason of Disapproval required!"),
      vert,

      strong("I. Course Requirement"),
      div(
        "Thirty (30) semester hours of courses numbered 400 or higher must be taken (excluding COMP 495, 496, 691H, 692H). Of these 30 hours, at least 18 hours must be in Computer Science (designated COMP in the catalog) numbered 400-890, and the remaining 12 hours must include COMP 993: Master's Thesis Research or COMP 992: MS Non-Thesis Option."
      ),
      div(
        "Residence credit- minimum number of required semesters of UNC-Chapel Hill registration, 9 or more credit hours earn a full semester of residence, 6 to 8.9 credit hours earn three-fourths semester of residence, 3 to 5.9 credit hours earn one-half semester of residence. 0 to 2.9 credit hours earn one-fourth semester of residence.",
        a(
          { href: "https://handbook.unc.edu/residencecredit.html" },
          " Residence Credit"
        )
      ),
      div(
        "The student’s mastery of content will be determined by the course grade in the set of three courses: a P- or better must be obtained in each course, and a Calingaert score of -3 or higher must be obtained on the three courses combined.",
        a(
          { href: "https://cs.unc.edu/academics/graduate/ms-requirements/" },
          " MS-Requirements "
        ),
        "An administrator will add the modifiers."
      ),
      div(
        "Transfer of credit- Up to 6 semester hours of graduate credit may be transferred from another accredited institution, or from courses taken at UNC-CH before admission to the Graduate School.",
        a(
          { href: "https://gradschool.unc.edu/pdf/wtrnform.pdf " },
          " Please submit this form along with the CS-03."
        )
      ),
      div(
        "Minimum 3 hours of COMP 992 or COMP 993 (formal thesis) - maximum of 6 hours."
      ),
      div(
        "If a minor is elected, see the ",
        a(
          { href: "http://handbook.unc.edu/preface.html" },
          "Graduate School Handbook"
        ),
        "."
      ),
      div(
        "List the courses you expect to use to meet the MS requirements.  Include Section Number for COMP 790 and COMP 990-993 courses.  Do NOT list research team meeting seminars."
      ),
      hr(),
      distRow("Applications:", form, 0, { editAccess, isComplete }),
      distRow("Systems & Hardware:", form, 1, { editAccess, isComplete }),
      distRow("Theory & Formal Thinking:", form, 2, { editAccess, isComplete }),
      row(
        colMd(1)(
          div("University"),
          range.map((i) =>
            editAccess && !isComplete
              ? input(
                  "text",
                  "university",
                  form.university && form.university[i]
                )
              : pseudoInput(form.university && form.university[i])
          )
        ),
        colMd(1)(
          div("Dept"),
          range.map((i) =>
            editAccess && !isComplete
              ? input("text", "dept", form.dept && form.dept[i])
              : pseudoInput(form.dept && form.dept[i])
          )
        ),
        colMd(2)(
          div("Course"),
          range.map((i) =>
            editAccess && !isComplete
              ? input("text", "course", form.course && form.course[i])
              : pseudoInput(form.course && form.course[i])
          )
        ),
        colMd(1)(
          div("Hours"),
          range.map((i) =>
            editAccess && !isComplete
              ? input("number", "hours", form.hours && form.hours[i])
              : pseudoInput(form.hours && form.hours[i])
          )
        ),
        colMd(2)(
          div("Semester"),
          range.map((i) =>
            semesterInput("semester", form.semester && form.semester[i], {
              isDisabled: !editAccess || isComplete,
              isRequired: false,
              isSS_YYYY: false,
              placeholder: "SS YYYY",
            })
          )
        ),
        colMd(3)(
          div("Brief Title"),
          range.map((i) =>
            editAccess && !isComplete
              ? input("text", "title", form.title && form.title[i])
              : pseudoInput(form.title && form.title[i])
          )
        )
      ),
      hr(),

      strong("II. Additional Requirements"),
      vert,
      div("A. Background Preparation"),
      row(
        colMd(3)(
          select(
            { name: "backgroundPrep", required: "true", ...disabled },
            option({ value: "" }, ""),
            option(
              { value: "false", selected: !form.backgroundPrep || null },
              "Did not file CS01"
            ),
            option(
              { value: "true", selected: form.backgroundPrep || null },
              "Filed CS01"
            )
          )
        ),
        colMd(2)("File Form CS-01")
      ),

      vert,
      div("B. Program Product"),
      row(
        colMd(3)(
          select(
            { name: "programProduct", required: "true", ...disabled },
            option({ value: "" }, ""),
            option(
              { value: "false", selected: !form.programProduct || null },
              "Did not file CS13"
            ),
            option(
              { value: "true", selected: form.programProduct || null },
              "Filed CS13"
            )
          )
        ),
        colMd(2)(div("File Form CS-13"))
      ),

      vert,
      div("C. Writing Requirement"),
      row(
        colMd(3)(
          select(
            { name: "writingRequirement", required: "true", ...disabled },
            option({ value: "none" }, "Did not complete."),
            option(
              {
                value: "cs04",
                selected: form.writingRequirement === "cs04" || null,
              },
              "Outside Review (CS-04)"
            ),
            option(
              {
                value: "cs05",
                selected: form.writingRequirement === "cs05" || null,
              },
              "Thesis (CS-05)"
            ),
            option(
              {
                value: "cs08",
                selected: form.writingRequirement === "cs09" || null,
              },
              "Comprehensive Paper (CS-08)"
            )
          )
        )
      ),
      hr(),

      strong("III. Comprehensive Exam"),
      row(
        colMd(3)(
          select(
            { name: "comprehensiveExam", required: "true", ...disabled },
            option({ value: "" }, ""),
            option(
              {
                value: "Comprehensive Paper",
                selected:
                  form.comprehensiveExam == "Comprehensive Paper" || null,
              },
              "Comprehensive Paper (CS-08)"
            ),
            option(
              {
                value: "MS Oral Comprehensive Exam",
                selected:
                  form.comprehensiveExam == "MS Oral Comprehensive Exam" ||
                  null,
              },
              "MS Oral Comprehensive Exam"
            )
          )
        )
      ),
      hr(),

      strong("IV. Approvals"),
      div("Student Approval:"),
      signatureRow(admin || isStudent, "student", form, opts.cspNonce),
      vert,
      div("Advisor Approval:"),
      approvalCheckboxRow(!isStudent, "advisor", opts),
      hr(),

      div("Graduate Studies Approval:"),
      row(
        colMd(6)(
          dropdown(
            "approved",
            [
              makeOption(
                "",
                "",
                form.approved === "" || form.approved === undefined
              ),
              makeOption(false, disapprovedGSCText, form.approved === false),
              makeOption(true, approvedGSCText, form.approved === true),
            ],
            { isDisabled: isStudent || !admin }
          )
        )
      ),

      div(
        { id: "reason-section", hidden: hide(form.approve) },
        div("Reason for Disapproval:"),
        row(
          colMd(6)(
            x("textarea.form-control")(
              {
                rows: 6,
                name: "approvalReason",
                required: !form.approved || null,
                disabled: isStudent || !admin || null,
              },
              form.approvalReason
            )
          )
        ),
        script(
          opts.cspNonce,
          `
            document.querySelector('[name="approved"]').addEventListener('change', (e) => {
              const reasonSection = document.getElementById('reason-section')
              const approvalReason = document.querySelector('[name="approvalReason"]')
              const value = e.target.value
              console.log(value)
              if (value == 'false') {
                reasonSection.removeAttribute('hidden')
                approvalReason.setAttribute('required', 'true')
              } else {
                reasonSection.setAttribute('hidden', 'true')
                approvalReason.removeAttribute('required')
              }
            })
            document.querySelector('[name="approved"]').dispatchEvent(new Event('change'))
            `,
          { defer: "" }
        )
      ),

      div("Director Approval:"),
      adminApprovalCheckboxRow(viewer, "director", form, opts.cspNonce),
      buttonBarWrapper(
        submitButton(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id)
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

function hide(arg) {
  if (arg === null || true) {
    return true;
  } else return false;
}

module.exports = main;
