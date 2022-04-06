const x = require('hyperaxe')
const input = require('./input')
const pseudoInput = require('./pseudoInput')

const signatureRow = (editAccess, key, values) => {
  const col = (n) => (x(`div.col-md-${n}`))
  const { em, div } = x
  const sigName = `${key}Signature`
  const dateName = `${key}DateSigned`
  const roValue = (name, type) => (pseudoInput(values[name]))
  const rwValue = (name, type) => (input(`${type}`, name, values[name], true))
  const value = editAccess ? rwValue : roValue

  return (
    x('.row')(
      col(5)(
        em('In place of your signature, please type your full legal name:'),
        value(sigName, 'text'),
      ),
      col(3)(
        div('Date signed'),
        value(dateName, 'date'),
      ),
    )
  )
}

module.exports = signatureRow
