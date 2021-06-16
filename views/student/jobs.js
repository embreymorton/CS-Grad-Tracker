const x = require('hyperaxe')
const page = require('../page')
const studentBarPartial = require('../common/studentBarPartial')

const main = (opts) => {
  const { admin, student } = opts
  const { lastName, firstName } = student
  const title = 'Job history'
  const { h4, h1 } = x
  return page(
    { ...opts, title },
    studentBarPartial(opts),
    h4(lastName, ', ', firstName),
    h1(title),
    jobHistory(opts),
    admin ? addJobForm(opts) : null,
  )
}

const jobHistory = (opts) => {
  const { admin, student } = opts
  const jobs = student.jobHistory
  if (jobs.length == 0) return x('div')('No jobs found.')
  const th = (label) => x('th')({ scope: 'col' }, label)
  const labels_ = [
    'Position', 'Supervisor', 'Course', 'Semester', 'Hours', 'Description',
  ]
  const labels = admin ? [ ...labels_, 'Delete Job' ] : labels_
  return (
    x('table.table.display-table.table-striped.table-bordered.job-history-table')(
      { align: 'center', border: 1 },
      x('thead')(
        x('tr')(
          labels.map(th)
        ),
      ),
      x('tbody')(
        jobs.map(jobRow(opts))
      ),
    )
  )
}

const jobRow = ({ admin, student }) => (job) => {
  const { position, supervisor, course, semester, hours, description } = job
  const { tr, td, form, input } = x
  return (
    tr(
      td(position),
      td(`${supervisor.lastName}, ${supervisor.firstName}`),
      td(course != null ? `${course.department} ${course.number} ${course.section}` : null),
      td(`${semester.season} ${semester.year}`),
      td(hours),
      td(description),
      admin ? td(
        deleteJobForm(student._id.toString(), job._id.toString()),
      ) : null,
    )
  )
}

const deleteJobForm = (studentId, jobId) => {
  const { form, input } = x
  return form(
    { action: '/student/deleteJob', method: 'post' },
    input({ type: 'hidden', name: 'studentId', value: studentId }),
    input({ type: 'hidden', name: 'jobId', value: jobId }),
    x('button.btn.btn-danger.job-delete-button')({ type: 'submit', }, 'Delete'),
  )
}

const addJobForm = ({ jobs, student }) => {
  const { h2, form, input } = x
  const formRow = x('.form-group.row')
  const label = x('label.col-md-2.offset-md-3')
  const select = x('select.form-control.job-select')
  return [
    h2('Add jobs'),
    form(
      { action: '/student/addJobs', method: 'post' },
      formRow(
        label({ for: 'inputJobs' }, 'Jobs',),
        x('.col-md-4')(
          select(
            { id: 'inputJobs', multiple: 'yes', required: 'yes', name: 'jobs', },
            x('option')({ value: '' }),
            (jobs || []).map(jobOption)
          )
        )
      ),
      input({ type: 'hidden', name: 'studentId', value: student._id.toString()}),
      x('.form-group.row.align-items-end')(
        x('.col-md-4.offset-md-4')(
          x('button.btn.btn-primary.job-select-submit-button')('Submit'),
        )
      )
    )
  ]
}

const jobOption = ({ _id, position, supervisor, semester }) => {
  const { lastName, firstName } = supervisor
  const { season, year } = semester
  const semesterStr = `${season} ${year}`
  const str = [ position, lastName, firstName, semesterStr ].join(', ')
  return x('option')({ value: _id.toString() }, str)
}

module.exports = main
