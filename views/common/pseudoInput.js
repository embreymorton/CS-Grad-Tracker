const x = require('hyperaxe')

/**
 * @param {String} text - text inside the pseudo input
 * @param {String} additionalTags additional tags in the form of HTML query parameters ('.' for classes or '#' for ids)
 * @returns 
 */
const pseudoInput = (text, additionalTags = "") => (
  x(`div.pseudo-input${additionalTags}`)(text || ' ') // <-- nbsp character
)

module.exports = pseudoInput
