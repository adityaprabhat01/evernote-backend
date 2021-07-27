const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes'
  }],
  notebooks: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Notebooks'
  }],
})

const users = mongoose.model('users', userSchema)
module.exports = users