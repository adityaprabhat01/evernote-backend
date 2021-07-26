const graphql = require("graphql")
const mongoose = require("mongoose")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList, 
  GraphQLInt,
} = graphql

const notebooks = require("../models/Notebook")
const notes = require("../models/Notes")
const users = require("../models/Users")

const NotesType = new GraphQLObjectType({
  name: "Notes",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLID }
  })
})

const NotebookType = new GraphQLObjectType({
  name: "Notebook",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    notesCount: { type: GraphQLInt },
    notes: { 
      type: new GraphQLList(NotesType),      
      async resolve(parent, args) {
        return (await notebooks.findById(parent._id).populate({ 
          path: 'notes',
          populate: { path: 'notes' }
        })).notes
      }
    }
  })
})

const NoteContentType = new GraphQLObjectType({
  name: "NoteContent",
  fields: () => ({
    _id: { type: GraphQLID },
    //notebook_id: { type: GraphQLID },
    name: { type: GraphQLString },
    content: { type: GraphQLString }
  })
})

const UsersType = new GraphQLObjectType({
  name: "Users",
  fields: () => ({
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  })
})

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    notebooks: {
      type: new GraphQLList(NotebookType),      
      resolve(parent, args){
        return notebooks.find({});
      }
    },
    notes: {
      type: new GraphQLList(NotesType),
      resolve(parent, args) {
        return notes.find({})
      }
    },
    note: {
      type: NotesType,
      args: { _id: { type: GraphQLID } },
      resolve(parent, args){
        return notes.findById(args._id)
      }
    },
    notebook: {
      type: NotebookType,
      args: { _id: { type: GraphQLID } },
      async resolve(parent, args) {
        return notebooks.findById(args._id)
      }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addNotebook: {
      type: NotebookType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args){
        let notebook = new notebooks({
          name: args.name,
        })
        return notebook.save()
      }
    },
    addNote: {
      type: NotesType,
      args: {
        name: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: GraphQLString },
        notebookId: { type: GraphQLString }
      },
      async resolve(parent, args) {
        let res;
        await notes.create({ 
          name: args.name,
          content: args.content,
          authorId: args.authorId
        }).then(async note => {
          res = note
          await notebooks.findOneAndUpdate(
            { _id: args.notebookId },
            { $push: { notes: note._id } },
            { new: true }
          )
        })
        return res
      }
    },
    addNoteContent: {
      type: NoteContentType,
      args: {
        note_id: { type: GraphQLID },
        //notebook_id: { type: GraphQLID },
        //author_id: { type: GraphQLID },
        name: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(parent, args) {
        return notes.findOneAndUpdate(
          { _id: args.note_id },
          { content: args.content },
          { new: true }
        )
      }
    },
    deleteNote: {
      type: NotesType,
      args: {
        note_id: { type: GraphQLID },
        notebook_id: { type: GraphQLID }
      },
      resolve(parent, args) {
        return notebooks.findByIdAndUpdate(
          { _id: args.notebook_id },
          { $pull: { notes: args.note_id } }
        )
        .then(data => {
          notes.findByIdAndDelete(args.note_id).then(data => {})
        })
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
