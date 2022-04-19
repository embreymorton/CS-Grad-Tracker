module.exports = {
  async up(db, client) {
    // sets advisorSignature fields in forms to be: 
    // `true` if field exists and is not an empty string
    // `false` if field exists and is an empty string (we should make this the case for whitespace only strings too)
    // doesn't change anything if the field doesn't exist
    // does lose data in the case where the signer is not the same person as the advisor 
    ['cs01', 'cs02', 'cs03', 'cs13'].forEach(async (schema) => {
      await db.collection(schema).updateMany({advisorSignature: {$exists: true, $ne: ""}}, {$set: {advisorSignature: true}})
      await db.collection(schema).updateMany({advisorSignature: {$exists: true, $eq: ""}}, {$set: {advisorSignature: false}})
    })
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
