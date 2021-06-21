const x = require('hyperaxe')

const navItem = ({ student }, segment, label) => {
  const href = `/student/${segment}/${student._id.toString()}`
  const a = x(`a.nav-link.student-navigation-${segment}-button`)
  return x('li.nav-item')(
    a({ href }, label)
  )
}

module.exports = navItem
