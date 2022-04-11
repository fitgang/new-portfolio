const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer();
const port = process.env.PORT || 3000;
const { storeMessageToDatabase, sendMail, storeReviewtoDatabase } = require("./dataHandler");

mongoose.connect(process.env.MONGO_URI, () => console.log("connected"), (e) => console.error(e));

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
});

// Regular expressions to check input text data
const regex = function(name) {
  const patterns = {
    "name": /^([a-z]+\s?)+$/i,
    "linkedin": /^https:\/\/www.linkedin.com\/in\/.+\/$/,
    "occupation": /^[\w-\(\)]+$/,
    "organization": /^[\w-\(\),]+$/
  }
  return patterns[name]
}

// Messages to be displayed in the UI 
const errorMessages = {

  emptyTextField: function(name) {
    if (name.includes("suggestions")) {
      switch (name.split("-", 1)[0]) {
        case "fulfil":
          return 'Please enter what this website needs.';
        case "color":
          return "Please enter what colors should be used.";
        default:
          return "Please enter what I need more to become internship ready.";
      }
    }
    return `Please enter your ${name}.`
  },

  regexNotMatch: function(name) {
    const messages = {
      "name": "Only use letters and spaces in your name.",
      "linkedin": "Your linkedin url should be like https:\/\/www.linkedin.com\/in\/ayushweb\/",
      "occupation": "Only use alphabets, numbers, underscore( _ ), hyphen( - ) and round brackets ( () ) in your occupation.",
      "organization": "Only use alphabets, numbers, underscore( _ ), hyphen( - ), comma( , ) and round brackets ( () ) in your organization."
    }
    return messages[name];
  },

  emptyRadioField: function(name) {
    const messages = {
      "fulfil": "Please answer - this website does the work?",
      "color": "Select 'yes' or 'can be better' for the colours used in the site.",
      "internship": "Am I internship ready? Select 'yes' or 'no'."
    }
    return messages[name]
  }
}

app.post("/api/form/message", upload.none(), (req, res, next) => {

  // The data sent is from the message form

  // Validate data
  const formData = req.body;
  const fields = ["name", "message", "linkedin"];
  let errors = [];
  fields.forEach(field => {
    const message = checkTextField(formData, field);
    if (message) {
      errors.push(message)
    }
  });

  // If no error is found in the data
  if (errors.length == 0) {
    // Send to email
    next()
  } else {
    res.status(201).json(errors)
  }

}, storeMessageToDatabase, sendMail);

app.post("/api/form/review", upload.none(), (req, res, next) => {

  // The data sent is from the review form

  // Validate data
  const formData = req.body;
  const textFields = ["name", "occupation", "organization", "comments", "linkedin"],
    radioFields = ["fulfil", "color", "internship"],
    ratingField = ["rating"];
  let errors = [];

  // Validate required text data
  textFields.forEach(field => {
    const message = checkTextField(formData, field);
    if (message) {
      errors.push(message)
    }
  });

  // Validate yes or no questions data
  radioFields.forEach(field => {
    if (formData[field] == undefined) {
      errors.push(errorMessages.emptyRadioField(field))

    } else {

      if (formData[field] == "no") {
        const message = checkTextField(formData, `${field}-suggestions`);
        if (message) {
          errors.push(message)
        }

      } else if (formData[field] != "yes") {
        errors.push("Do not temper the code.")
      }
    }
  });

  // Validate rating data
  ratingField.forEach(field => {
    if (formData[field] == undefined) {
      errors.push(errorMessages.emptyRadioField(field))

    } else {
      const rating = Number(formData[field]);
      if (isNaN(rating)) {
        errors.push("Kripya zyada dimaag na chalayein.")

      } else if (rating < 1 || rating > 5) {
        errors.push("Please rate out of 5.")
      }
    }
  });

  // If no error is found in the data
  if (errors.length == 0) {
    // Notify admin and store to database 
    next()
  } else {
    res.status(201).json(errors)
  }

}, storeReviewtoDatabase);

app.listen(port, () => console.log("Listening on " + port));

function checkTextField(formData, field) {
  if (formData[field] == undefined) {
    return `Please provide your ${field}`;
  }

  let value = formData[field];
  if (value === '') {
    return errorMessages.emptyTextField(field)
  }

  value = value.replace(/\s{2,}/g, " ");
  formData[field] = value;

  const pattern = regex(field);
  if (pattern !== undefined && !pattern.test(value)) {
    return errorMessages.regexNotMatch(field)
  }
}