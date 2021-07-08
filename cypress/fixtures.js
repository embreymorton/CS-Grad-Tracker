const schema = require('../models/schema')
const testRoles = require('../data/testRoles')
const mongoose = require('mongoose')

const saveSemestersForYear = (seasons) => (year) => (
  seasons.map((season) => (
    (new schema.Semester({ year, season })).save()
  ))
)

const saveSemesters = () => {
  const seasons = schema.Semester.schema.path('season').enumValues
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
  const promiseArrays = years.map(saveSemestersForYear(seasons))
  return Promise.all(promiseArrays.flat())
}

const saveTestRoles = () => (
  new Promise((resolve, _) => (
    Promise.all([
      (new schema.Faculty(testRoles.admin)).save(),
      (new schema.Faculty(testRoles.faculty)).save(),
      (new schema.Student(testRoles.student)).save(),
    ]).then(([admin, faculty, student]) => (
      resolve({ admin, faculty, student })
    ))
  ))
)

const courseInfo = (number, name, hours) => ({ number, name, hours })

const courseInfoMaps = [
  courseInfo(523, 'Software Engineering Laboratory', 3),
  courseInfo(524, 'Programming Language Concepts', 3),
]

const saveCourseInfos = () => (
  Promise.all(
    courseInfoMaps.map((courseInfo) => (
      (new schema.CourseInfo(courseInfo)).save()
    ))
  )
)

const saveCourse = (faculty, courseInfo, semester) => {
  const { number, name, hours } = courseInfo
  const course = new schema.Course({
    number, name, hours,
    department: 'COMP',
    univNumber: 1234,
    category: 'Theory',
    topic: 'N/A',
    section: '1',
    faculty: faculty._id,
    semester: semester._id,
  })
  return course.save()
}

const saveJob = (supervisor, course) => {
  const job = new schema.Job({
    position: 'TA',
    supervisor: supervisor._id,
    description: 'A TA JOB',
    hours: 4,
    course: course._id,
    semester: course.semester._id,
  })
  return job.save()
}

const resetDatabaseToSnapshot = async () => {
  try {
    await mongoose.connection.db.dropDatabase()
    const [ semesters, roles, courseInfos ] = await Promise.all([
      saveSemesters(),
      saveTestRoles(),
      saveCourseInfos(),
    ])
    const course = await saveCourse(roles.faculty, courseInfos[0], semesters[0])
    const job = await saveJob(roles.faculty, course)
    return { semesters, roles, courseInfos, course, job }
  } catch (e) {
    console.error('Error resetting database to snapshot')
    console.error(e.cause || e)
  }
}

module.exports = resetDatabaseToSnapshot
