const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql")
const cors = require('cors')
require("dotenv").config()

const schema = require("./schema/schema")

const app = express();

app.use(
  cors({
    origin: ["https://cool-creponne-3a0e15.netlify.app", "http://localhost:3000"],
  })
);
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next()
})
const PORT = process.env.PORT || 4000;

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