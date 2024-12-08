var mongoose = require('mongoose')
var schema = require("../models/schema.js");
mongoose.connect('mongodb://localhost/cs_grad_data-dev');

// Run tests with: npm run unit-test

test('Test creating a student and ensuring default schema values are correct', async () => {
    const Student = mongoose.model('Student', schema.studentSchema);
    const student = new Student({'onyen': 'unit test', 'csid': '000000', 'email': 'student@cs.unc.edu', 'firstName': 'unit', 'lastName': 'test', 'pid': 77})
    await student.save();
    const result = await schema.Student.findOne({ pid: 77 }).exec();
    expect(result.pronouns).toBe('None');
    expect(result.status).toBe('Active');
    expect(result.gender).toBe('Prefer Not To Say');
    expect(result.ethnicity).toBe('Prefer Not To Say');
    expect(result.stateResidency).toBe('NO');
    expect(result.USResidency).toBe('NO');
});

test('Test getting student information', async () => {
  const result = await schema.Student.findOne({ pid: 77 }).exec();
  expect(result.firstName).toBe('unit');
});


test('Test creating CS01NEW', async () => {
    const student = await schema.Student.findOne({ pid: 77 }).exec();
    const CS01NEW = mongoose.model('CS01NEW', schema.CS01SchemaNEW);
    const form = new CS01NEW({'student': student, 'comp283Covered': 'Course'})
    await form.save();
    const result = await schema.CS01NEW.findOne({ student: student }).exec();
    expect(result.comp283Covered).toBe('Course');
    expect(result.comp210Covered).toBe(''); 
})

test('Test deleting CS01NEW', async() => {
    const student = await schema.Student.findOne({ pid: 77 }).exec();
    const form = await schema.CS01NEW.findOne({ student: student }).exec();
    const CS01NEW = mongoose.model('CS01NEW', schema.CS01SchemaNEW);
    const result = await CS01NEW.deleteOne({student: student}).exec();
    expect(result.deletedCount).toBe(1);

})

test('Test deleting a non-existent CS01NEW', async() => {
  const student = await schema.Student.findOne({ pid: 1111111111111 }).exec();
  const form = await schema.CS01NEW.findOne({ student: student }).exec();
  const CS01NEW = mongoose.model('CS01NEW', schema.CS01SchemaNEW);
  const result = await CS01NEW.deleteOne({student: student}).exec();
  expect(result.deletedCount).toBe(0);

})

test('Test creating CS12', async () => {
  const student = await schema.Student.findOne({ pid: 77 }).exec();
  const CS12 = mongoose.model('CS12', schema.CS12Schema);
  const form = new CS12({'student': student, 'discussionDate': '2010-01-01'})
  await form.save();
  const result = await schema.CS12.findOne({ student: student }).exec();
  expect(result.discussionDate).toBe('2010-01-01');
})

test('Test deleting CS12', async() => {
  const student = await schema.Student.findOne({ pid: 77 }).exec();
  const form = await schema.CS12.findOne({ student: student }).exec();
  const CS12 = mongoose.model('CS12', schema.CS12Schema);
  const result = await CS12.deleteOne({student: student}).exec();
  expect(result.deletedCount).toBe(1);

})

test('Test deleting a non-existent CS12', async() => {
  const student = await schema.Student.findOne({ pid: 1111111111111 }).exec();
  const form = await schema.CS12.findOne({ student: student }).exec();
  const CS12 = mongoose.model('CS12', schema.CS12Schema);
  const result = await CS12.deleteOne({student: student}).exec();
  expect(result.deletedCount).toBe(0);
})


test('Test creating CS13', async () => {
  const student = await schema.Student.findOne({ pid: 77 }).exec();
  const CS13 = mongoose.model('CS13', schema.CS13Schema);
  const form = new CS13({'student': student})
  await form.save();
  const result = await schema.CS13.findOne({ student: student }).exec();
  expect(result.email).toBe(undefined);
})

test('Test deleting CS13', async() => {
  const student = await schema.Student.findOne({ pid: 77 }).exec();
  const form = await schema.CS13.findOne({ student: student }).exec();
  const CS13 = mongoose.model('CS13', schema.CS13Schema);
  const result = await CS13.deleteOne({student: student}).exec();
  expect(result.deletedCount).toBe(1);

})

test('Test deleting a non-existent CS13', async() => {
  const student = await schema.Student.findOne({ pid: 1111111111111 }).exec();
  const form = await schema.CS13.findOne({ student: student }).exec();
  const CS13 = mongoose.model('CS13', schema.CS13Schema);
  const result = await CS13.deleteOne({student: student}).exec();
  expect(result.deletedCount).toBe(0);
})



test('Test deleting a student', async () => {
  const Student = mongoose.model('Student', schema.studentSchema);
  const result = await Student.deleteOne({ pid: 77 }).exec();
  expect(result.deletedCount).toBe(1);
})

test('Test deleting a non-existent student', async () => {
  const Student = mongoose.model('Student', schema.studentSchema);
  const result = await Student.deleteOne({ pid: 1111111111111 }).exec();
  expect(result.deletedCount).toBe(0);
})





