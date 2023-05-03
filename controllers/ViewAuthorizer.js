const {Student, Faculty} = require("../models/schema.js")

/**
 * A class that manager who can view/access certain elements on the form.
 * 
 * TODO: divide isComplete from opts into 2 components and incorporate it into ViewAuthorizer
 * 1. studentCompleted - student has finished entering form values and at least one faculty member has *confirmed* that they have viewed it (eg. checking a checkbox)
 * 2. totalCompleted - ALL faculty members have approved the form -- not really useful for access, but useful for showing a multiform is complete
 */
class ViewAuthorizer {
  // public class fields
  isStudent
  isAdvisor
  isAdmin

  /**
   * @param {Student | Faculty} viewer
   * @param {Boolean} isAdvisor only used if viewer is a Student
   */
  constructor (viewer, isAdvisor = false, studentComplete = false, totalComplete = false) {
    if (!(viewer instanceof Student || viewer instanceof Faculty)) {
      throw new Error('The viewer passed in must be either a Student of Faculty from the database.')
    }
    this.viewer = viewer
    this.isStudent = viewer instanceof Student
    
    const isFaculty = !this.isStudent
    this.isAdvisor = isFaculty && isAdvisor
    this.isAdmin = isFaculty && viewer.admin
  }

  /**
   * Returns true if the viewer meets the conditions. Note: If viewer is an admin, the function will return true regardless.
   * @param {String} levels a string containing any combination of 'student', 'faculty', 'advisor', 'admin' separated by spaces
   * eg. `allow('admin student')` will return true if the current logged in user is a student or admin, but false if they are an advisor or other faculty member
   * @param  {...any} additional a list of 2-ples of where the first value is the name of a user's property to check and the second value is the value that needs to match
   * eg. `allow('admin', [['fullName', 'Alice Bass'], ['pid', 123456789]])` will return true if an admin is logged in, or a user with a full name 'Alice Bass' is logged in, or a user with a pid 123456789 is logged in
   */
  allow(levels, ...additional) {
    if (this.isAdmin) {
      return true
    }
    return this.hasLevel(levels, ...additional)
  }

  /**
   * Similar to allow, but does not implicitly return true for admins.
   * See `allow` method for argument syntax. 
   * We don't call it `is` because `Object.prototype.is` is a thing, but it's semantically equivalent.
   * @param {String} levels 
   * @param  {...any} additional 
   */
  hasLevel(levels, ...additional) {
    const allowedLevels = levels.split(' ')
    if (allowedLevels.includes('student') && this.isStudent
        || allowedLevels.includes('faculty') && !this.isStudent
        || allowedLevels.includes('advisor') && this.isAdvisor
        || allowedLevels.includes('admin') && this.isAdmin) {
      return true
    }
    return additional.some(([field, value]) => {
      if (field == '_id') { // special case for object ids
        return this.viewer?.[field].equals(value)
      }

      return this.viewer?.[field] == value
    })
  }

  /**
   * Returns true if the viewer is does NOT meet the levels or conditions.
   * 
   * See `allow` method for argument syntax.
   * @param {String} levels 
   * @param  {...any} additional 
   */
  not(levels, ...additional) {
    return !this.hasLevel(levels, ...additional)
  }

}

module.exports = {ViewAuthorizer}