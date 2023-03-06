/* global reject */
var mongoose = require('mongoose')
var schema = {}

/* Additional mongoose options */
mongoose.Schema.Types.Boolean.convertToFalse.add('')
const castObjectId = mongoose.Schema.Types.ObjectId.cast()
mongoose.Schema.Types.ObjectId.cast((v) => v ? castObjectId(v) : null)

// date format regex
//  /^0[1-9]|1[012]\/0[1-9]|[12][0-9]|3[01]\/[0-9]{4}$/  <-- MM/DD/YYYY regex
const matchDate = [/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/, '{VALUE} must be in form yyyy/mm/dd or mm/dd/yyyy']

// Faculty
var facultySchema = mongoose.Schema({
  onyen: {
    type: String,
    required: [true, '{PATH} is required!']
  },
  csid: {
    type: String,
    required: [true, 'csid is required!']
  },
  email: {
    type: String,
    required: [true, 'email is required!'],
    match: [/^\S+@\S+\.\S+$/, '{VALUE} is an invalid email address']
  },
  firstName: {
    type: String,
    required: [true, 'firstName is required!']
  },
  lastName: {
    type: String,
    required: [true, 'lastName is required!']
  },
  pid: {
    type: Number,
    required: [true, 'pid is required!']
  },
  sectionNumber: Number,
  active: Boolean,
  admin: Boolean
})
facultySchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName
})
facultySchema.virtual('lastFirst').get(function() {
  return this.lastName + ', ' + this.firstName
})

// Students
var studentSchema = mongoose.Schema({
  onyen: {
    type: String,
    required: [true, 'onyen is required!']
  },
  csid: {
    type: String,
    required: [true, 'csid is required!']
  },
  email: {
    type: String,
    required: [true, 'email is required!'],
    match: [/^\S+@\S+\.\S+$/, '{VALUE} is an invalid email address']
  },
  firstName: {
    type: String,
    required: [true, 'firstName is required!']
  },
  lastName: {
    type: String,
    required: [true, 'lastName is required!']
  },
  pronouns: {
    type: String,
    enum: ['she, her', 'he, him', 'they, them', 'ze, zie', 'hir, hirs', 'xe, xem', 'pe, per', 'e/ey, em', '(f)ae, (f)aer', 'None'],
    default: 'None'
  },
  pid: {
    type: Number,
    required: [true, 'pid is required!']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Leave', 'Graduated', 'Ineligible'],
    default: 'Active'
  },
  alternativeName: String,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    default: 'OTHER'
  },
  ethnicity: {
    type: String,
    enum: ['ASIAN', 'BLACK', 'HISPANIC', 'PACIFIC', 'WHITE', 'OTHER'],
    default: 'OTHER'
  },
  stateResidency: {
    type: String,
    enum: ['YES', 'NO', 'APPLIED'],
    default: 'NO'
  },
  USResidency: {
    type: String,
    enum: ['YES', 'NO', 'APPLIED'],
    default: 'NO'
  },
  enteringStatus: String,
  researchArea: String,
  leaveExtension: String,
  intendedDegree: {
    type: String,
    enum: ['MASTERS', 'PHD', 'BOTH'],
    default: 'MASTERS'
  },
  hoursCompleted: {
    type: Number,
    min: [0, 'must be 0 or more']
  },
  citizenship: Boolean,
  fundingEligibility: {
    type: String,
    enum: ['NOT GUARANTEED', 'GUARANTEED', 'PROBATION'],
    default: 'NOT GUARANTEED'
  },
  semestersOnLeave: {
    type: Number,
    min: [0, 'must be 0 or more']
  },
  backgroundApproved: {
    type: String,
    match: matchDate
  },
  mastersAwarded: {
    type: String,
    match: matchDate
  },
  prpPassed: {
    type: String,
    match: matchDate
  },
  technicalWritingApproved: {
    type: String,
    match: matchDate
  },
  proceedToPhdFormSubmitted: {
    type: String,
    match: matchDate
  },
  msProgramOfStudyApproved: {
    type: String,
    match: matchDate
  },
  phdProgramOfStudyApproved: {
    type: String,
    match: matchDate
  },
  researchPlanningMeeting: {
    type: String,
    match: matchDate
  },
  programProductRequirement: {
    type: String,
    match: matchDate
  },
  committeeCompApproved: {
    type: String,
    match: matchDate
  },
  phdProposalApproved: {
    type: String,
    match: matchDate
  },
  phdAwarded: {
    type: String,
    match: matchDate
  },
  oralExamPassed: {
    type: String,
    match: matchDate
  },
  dissertationDefencePassed: {
    type: String,
    match: matchDate
  },
  dissertationSubmitted: {
    type: String,
    match: matchDate
  },
  jobHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}],
  semesterStarted: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  otherAdvisor: String,
  researchAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  otherResearchAdvisor: String,
  grades: [{type:mongoose.Schema.Types.ObjectId, ref: 'Grade'}]
})
studentSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName
})
studentSchema.virtual('lastFirst').get(function() {
  return this.lastName + ', ' + this.firstName
})

// Semesters
var semesterSchema = mongoose.Schema({
  year: Number,
  season: {
    type: String,
    enum: ['FA', 'SP', 'S1', 'S2']
  },
  // visible: Boolean // whether a semester is visible from dropdowns
})
semesterSchema.virtual('semesterString').get(function() {
  return this.season + ' ' + this.year
})
// const seasonToMonth = {SP: 2, S1: 3, S2: 4, FA: 9} // from https://ccinfo.unc.edu/wp-content/uploads/sites/219/2019/02/Decoding_the_Academic_Term_Codes.pdf
// semesterSchema.virtual('value').get(function() {
//   return this.year * 10 + seasonToMonth[this.season]
// })

// Courses
var courseSchema = mongoose.Schema({
  department: {
    type: String,
    required: [true, 'department is required!']
  },
  number: {
    type: String,
    required: [true, 'course number is required!']
  },
  univNumber: {
    type: Number,
    required: [true, 'univNumber is required!']
  },
  name: {
    type: String,
    required: [true, 'course name is required!']
  },
  category: {
    type: String,
    enum: ['NA', 'Theory', 'Systems', 'Appls'],
    required: [true, 'category is required!']
  },
  topic: {
    type: String,
    required: [true, 'topic is required!']
  },
  hours: {
    type: Number,
    required: [true, 'course hours is required!']
  },
  section: {
    type: String,
    required: [true, 'section is required!']
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'faculty is required!']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'semester is required!']
  }
})

var courseInfoSchema = mongoose.Schema({
  number: {
    type: String,
    required: [true, 'number is required!']
  },
  name: {
    type: String,
    required: [true, 'name is required!']
  },
  hours: {
    type: Number,
    required: [true, 'hours is required!']
  }
})

// Jobs
var jobSchema = mongoose.Schema({
  position: {
    type: String,
    enum: ['RA', 'TA', 'OTHER'],
    required: [true, 'position is required!']
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'supervisor is required!']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'semester is required!']
  },
  course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  description: String,
  hours: Number,
  fundingSource: {type: mongoose.Schema.Types.ObjectId, ref: 'Grant'}
})

// Grades
var gradeSchema = mongoose.Schema({
  grade: {
    type: String,
    enum: ['H+', 'H', 'H-', 'P+', 'P', 'P-', 'L+', 'L', 'L-', 'NA'],
    default: 'NA'
  },
  course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'}
})

var semesterReferenceSchema = mongoose.Schema({
   name: String,
   semester: {type: mongoose.Schema.Types.ObjectId, ref:'Semester'}
 })

var grantSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required!']
  },
  cs_pi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  other_pi: String
})

// add row constraint to grant schema

grantSchema.pre('save', function(next) {
  if (this.cs_pi == null && this.other_pi == null) {
    next(new Error ('PI is required (cs_pi OR other_pi)'))
  } else if (this.cs_pi != null && this.other_pi != null) {
    next(new Error ('Cannot specify both cs and other pi'))
  } else {
    next()
  }
})

var noteSchema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student'},
  title: String,
  date: String,
  note: String
})

//form schemas
const CS01CoveredType = {type: String, enum: ['', 'Course', 'Independent Study', 'Work Experience'], default: ''}
var CS01Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  comp283Covered: CS01CoveredType, comp283Description: String, comp283Date: String,
  comp210Covered: CS01CoveredType, comp210Description: String, comp210Date: String,
  comp311Covered: CS01CoveredType, comp311Description: String, comp311Date: String,
  comp455Covered: CS01CoveredType, comp455Description: String, comp455Date: String,
  comp421Covered: CS01CoveredType, comp421Description: String, comp421Date: String,
  comp520Covered: CS01CoveredType, comp520Description: String, comp520Date: String,
  comp530Covered: CS01CoveredType, comp530Description: String, comp530Date: String,
  comp524Covered: CS01CoveredType, comp524Description: String, comp524Date: String,
  comp541Covered: CS01CoveredType, comp541Description: String, comp541Date: String,
  comp550Covered: CS01CoveredType, comp550Description: String, comp550Date: String,
  math233Covered: CS01CoveredType, math233Description: String, math233Date: String,
  math381Covered: CS01CoveredType, math381Description: String, math381Date: String,
  math547Covered: CS01CoveredType, math547Description: String, math547Date: String,
  math661Covered: CS01CoveredType, math661Description: String, math661Date: String,
  stat435Covered: CS01CoveredType, stat435Description: String, stat435Date: String,
  studentSignature: Boolean, studentDateSigned: String,
  advisorSignature: Boolean, advisorDateSigned: String
})

var CS02Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: false},
  dateSubmitted: String,
  courseNumber: String,
  basisWaiver: String,
  advisorSignature: Boolean, advisorDateSigned: String,
  instructorSignature: String, instructorDateSigned: String
})

var CS03Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  university: [String], 
  dept: [String],
  course: [String],
  hours: [Number],
  semester: [String],
  title: [String], // this and above should be length 13
  grade: [String], // should be length 3
  gradeModifier: [String], // should also be length 3
  backgroundPrep: Boolean,
  programProduct: Boolean,
  writingRequirement: {
    type: String,
    enum: ['none', 'cs04', 'cs05', 'cs08']
  },
  comprehensiveExam: String,
  studentSignature: Boolean, studentDateSigned: String,
  advisorSignature: Boolean, advisorDateSigned: String,
  approved: Boolean,
  approvalReason: String,
  directorSignature: String, directorDateSigned: String
})

var CS04Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  projectDescription: String,
  docProprietary: Boolean,
  advisorSignature: Boolean, advisorDateSigned: String,
  majorityCompleted: Boolean,
  satisfiesComprehensiveWriting: Boolean,
  approved: Boolean,
  approvalReason: String
})

var CS06Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  dateSubmitted: String, dateEntered: String, 
  dissTitle: String,
  // comp915: Boolean,
  comp915: {
    type: String,
    enum: ['taken', 'waived', ''] // where empty string means 'not taken nor waived' (for falsiness)
  },
  breadthCourseCategory: [String],
  breadthCourseInfo: [String],
  breadthCourseDate: [String],
  breadthCourseGrade: [String],
  breadthCourseGradeModifier: [String],
  concentrationCourseInfo: [String],
  concentrationCourseDate: [String],
  concentrationCourseHours: [Number],
  otherCourseInfo: [String],
  otherCourseHours: [Number],
  note: String,
  otherCourses: String,
  minor: String,
  backgroundPrepWorkSheet: Boolean,
  programProductRequirement: Boolean,
  PHDWrittenExam: Boolean,
  PHDOralExam: Boolean,
  committee: [String],
  advisor: String, chairman: String,
  chairSignature: String, chairDateSigned: String,
  approved: String,
  reasonApproved: String,
  directorSignature: String, directorDateSigned: String,
})

var CS08Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  semester: String, year: Number,
  title: String,
  primaryReader: String, primaryDate: String,
  secondaryReader: String, secondaryDate: String,
  primarySignature: String, primaryDateSigned: String,
  secondarySignature: String, secondaryDateSigned: String
})

var CS13Schema = mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:'Student', unique: true},
  email: String, dateMet: String,
  selectedSection: {
    type: String,
    enum: ['comp523', 'industry', 'alternative']
  },
  comp523Signature: String,
  comp523DateSigned: String,
  jobInfo: String,
  advisorSignature: Boolean,
  advisorDateSigned: String,
  product: String,
  client: String,
  position: String,
  alt1Signature: String,
  alt1DateSigned: String,
  alt2Signature: String,
  alt2DateSigned: String,
})

const semesterProgressReportSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true
  },
  semester: {
    type: String,
    validate: {
      validator: async function(v) {
        if (this.student) {
          const match = await schema.SemesterProgressReport.findOne({student: this.student, semester: v}).exec()
          return !match
        }
        
        // why so complicated?
        // according to https://mongoosejs.com/docs/validation.html#update-validators-and-this, update validators (from functions like findOneAndUpdate with useValidators flag true)
        // cannot use `this` to get the other values because they may not describe the entire object, therefore as an alternative we look at the Query object
        const thisId = this._conditions._id
        const studentId = this._update['$set'].student || (await schema.SemesterProgressReport.findOne({_id: thisId}, 'student').exec()).student // can technically be determined by fetching for thisId
        const match = await schema.SemesterProgressReport.findOne({student: studentId, semester: v, _id: {$ne: thisId}}).exec()
        return !match
      },
      message: props => `Progress report for this semester already exists.`
    }
  },
  progressMade: String,
  goals: String,
  rataPreferences: String, // rata = RA or TA 
  employmentAdvisor: { // if employmentAdvisor is same as regular advisor, please copy it over
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  altEmploymentAdvisor: String, // if this field has a value, ignore `employmentAdvisor` field

  academicSignature: String, academicDateSigned: String,
  employmentSignature: String, employmentDateSigned: String,
  // you must ensure that students are not allowed to see the following fields!
  // hasDiscussed: Boolean,
  academicRating: {
    type: String,
    default: 'NR', // Not Rated
    enum: ['NR', 1, 2, 3, 4],
  },
  academicComments: String,
  rataRating: {
    type: String,
    default: 'NR',
    enum: ['NR', 'NA', 1, 2, 3, 4],
  },
  rataComments : String,
})
semesterProgressReportSchema.virtual('semesterString').get(function () {
  if (this.semester) {
    return this.semester
  }
  return 'Unspecified semester'
})

schema.Faculty = mongoose.model('Faculty', facultySchema)
schema.Student = mongoose.model('Student', studentSchema)
schema.Semester = mongoose.model('Semester', semesterSchema)
schema.Course = mongoose.model('Course', courseSchema)
schema.CourseInfo = mongoose.model('CourseInfo', courseInfoSchema)
schema.Job = mongoose.model('Job', jobSchema)
schema.Grade = mongoose.model('Grade', gradeSchema)
schema.Grant = mongoose.model('Grant', grantSchema)
schema.SemesterReference = mongoose.model('SemesterReference', semesterReferenceSchema)
schema.Note = mongoose.model('Note', noteSchema)
schema.CS01 = mongoose.model('CS01', CS01Schema)
schema.CS02 = mongoose.model('CS02', CS02Schema)
schema.CS03 = mongoose.model('CS03', CS03Schema)
schema.CS04 = mongoose.model('CS04', CS04Schema)
schema.CS06 = mongoose.model('CS06', CS06Schema)
schema.CS08 = mongoose.model('CS08', CS08Schema)
schema.CS13 = mongoose.model('CS13', CS13Schema)
schema.SemesterProgressReport = mongoose.model('SemesterProgressReport', semesterProgressReportSchema)


module.exports = schema

