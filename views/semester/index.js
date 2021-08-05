const x = require('hyperaxe')
const schema = require('../../models/schema')
const page = require('../page')
const select = require('../common/select')
const fieldDiv = require('../common/fieldDiv')
const input = require('../common/input')

const main = (opts) => {
  const { h1, h4, hr } = x
  const { semesters } = opts
  const title = 'Semesters'
  return page(
    { ...opts, title },
    x('div.text-left')(
      h1(title),
      list(semesters),
      hr(),
      form()
    ),
  )
}

const list = (semesters) => (
  x('ul')(semesters.map(semesterLi))
)

const semesterLi = (semester) => {
  const { season, year } = semester
  const { li } = x
  return li(`${season} ${year}`)
}

const form = () => {
  const { h3, form } = x
  return (
    form(
      { action: '/semester/create', method: 'post' },
      h3('Create new semester'),
      select({
        required: true,
        label: 'Season',
        name: 'season',
        values: schema.Semester.schema.path('season').enumValues,
      }),
      fieldDiv(
        'Year',
        input('number', 'year', null, true),
      ),
      x('button.btn.btn-primary')({ type: 'submit' }, 'Submit'),
    )
  )
}

module.exports = main
