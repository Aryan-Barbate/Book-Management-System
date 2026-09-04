require("dotenv").config();
const express = require("express");
const cors = require("cors");
const databaseConnection = require("./database");
const app = express();

app.use(cors());
app.use(express.json());

const router = require("./routes/bookRouter");

databaseConnection();

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Book Management API is running" });
});

app.use("/books", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
