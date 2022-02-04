const { readyException } = require('jquery');
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const schema = require('./models/schema')

let students;

// fetch students and their advisors and researchAdvisors through mongoose (it has populate)
mongoose.connect('mongodb://localhost:27017/cs_grad_data-dev')
mongoose.connection.on('error', console.error.bind(console, 'Mongoose failed to connect:'))
.once('open', async () => {
  students = await schema.Student
    .find({})
    .populate('advisor')
    .populate('researchAdvisor')
    .exec()

  // stolen https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-object
  studentsMap = students.reduce((map, obj) => (map[obj.id] = obj, map), {})
  
  // console.log(students)
  
  const url = 'mongodb://127.0.0.1:27017'
  const client = new MongoClient(url, { useUnifiedTopology: true })
  
  const dbName = 'cs_grad_data-dev'
  
  const problems = []
  async function main() {
    await client.connect()
    const db = client.db(dbName)
  
    console.log("These are the forms with errors:")

    ;['cs01', 'cs01bsms', 'cs02', 'cs03', 'cs13'].forEach(async (formName) => {
      const collection = await db.collection(formName).find({}).toArray()
      collection.forEach((form) => {
        if (form.advisorSignature != undefined) {
          let advisorName = studentsMap[form.student].advisor ? `${studentsMap[form.student].advisor.firstName} ${studentsMap[form.student].advisor.lastName}` : '(unspecified)' // currently students with signatures but no advisors will be considered 
          let researchAdvisorName = studentsMap[form.student].researchAdvisor ? `${studentsMap[form.student].researchAdvisor.firstName} ${studentsMap[form.student].researchAdvisor.lastName}` : '(unspecified)'
          if (form.advisorSignature != advisorName ||
              form.advisorSignature != researchAdvisorName) {
            const problemString = `${formName} - Student: '${studentsMap[form.student].firstName} ${studentsMap[form.student].lastName}' has an \`advisorSignature\` that does not match their advisor or researchAdvisor's name.` 
            problems.push(problemString)
            console.log(problemString)
          }
        } else {
          const problemString = `${formName} - Student: '${studentsMap[form.student].firstName} ${studentsMap[form.student].lastName}' does not have an advisorSignature`
          problems.push(problemString)
          // console.log(studentsMap[form.student])
        }
      })
    })

    // problems.forEach(console.log);
  
    return "";
  }
  
  await main().then().catch(console.error).finally(() => client.close())

  process.exit()
})