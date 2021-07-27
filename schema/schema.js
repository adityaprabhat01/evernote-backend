const graphql = require("graphql");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
} = graphql;

const notebooks = require("../models/Notebook");
const notes = require("../models/Notes");
const users = require("../models/User");

const NoteType = new GraphQLObjectType({
  name: "Notes",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    content: { type: GraphQLString },    
  }),
});

const NotebookType = new GraphQLObjectType({
  name: "Notebook",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    notes: {
      type: new GraphQLList(NoteType),
      async resolve(parent, args) {
        return (
          await notebooks.findById(parent._id).populate({
            path: "notes",
            populate: { path: "notes" },
          })
        ).notes;
      },
    },
  }),
});

const NotebookListType = new GraphQLObjectType({
  name: "NotebookList",
  fields: () => ({
    _id: { type: GraphQLID },
  }),
});

const NoteListType = new GraphQLObjectType({
  name: "NoteList",
  fields: () => ({
    _id: { type: GraphQLID },
  }),
});

const NoteContentType = new GraphQLObjectType({
  name: "NoteContent",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    notebooks: {
      type: new GraphQLList(NotebookListType),
    },
    notes: {
      type: new GraphQLList(NoteListType),
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {

    notebooks: {
      type: new GraphQLList(NotebookType),
      args: { _id: { type: GraphQLID } },
      async resolve(parent, args) {
        return (await users.findById(args._id).populate({
          path: "notebooks",
          populate: { path: "notebooks" },
        })).notebooks
      },
    },

    notes: {
      type: new GraphQLList(NoteType),
      args: { _id: { type: GraphQLID } },
      async resolve(parent, args) {
        return (await users.findById(args._id).populate({
          path: "notes",
          populate: { path: "notes" },
        })).notes
      },
    },

    note: {
      type: NoteType,
      args: { _id: { type: GraphQLID } },
      resolve(parent, args) {
        return notes.findById(args._id);
      },
    },

    notebook: {
      type: NotebookType,
      args: { _id: { type: GraphQLID } },
      resolve(parent, args) {
        return notebooks.findById(args._id);
      },
    },
    
    user: {
      type: UserType,
      args: { _id: { type: GraphQLID } },
      resolve(parent, args) {
        return users.findById(args._id);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addNotebook: {
      type: NotebookType,
      args: {
        name: { type: GraphQLString },
      },
      resolve(parent, args) {
        let notebook = new notebooks({
          name: args.name,
        });
        return notebook.save();
      },
    },
    addNote: {
      type: NoteType,
      args: {
        name: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: GraphQLString },
        notebookId: { type: GraphQLString },
      },
      async resolve(parent, args) {
        let res;
        await notes
          .create({
            name: args.name,
            content: args.content,
            authorId: args.authorId,
          })
          .then(async (note) => {
            res = note;
            await notebooks.findOneAndUpdate(
              { _id: args.notebookId },
              { $push: { notes: note._id } },
              { new: true }
            );
          });
        return res;
      },
    },
    addNoteContent: {
      type: NoteContentType,
      args: {
        note_id: { type: GraphQLID },
        name: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(parent, args) {
        return notes.findOneAndUpdate(
          { _id: args.note_id },
          { content: args.content },
          { new: true }
        );
      },
    },
    deleteNote: {
      type: NoteType,
      args: {
        note_id: { type: GraphQLID },
        notebook_id: { type: GraphQLID },
      },
      resolve(parent, args) {
        return notebooks
          .findByIdAndUpdate(
            { _id: args.notebook_id },
            { $pull: { notes: args.note_id } }
          )
          .then((data) => {
            notes.findByIdAndDelete(args.note_id).then((data) => {});
          });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
