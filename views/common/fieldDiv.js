const x = require('hyperaxe')

const fieldDiv = (labelText, ...args) => x('.form-group.row')(
  x('.col-md-4')(labelText),
  x('.col-md-8')(...args)
)

module.exports = fieldDiv
