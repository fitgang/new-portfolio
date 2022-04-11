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
    console.log(success)
  } catch (e) {
    res.status(201).json([e.message]);
    console.log(e.message)
  }
}

module.exports = { storeMessageToDatabase, sendMail, storeReviewtoDatabase }