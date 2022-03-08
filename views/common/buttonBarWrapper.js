const x = require('hyperaxe')

const buttonBarWrapper = (...buttons) => {
  return x('div.button-bar')(
    ...buttons
  )
}

module.exports = buttonBarWrapper