const x = require('hyperaxe')

const navItem = ({ student }, segment, label) => x('li.nav-item')(
  x(`a.nav-link.student-navigation-${segment}-button`)(
    {href: `/student/${segment}/${student._id.toString()}`},
    label
  )
)

module.exports = navItem
