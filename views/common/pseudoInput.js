const x = require('hyperaxe')

const pseudoInput = (text) => (
  x('div.pseudo-input')(text || ' ') // <-- nbsp character
)

module.exports = pseudoInput
