const x = require('hyperaxe')

const uploadFeedback = (uploadSuccess) => {
  if (!uploadSuccess) return null
  const { span, strong } = x
  return (
    x('.alert.alert-success.alert-dismissible.fade.show')(
      { role: 'alert' },
      x('button.close')(
        { type: 'button', 'data-dismiss': 'alert', 'aria-label': 'Close' },
        span({ 'aria-hidden': 'true' }, '×')
      ),
      strong('Submit success!'),
    )
  )
}

module.exports = uploadFeedback
