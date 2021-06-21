const x = require('hyperaxe')

const main = () => {
  const { script } = x
  const type = 'text/javascript'
  const js = (src) => script({ type, src })
  return [
    js('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'),
    js('/js/bootstrap.js'),
  ]
}

module.exports = main
