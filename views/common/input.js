const x = require('hyperaxe')

const input = (type, name, value, required=null, checked=null, moreAttrs={}) => {
  const input = x('input.form-control')
  const attrs = { type, name, value, checked, required, ...moreAttrs }
  if (type == 'checkbox') delete attrs.value
  return input(attrs)
}

module.exports = input
