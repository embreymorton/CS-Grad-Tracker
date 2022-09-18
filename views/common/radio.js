const x = require('hyperaxe')

const radio = (name, value, text, {isChecked = false, isDisabled = false} = {}) => {
  const checked = isChecked ? { checked: '' } : {}
  const disabled = isDisabled ? { disabled: '' } : {}
  return [
    x(`input.form-control#radio-${name}-${value}`)({name, value, type: 'radio', ...checked, ...disabled}),
    x(`label`)({for: `radio-${name}-${value}`}, text)
  ]
}

module.exports = radio