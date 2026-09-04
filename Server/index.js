require("dotenv").config();
const express = require("express");
const cors = require("cors");
const databaseConnection = require("./database");
const app = express();

app.use(express.json());

const router = require("./routes/bookRouter");

databaseConnection();

app.use(express.json());
app.use(cors());

app.use("/books", router);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
