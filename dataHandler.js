const { regex, errorMessages } = require("./validator");

function validateMessageData(req, res, next) {
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

  if (errors.length == 0) {
    // If no error is found in the data, Store data
    next()
  } else {
    res.status(201).json(errors)
  }
}

function validateReviewData(req, res, next) {
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

    } else if (formData[field] == "no") {
      const message = checkTextField(formData, `${field}-suggestions`);
      if (message) {
        errors.push(message)
      }

    } else if (formData[field] != "yes") {
      errors.push("Do not temper the code.")
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

  if (errors.length == 0) {
    // If no error is found in the data, Store to database 
    next()
  } else {
    res.status(201).json(errors)
  }
}

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

async function storeMessageToDatabase(req, res, next) {
  const Message = require("./models/Message");
  try {
    const doc = await Message.create(req.body);
    next()
  } catch (e) {
    res.status(201).json([e.message])
  }
}

// TODO:
function sendMail(req, res) {
  // Save data to database


  // Connect to mail services

  // If everything goes right
  console.log("success");
  res.sendStatus(200)
}

async function storeReviewtoDatabase(req, res) {
  // Store to database
  const Review = require("./models/Review");

  const data = req.body;
  const standardFields = ["name", "linkedin", "comments", "rating"],
    choiceFields = ["fulfil", "internship", "color"];

  let review = {
    occupation: {
      role: data.occupation,
      organization: data.organization
    },
  }

  standardFields.forEach(field => {
    review[field] = data[field]
  });

  choiceFields.forEach(field => {
    review[field] = {
      choice: data[field] == "yes" ? "y" : "n",
      suggestions: data[`${field}-suggestions`]
    }
  });

  try {
    const doc = await Review.create(review);
    // If everything goes right
    res.sendStatus(200);
  } catch (e) {
    res.status(201).json([e.message]);
    console.log(e.message)
  }
}

module.exports = { validateMessageData, validateReviewData, checkTextField, storeMessageToDatabase, sendMail, storeReviewtoDatabase }