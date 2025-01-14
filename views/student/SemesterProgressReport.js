const x = require("hyperaxe");
const page = require("../page");
const uploadFeedback = require("../common/uploadFeedback");
const studentBar = require("../common/studentBar");
const { row, colMd } = require("../common/grid");
const pseudoInput = require("../common/pseudoInput");
const cancelEditButton = require("../common/cancelEditButton");
const buttonBarWrapper = require("../common/buttonBarWrapper");
const submitButton = require("../common/submitButton");
const saveEditButton = require("../common/saveEditsButton");
const { dropdown, makeOption, textarea, input, script, optionSet } = require("../common/baseComponents");
const { semesterDatalist, semesterInput } = require("../common/semesterDropdown");
const viewerApprovalRow = require("../common/viewerApprovalRow");
let complete = null;

const vert = x("div.verticalSpace")();
const main = opts => {
  const { uploadSuccess, isComplete, VA, form } = opts;
  complete = isComplete;
  const title = "Semesterly Progress Report";
  return page(
    { ...opts, title },
    uploadFeedback(uploadSuccess),
    studentBar(opts),
    VA.allow("admin student advisor", ["_id", form.employmentAdvisor?._id]) ? mainContent(opts) : "You are not authorized to view this page.",
  );
};

const mainContent = opts => {
  const { student, hasAccess, isStudent, seeAllSubmissions } = opts;
  const { lastName, firstName } = student;
  const { h6, h5, h4, h3, h2, div, details, summary, strong, hr, a } = x;
  const form = !hasAccess
        ? div("You do not have access")
        : progressReportForm(opts);
  return [
    h4(lastName, ", ", firstName),
    h3("Semester Progress Report"),
    a({href: seeAllSubmissions, class: "btn btn-primary"}, "See More Submissions"),
    vert,
    div(
      { class: "text-left" },
      div("Please discuss your semester goals and milestones with your advisor. Fill out this form with as much details as you can. Below is a recommended/typical timeline with some major milestones for your reference:"),
      details({open: true},
        summary(h5({class: "d-inline"}, strong("Recommended Milestones:"))),
        div(
          milestoneBullets("By the end of semester 4", ["Gain admission to PhD candidacy through PRP and faculty vote."]),
          milestoneBullets("By the end of semester 5", ["Discuss research plan with at least three (potential) committee members; submit form CS-12."]),
          milestoneBullets("By the end of semester 6", ["Name the remaining members of the doctoral committee (Graduate School form).", "Submit Plan of Study (Form CS-06) with background preparation (Form CS-01) approved by the committee."]),
          milestoneBullets("By the end of semester 7", ["Submit a dissertation proposal to the committee; hold meeting for approval of proposal,", "OR Pass the Doctoral Oral examination."]),
          milestoneBullets("By the end of semester 8", ["Submit disseration proposal AND pass the Doctoral Oral examination.", "Apply for Admission to Candidacy for a Doctoral Degree (Graduate School form)."]),
          milestoneBullets("At any time", ["Satisfy the program product requirement: submit Form CS-13.", "Satisfy the teach requirement: submit Form CS-11", "Submit course waiver forms as appropriate."]),
          milestoneBullets("Every six months after approval of the dissertation proposal", ["Meet with the committee to discuss dissertation progress."]),
          milestoneBullets("By the end of semester 10", ["When dissertation is in substantially finished form, announce dissertation defense, giving two weeks's notice.", "Pass Final Oral examination (dissertation defense).", "Submit completed and signed dissertation to the Graduate School."]),
        ),
      ),
      form
    ),
    div(
      " " // <-- nbsp character
    )
  ];
};

const milestoneBullets = (title, listOfBullets) => {
  const {ul, li, strong} = x;
  return [
    strong(title),
    ul(
      listOfBullets.map(bulletText => li(bulletText))
    )
    ];
};

const progressReportForm = opts => {
  const { postMethod, student, form, admin, isStudent, activeFaculty, isComplete, semesters, VA } = opts;
  const editAccess = admin || isStudent;
  const frow = textareaRow(form, editAccess);
  const { courseNumber, basisWaiver } = form;
  const { div, hr } = x;

  // making dropdown choices for the employment advisor
  const employmentAdvisorChoices = activeFaculty.map(faculty => makeOption(
    faculty._id.toString(), 
    faculty.lastFirst, 
    form.employmentAdvisor?._id.equals(faculty._id) // select from the faculty list the one with the corresponding id
  ));
  if (student.advisor) { // default option that is identical to selecting their normal advisor
    employmentAdvisorChoices.unshift(makeOption(student.advisor?._id.toString(), "I am employed by my advisor.", form.employmentAdvisor == undefined, true));
  }
  const OTHER_TEXT = "Other, please specify:";
  employmentAdvisorChoices.push(makeOption( // other option for employment outside department
    student.advisor?._id.toString(),
    OTHER_TEXT,
    Boolean(form.altEmploymentAdvisor),
    false
  ));

  return (
    x("form.cs-form#cs-form")(
      { action: postMethod, method: "post" },
      input("student", student._id.toString(), {isHidden: true}),
      namePidRow(opts, editAccess), 
      semesterDatalist(1),
      hr(),
      div("Choose the semester you are filling this form for:"),
      row(
        colMd(6)(
          semesterInput("semester", form.semester, {
            isDisabled: isComplete,
            isRequired: true,
            isSS_YYYY: true
          }),
          // semesterDropdown('semester', form.semester?._id, semesters, isComplete, {isRequired: true})
          // dropdown('semester', 
          //   semesters.map((semester) => makeOption(semester._id.toString(), semester.semesterString, form.semester?._id.equals(semester._id))), 
          //   {
          //     isDisabled: isComplete, 
          //     blankOption: 'Select a semester from the dropdown.'
          //   }
          // )
        )
      ),
      hr(),
      frow(div("Q1: What progress did you make this semester (or since your last progress report)? Please include any milestones completed, papers submitted, or other general progress made."), "progressMade", 8, isStudent), 
      vert,
      frow(div("Q2: What are your goals/plans for next semester (including summers)?"), "goals", 8, isStudent), 
      vert,
      frow(div("Q3: List your prefrences for RA/TA positions next semester:"), "rataPreferences", 8, isStudent), 
      vert,
      row(colMd(6)(
        "Q4: If you are not employed by your main advisor for an RA/TA position, please select a different employment advisor from below:"
      )),
      row(
        colMd(6)(
          dropdown("employmentAdvisor",
            employmentAdvisorChoices,
            {
              isDisabled: isComplete || VA.not("admin student"),
              blankOption: "You do not have an advisor specified and so you must select from the dropdown.", // overriden above if student has an advisor
              isRequired: true
            }
          )
        ),
        colMd(6)(
          input("altEmploymentAdvisor", form.altEmploymentAdvisor, {isDisabled: isComplete, isRequired: true, isHidden: !form.altEmploymentAdvisor})
        ),
        script(opts.cspNonce, 
          `
          document.getElementById('select-employmentAdvisor').addEventListener('change', (event) => {
            const select = event.target
            const otherBox = document.getElementById('input-altEmploymentAdvisor')
            if (select.options[select.selectedIndex].text == "${OTHER_TEXT}") { // other was selected
              otherBox.type = 'text'
            } else {
              otherBox.type = 'hidden'
              otherBox.value = ''
            }
          })` 
          ,
          {defer: true}
        )
      ),
      vert,

      // end of student's section
      hr(),
      !isStudent ? evaluationSection(opts) : null, // IMPORTANT: Do not allow students to see the evaluation sections!
      buttonBarWrapper(
        submitButton(opts),
        isComplete ? null : saveEditButton(postMethod),
        cancelEditButton(isStudent ? null : student._id),
      )
    )
  );
};

const namePidRow = (opts, editAccess) => {
  const { student, form, isComplete } = opts;
  const { lastName, firstName, pid } = student;
  const name = `${lastName}, ${firstName}`;
  const { div } = x;

  return (
    row(
      colMd(6)(
        div("Name"),
        pseudoInput(name)
      ),
      colMd(6)(
        div("PID"),
        pseudoInput(pid)
      )
    )
  );
};

const rowCol = (width, ...inside) => row(colMd(width)(...inside));

const formRow = (values, editAccess, type = "text") => (label, name, width = 6, required = true) => {
  const element = input(name, values[name], {isRequired: required, isDisabled: !(editAccess && !complete)});
  return (
    row(
      colMd(width)(
        label,
        element,
      )
    )
  );
};

/**
 * A function that returns a function that creates rows for textarea user input.
 * Why? Because if there is no editAccess to the form, then user input rows
 * can only create "pseudoInputs" which are uneditable. 
 */
const textareaRow = (form, editAccess) => (label, name, width, required = true) => {
  const isDisabled = !(editAccess && !complete);
  const element = textarea(
    name,
    form[name],
    { rows: width, isRequired: required, isDisabled},
  );
  return row(
    colMd(width)(
      label,
      element
    )
  );
};

const evaluationSection = opts => {
  const { form, admin, student, isStudent, cspNonce, viewer, VA } = opts;
  const editAccess = admin || isStudent;
  const textFrow = access => formRow(form, access, "text");
  const { hr, h2, h3, h4, div, b } = x;
  
  return [
    h4(),
    div(
      {class: "text-center"},
      h2("For Faculty:"),
      h3("Student Semester Progress Evaluation"),
    ),
    div(
      { class: "text-left" },
      div("Faculty members,"),
      div("Please fill out this form for each student you are supervising. The recommended milestones of a graduate students are described above."),
    ),
    hr(),
    h4("For the academic advisor:"),
    rowCol(8,
      "Q1. How would you rate the student's progress on their 'academic' goals? Please refer to the recommended/typical timeline for major milestones.",
      dropdown(
        "academicRating",
        optionSet([
            ["NR", "Not yet rated."],
            [4, "4: EXCELLENT: The student's progress exceeds expectations."],
            [3, "3: FINE: The student made normal progress."],
            [2, "2: WEAK: The student made lower than expected progress, but the student and I have made a plan to remedy it."],
            [1, "1: POOR: The student has not been making sufficient progress, and should be put on probation."]
          ],
          form.academicRating || -1
        ),
        {isRequired: false, isDisabled: VA.not("admin advisor")}
      )
    ),
    vert,
    textFrow(VA.allow("admin advisor"))(
      "Q2. Regarding your rating on the student's progress on their \"academic\" goals in the previous question, if you have additional comments, please enter them below.",
      "academicComments",
      8,
      false
    ),
    vert,
    rowCol(12,
      div("Academic Advisor Approval:"),
      "Q3. I have read the student progress report filled out by the student, and have discussed its contents with them.",
    ),
    viewerApprovalRow(
      "academicSignature",
      "academicDateSigned",
      form,
      viewer,
      cspNonce,
      {signerTitle: "Academic Advisor", isDisabled: VA.not("admin advisor")}
    ),
    vert,
    hr,
    h4("For the employment advisor:"),
    rowCol(12,
      b(form.altEmploymentAdvisor ? `⚠️ NOTE: You, ${student.advisor.fullName}, must complete this section for ${form.altEmploymentAdvisor} as well.` : "")  
    ),
    rowCol(8,
      "Q4. If you hired the student as an RA/TA this semester, please rate their RA/TA work performance.",
      dropdown(
        "rataRating",
        optionSet(
          [
            ["NR", "Not yet rated."],
            [4, "4: Very Good"],
            [3, "3: Good"],
            [2, "2: Poor"],
            [1, "1: Very Poor"],
            ["NA", "N/A: Student did not work as an RA/TA."],
          ],
          form.rataRating == 0 ? 0 : form.rataRating || -1
        ),
        {isRequired: false, isDisabled: VA.not("admin", ["_id", form.employmentAdvisor?._id]) && !form.altEmploymentAdvisor}
      ),
    ),
    vert,
    textFrow(VA.allow("admin", ["_id", form.employmentAdvisor?._id]) || form.altEmploymentAdvisor)(
      "Q5. Regarding your rating on the student's performance as an RA/TA in the previous question, if you have additional comments, please enter them below.",
      "rataComments",
      8,
      false
    ),
    vert,
    rowCol(12,
      div("Employment Advisor Approval:"),
      "Q6. I have evaluated the student's performance.",
    ),
    viewerApprovalRow(
      "employmentSignature",
      "employmentDateSigned",
      form,
      viewer,
      cspNonce,
      {signerTitle: "Employment Advisor", isDisabled: VA.not("admin", ["_id", form.employmentAdvisor?._id])}
    ),
    script(cspNonce, // hacky way to add "on behalf of"
        `
        document.getElementById('checkbox-employmentSignature').addEventListener('change', (e) => {
          const altEmploymentAdvisor = document.querySelector('[name="altEmploymentAdvisor"]')
          if (e.target.checked && altEmploymentAdvisor.value) {
            const label = document.getElementById('label-employmentSignature')
            const alt_employer = altEmploymentAdvisor.value
            const currentText = label.innerText.split(')')
            currentText[1] = ' on behalf of ' + alt_employer + ')'
            label.innerText = currentText.join('')
          }
        })
        
        document.getElementById('checkbox-employmentSignature').dispatchEvent(new Event('change'))
        `,
      {defer: ""}
    ),
    vert,
    hr
  ];
  
}; 


module.exports = main;
