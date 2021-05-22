const dotenv = require('dotenv')

module.exports = {
  load: () => {
    // Note: dotenv will not override env vars already set.
    // So earlier calls to dotenv.config() take priority.
    // .env values should override env-specific values, so put .env first.
    dotenv.config({ path: `./.env` })
    dotenv.config({ path: `./.env.${process.env.NODE_ENV}` })
    // Now config settings are available in `process.env` object.
  }
}
