const {
  dropdown,
  makeOption,
  input,
  datalist,
} = require("../common/baseComponents");

// const semesterToMonths = {'SP': [1, 2, 3, 4], 'S1': [5], 'S2': [6, 7], 'FA': [8, 9, 10, 11, 12]}
const monthToSemester = (month) => {
  if (1 <= month && month <= 4) {
    return "SPRING";
  } else if (5 <= month && month <= 5) {
    return "SUMMER S1";
  } else if (6 <= month && month <= 7) {
    return "SUMMER S2";
  } else {
    return "FALL";
  }
};

/**
 *
 * @param {String} name name of field in the schema
 * @param {Schema.Types.ObjectId} value `._id` property of the current semester schema object
 * @param {[SemesterSchema]} semesters list of semesters from opts object
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired
 * @param {String} placeholder text displayed when no option is selected
 * @returns
 */
const semesterDropdown = (
  name,
  value,
  semesters,
  isDisabled,
  {
    isRequired = true,
    placeholder = "Select a semester from the dropdown",
  } = {}
) => {
  return dropdown(
    name,
    semesters.map((semester) =>
      makeOption(
        semester._id.toString(),
        semester.semesterString,
        value?.equals(semester._id)
      )
    ),
    {
      isDisabled,
      isRequired,
      blankOption: placeholder,
    }
  );
};

/**
 *
 * @param {String} name of field in schema
 * @param {String} value text stored in db for this name
 * @param {Boolean} isDisabled
 * @param {Boolean} isRequired
 * @param {String} placeholder
 * @param {Boolean} isSS_YYYY whether to only allow semesters in form (FA|SP|S1|S2) YYYY
 * @param {String} list id of datalist to include
 * @returns
 */
const semesterInput = (
  name,
  value,
  {
    isDisabled = false,
    isRequired = true,
    placeholder = "Select a semester or type one in (FA|SP|S1|S2) YYYY format",
    isSS_YYYY = true,
    list = "semestersDatalist",
  } = {}
) => {
  return input(name, value, {
    isDisabled,
    isRequired,
    placeholder,
    attrs: {
      list,
      ...(isSS_YYYY ? { pattern: "^(FA|SP|S1|S2) \\d\\d\\d\\d$" } : {}),
    },
  });
};

/**
 * Generates a list of semesters and summer sessions from current date's year
 * @param {Integer} back number of years back to generate semesters
 * @param {Integer} forward number of years forward to generate semesters
 * @param {String} id overrides default id of this datalist
 */
const semesterDatalist = (back, forward = 0, id = "semestersDatalist") => {
  const today = new Date();
  const year = today.getFullYear();
  const currSemester = monthToSemester(today.getMonth() + 1);
  const order = ["SP", "S1", "S2", "FA"];

  const list = [];
  let i = order.indexOf(currSemester);
  let yyyy = year - back;
  for (i; i < order.length * (forward + back + 1); i++) {
    const ss = order[i % order.length];
    list.push(`${ss} ${yyyy}`);
    if (ss == order[order.length - 1]) {
      yyyy++;
    }
  }

  return datalist(id, list.map((v) => [v, v]).reverse());
};
module.exports = { semesterDropdown, semesterInput, semesterDatalist };
