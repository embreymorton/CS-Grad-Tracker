const makeRole = (name, pid, active, admin) => ({
  active,
  pid,
  ...(admin === null ? null : {admin}),
  onyen: name,
  csid: name,
  firstName: name,
  lastName: name,
  email: `${name}@cs.unc.edu`,
})

const admin   = makeRole('admin',   999999999, true, true)
const faculty = makeRole('faculty', 888888888, true, false)
const student = makeRole('student', 777777777, true, null)

module.exports = {
  admin,
  faculty,
  student,
}
