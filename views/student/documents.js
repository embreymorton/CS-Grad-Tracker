const x = require('hyperaxe')
const { h1, h4, div, form, button } = x
const { row, colMd } = require('../common/grid')
const page = require('../page')
const studentBarPartial = require('../common/studentBarPartial')

const main = (opts) => {
  const title = 'Documents'
  return page(
    { ...opts, title },
    studentBarPartial(opts),
    h1(title),
    x('.space')(),
    body(opts)
  )
}

const body = (opts) => {
  return div(
    {class: 'text-left'},
    form(
      row(colMd(2)('Upload new document:'), colMd(10)(fileInput())),
      row(
        button(
          {type: 'submit'},
          'Upload'
        )
      )
    ),
    div(
      'List of uploaded documents:',
      div(
        {class: 'document-list'},
        [documentRow()])
    )
  )
}

const documentRow = (doc) => {
  return div(
    {}
  )
}

const fileInput = () => {
  return x('input#new-document.file-upload-button')(
    {type: 'file', name: 'document', accept:'*'}
  )
}

module.exports = main