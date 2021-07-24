const mongoose = require("mongoose")
const Schema = mongoose.Schema

const notebookSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  notesCount: {
    type: Number
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Notes'
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId
  }
})

const Notebooks = mongoose.model('Notebooks', notebookSchema)
module.exports = Notebooks