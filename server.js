const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer();
const port = process.env.PORT || 3000;
const { validateMessageData, validateReviewData, storeMessageToDatabase, sendMail, storeReviewtoDatabase } = require("./dataHandler");

mongoose.connect(process.env.MONGO_URI, () => console.log("connected"), (e) => console.error(e));

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
});

// TODO:
// app.get("/api/reviews", getReviewsFromDB, generateMarkupAndSend);

app.post("/api/form/message", upload.none(), validateMessageData, storeMessageToDatabase, sendMail);

app.post("/api/form/review", upload.none(), validateReviewData, storeReviewtoDatabase, sendMail);

app.listen(port, () => console.log("Listening on " + port));