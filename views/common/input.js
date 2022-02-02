const x = require('hyperaxe')

const input = (type, name, value, required=null, checked=null, min = 0,  moreAttrs={}) => {
  const input = x('input.form-control')
  const attrs = { type, name, value, checked, required, min,  ...moreAttrs }
  if (type == 'checkbox') delete attrs.value
  return input(attrs)
}

module.exports = input
