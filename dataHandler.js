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
  try {
    const Message = require("./models/Message");
    const data = req.body;
    const doc = await Message.create(data);

    // Send email
    req.emailText = `${data.message}\nmy linkedin - ${data.linkedin}`;
    next()
  } catch (e) {
    res.status(201).json([e.message])
  }
}

function sendMail(req, res) {
  // Nodejs module
  const nodemailer = require("nodemailer");

  // Email details
  const message = {
    to: process.env.EMAIL_RECEIVER,
    subject: `From ${req.body.name}`,
    text: req.emailText
  }

  // Connect to mail services (using gmail oAuth2)
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.AUTH_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    }
  });

  // Send email
  transporter.sendMail(message, (err, info) => {
    if (err) {
      res.status(201).json([err.message]);
      console.log(err.message);
      return
    }

    // If everything goes right
    res.sendStatus(200);
    console.log("success", info);
  })
}

async function storeReviewtoDatabase(req, res, next) {
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
    req.emailText = `I am a ${data.occupation} in ${data.organization}. I just reviewed your portfolio and here's my feedback -\n\n${data.fulfil == "yes" ? "Your website does fulfil its purpose" : "You portfolio is missing something. " + data["fulfil-suggestions"]}. ${data.color == "yes" ? "The colour pallete used is good" : "You need a change in colours. " + data["color-suggestions"]}.\nI will rate your website ${data.rating} out of 5.\n\n${data.internship == "yes" ? "I think you are ready to apply for internships" : data["internship-suggestions"]}. ${data.comments}.\n\nHere's my linkedin - ${data.linkedin}`
    next()
  } catch (e) {
    res.status(201).json([e.message]);
    console.log(e.message)
  }
}

module.exports = { validateMessageData, validateReviewData, storeMessageToDatabase, sendMail, storeReviewtoDatabase }