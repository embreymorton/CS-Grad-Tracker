const x = require("hyperaxe");


// Resusable bootstrap card for consistent use across CS Grad Tracking website - Jaime M

/**
 * Creates a card container for input fields. For use in pages such as 'Create Student'
 * @param {header} header sets the heading of the card, for example 'Personal Information'
 * @param {body} body sets the body content of the card
 */
const renderCard = (header, body) =>
  x(".card.mb-4")(x(".card-header")(header), x(".card-body")(body));

module.exports = {
  renderCard,
};
