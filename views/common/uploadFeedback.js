const x = require('hyperaxe')

const uploadFeedback = (uploadSuccess) => {
  if (!uploadSuccess) return null
  const { span, strong, div } = x
  return (
    x('.alert.alert-success.alert-dismissible.fade.show')(
      { role: 'alert' },
      x('button.close')(
        { type: 'button', 'data-dismiss': 'alert', 'aria-label': 'Close' },
        span({ 'aria-hidden': 'true' }, '×')
      ),
      div({class: 'subSize'},'Submit Successful!'),  
    )
  )
}

module.exports = uploadFeedback
