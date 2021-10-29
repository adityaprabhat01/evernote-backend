const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql")
const cors = require('cors')
require("dotenv").config()

const schema = require("./schema/schema")

const app = express();

app.use(cors());
const PORT = 4000;

const dbURI = process.env.DBURI
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then((res) => {
    app.listen(PORT);
    console.log("Connected to DB, server up on port " + PORT);
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/graphql", graphqlHTTP({
  schema,
  graphiql: true
}))