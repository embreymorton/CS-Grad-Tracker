const x = require('hyperaxe')

const row = x('div.row')
const colMd = (n) => x(`div.col-md-${n}`)

module.exports = {
  row, colMd,
}
