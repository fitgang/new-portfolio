var express = require("express");
var bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer();
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
});

// app.use(bodyParser.urlencoded({ extended: true }));

// TODO:
app.post("/message", upload.none(), (req, res, next) => {

  // Validate data
  if (req.body) {
    res.sendStatus(200);
    return
  }

  res.status(201).send("Provide data");

  // Send to your mail
  // give response

});

app.listen(port, () => console.log("Listening on " + port));