const x = require('hyperaxe')

const input = (type, name, value, required=null, checked=null, min = 0,  moreAttrs={}) => {
  if (required == false) {required = null} // html unary attributes take any value as existing
  const input = x('input.form-control')
  const attrs = { type, name, value, checked, required, min,  ...moreAttrs }
  if (type == 'checkbox') delete attrs.value
  return input(attrs)
}

module.exports = input
