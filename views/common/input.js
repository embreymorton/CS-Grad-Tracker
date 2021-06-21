const x = require('hyperaxe')

const input = (type, name, value, required_, checked) => {
  const input = x('input.form-control')
  const required = required_ ? true : null
  const attrs = { type, name, value, checked, required }
  if (type == 'checkbox') delete attrs.value
  return input(attrs)
}

module.exports = input
