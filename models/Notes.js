const mongoose = require("mongoose")
const Schema = mongoose.Schema

const notesSchema = new Schema({
  name: {
    type: String,
  },
  content: {
    type: String
  },
  authorId: {
    type: String
  },
  notebookId: {
    type: String
  }
})

const Notes = mongoose.model('Notes', notesSchema)
module.exports = Notes