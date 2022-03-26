const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer();
const port = process.env.PORT || 3000;

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
  }

}

// TODO:
app.post("/api/form/message", upload.none(), (req, res, next) => {

  // The data sent is from the message form

  // Validate data
  const formData = req.body;
  const fields = ["name", "message", "linkedin"];
  let errors = [];
  fields.forEach(field => {
    if (formData[field] == undefined) {
      errors.push(`Please provide your ${field}`);

    } else {
      let value = formData[field];
      if (value === '') {
        errors.push(errorMessages.emptyTextField(field))

      } else {
        value = value.replace(/\s{2,}/g, " ");
        const pattern = regex(field);

        if (pattern !== undefined && !pattern.test(value)) {
          errors.push(errorMessages.regexNotMatch(field))
        }
        formData[field] = value;
      }
    }
  });

  // If no error is found in the data
  if (errors.length == 0) {
    // Send to email
    next()
  } else {
    res.status(201).json(errors)
  }

}, sendMail);

app.listen(port, () => console.log("Listening on " + port));

function sendMail(req, res) {
  // Connect to mail services
  console.log("success");

  // If everything goes right
  res.sendStatus(200)
}