const mongoose = require('mongoose')
const schema = require('./models/schema')

const showForm = (formName) => (form) =>
console.log(`${formName}: '${form.student.firstName}' '${form.student.lastName}' - '${form.advisorSignature}'`)

console.log(schema['CS02'])
const problems = []
mongoose.connect('mongodb://localhost:27017/cs_grad_data-dev')
mongoose.connection
.on('error', console.error.bind(console, 'connection error:'))
.once('open', async () => {
  console.log('These are the forms with errors:')
  await (async () => {
    ;['CS01', 'CS02', 'CS03', 'CS13'].forEach(async (formName) => {
      (await schema[formName].find({}).populate({
        path: 'student',
        populate: [{
          path: 'advisor',
          model: 'Faculty'
        },{
          path: 'researchAdvisor',
          model: 'Faculty'
        }]
      }).exec()).forEach((form) => {
        // console.log("How?", form.advisorSignature) // it seems like if schema.js's type definition for a field doesn't match the database's, then it'll just give us undefined
        // TODO: 1/13 next step: change the schema
        if (form.advisorSignature != undefined) {
          console.log("false")
          console.log(form.advisorSignature)
          let advisorName = form.student.advisor ? `${form.student.advisor.firstName} ${form.student.advisor.lastName}` : '(unspecified)' // currently students with signatures but no advisors will be considered 
          let researchAdvisorName = form.student.researchAdvisor ? `${form.student.researchAdvisor.firstName} ${form.student.researchAdvisor.lastName}` : '(unspecified)'
          if (form.advisorSignature != advisorName ||
              form.advisorSignature != researchAdvisorName) {
            problems.push(`${formName} - Student: '${form.student.firstName} ${form.student.lastName}' has an \`advisorSignature\` that does not match their advisor or researchAdvisor's name.`)
            console.log(`${formName} - Student: '${form.student.firstName} ${form.student.lastName}' has an \`advisorSignature\` that does not match their advisor or researchAdvisor's name.`)
          }
        } else {
          console.log(`${formName} - Student: '${form.student.firstName} ${form.student.lastName}' does not have an advisorSignature`)
        }
      })
    })
  })()
  // console.log(problems)
})
//TODO Cleanup this code if file will be part of the repo.