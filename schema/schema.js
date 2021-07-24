const graphql = require("graphql")
const mongoose = require("mongoose")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList, 
  GraphQLInt,
  UniversalType
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
        console.log(args._id)
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
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})


// async resolve(parent, args) {
//   let res = []
//   console.log(parent)
//   for(let i=0;i<parent.notes.length;i++) {
//     await notes.findById(parent.notes[i], (err, data) => {
//       //console.log(data)
//       res.push(data)
//     })

//   }
// }