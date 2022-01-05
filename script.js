// TODO: 
// Write suitable comments

// DOM
const myWorkSec = document.getElementById("my-work"),
  introSec = document.getElementById("introduction"),
  contactSec = document.getElementById("contact"),
  reviewSec = document.getElementById("review"),
  forms = document.querySelectorAll(".form"),
  linkToReviewSec = document.getElementById("cta-for-review"),
  radioFormInputs = document.querySelectorAll(".form .ui.radio"),
  clearFormBtns = document.querySelectorAll(".form button.clear");

// Global stats
let reviewed = true;

// Show project cards when parent is viewed
const myWorkSecObserver = new IntersectionObserver(showElemOnIntersection, { threshold: 0.1 });
myWorkSecObserver.observe(myWorkSec);

// Change position of local link (contact btn) when specific sections are in view
const contactBtnObserver = new IntersectionObserver(moveBtnOnIntersection);
contactBtnObserver.observe(introSec);
contactBtnObserver.observe(contactSec);

// EVENT LISTENERS

linkToReviewSec.addEventListener("click", displayReviewSec);
radioFormInputs.forEach(radio => {
  radio.addEventListener("click", toggleSuggestionField)
});
clearFormBtns.forEach(btn => {
  btn.addEventListener("click", clearFormFields);
});
forms.forEach(form => {
  form.addEventListener("submit", validateDataAndSubmit)
});

// Check if the website is reviewed
window.addEventListener("beforeunload", stopAndAskForReview);

function showElemOnIntersection(entries, observer) {
  const entry = entries[0];
  if (entry.isIntersecting) {
    const section = entry.target;
    section.querySelectorAll(".my-work-card").forEach(card => card.classList.add("show-my-work-card"));
    section.querySelectorAll(".my-work-btn").forEach(btn => btn.classList.add("show-my-work-btn"));
    observer.unobserve(section)
  }
}

function moveBtnOnIntersection(entries) {
  const entry = entries[0];
  btn = document.getElementById("cta-for-contact");
  if (entry.isIntersecting) {
    // position the button in the 'introduction' section
    btn.classList.remove("position")
  } else {
    // fix the button on bottom right of viewport
    btn.classList.add("position");
  }
}

function displayReviewSec() {
  document.getElementById("review").classList.remove("none")
}

function toggleSuggestionField() {

  // 'this' is the container containing radio input
  // 'radioField' contains the container containing 'this'
  // Each 'suggestionField' is the sibling of a 'radioField' and contains an input
  const radioInput = this.querySelector("input"),
    radioField = this.parentElement.parentElement,
    suggestionsField = radioField.nextElementSibling;

  // Each 'radioField' contains only two radio inputs with values - 'yes' & 'no'
  if (radioInput.value === "no") {

    // Show suggestions field to ask for advice
    suggestionsField.classList.remove("none");
    suggestionsField.classList.add("required");

  } else {

    // Hide suggestions field
    suggestionsField.classList.add("none");
    suggestionsField.classList.remove("required");
  }
}

function clearFormFields() {
  const form = this.parentElement,
    textFields = form.querySelectorAll("input[type='text'], textarea"),
    radioFields = form.querySelectorAll("input[type='radio']"),
    activeRatingField = form.querySelectorAll(".rating .icon.active"),
    messageBox = form.querySelector(".message");

  // Clear text fields
  textFields.forEach(field => field.value = '');

  // Clear radio
  radioFields.forEach(radio => radio.checked = false);

  // Clear rating
  activeRatingField.forEach(icon => icon.classList.remove("active"));

  hideMessageBoxAndClearErrorsInUI(messageBox);
}

// Checks form data for errors and send the data if zero errors found
function validateDataAndSubmit(e) {
  e.preventDefault();

  // Form element
  const form = this;

  // Message box element
  const box = form.querySelector(".message");

  // Show loading animation in the form UI
  form.classList.add("loading");

  hideMessageBoxAndClearErrorsInUI(box);

  // Return an array of errors as string
  const errors = validateData(form);
  if (errors.length !== 0) {

    // Inform user
    showErrorsInUI(box, errors);

  } else {

    // If no errors, then send form data and wait for response 
    sendData(form);
  }

  // Remove loading animation in the form UI
  form.classList.remove("loading");
}

function hideMessageBoxAndClearErrorsInUI(box) {
  // Hide the message box
  box.classList.add("none");

  // Clear all the errors
  const list = box.querySelector(".list");
  list.innerHTML = "";
}

function showErrorsInUI(messageBox, errorsArr) {

  // 'messageBox' is a 'div'
  // Make list nodes for each error and append it to the errorList
  const errorList = messageBox.querySelector(".list");
  errorsArr.forEach(error => {
    const li = document.createElement("li");
    li.innerText = error;
    errorList.appendChild(li);
  });

  // Show the message box
  messageBox.classList.remove("none");
}

// TODO:
// Return an array of errors as string
function validateData(form) {

  // Array of errors to return
  let errors = [];

  const textFields = form.querySelectorAll(".required.field input[type='text'], .required.field textarea");

  // Validate text fields
  textFields.forEach(field => {
    const message = checkTextField(field);
    if (message) {
      errors.push(message)
    }
  });

  // Check the form from its id attribute
  if (form.id === 'review-form') {
    const radioFields = form.querySelectorAll(".choices"),
      activeRatingField = form.querySelectorAll(".rating .icon.active");

    // Validate radio fields
    radioFields.forEach(field => {
      const message = checkRadioField(field.querySelectorAll("input[type='radio']"));
      if (message) {
        errors.push(message)
      }
    });

    // Validate Rating field
    if (activeRatingField.length === 0) {
      errors.push("Please rate this portfolio.")
    }
  }

  return errors;
}

// Takes an input element and return an error string, undefined otherwise
function checkTextField(input) {

  // Regular expressions to check input text data
  const regex = function() {
    const patterns = {
      "name": /^([a-z]+\s?)+$/i,
      "linkedin": /^https:\/\/www.linkedin.com\/in\/.+\/$/,
      "occupation": /^[\w-\(\)]+$/,
      "organization": /^[\w-\(\),]+$/
    }
    return patterns[input.getAttribute("name")]
  }

  // Messages to be displayed in the UI 
  const errorMessages = {

    emptyTextField: function() {

      const name = input.getAttribute("name");
      if (name.includes("suggestions")) {

        switch (name.split("-", 1)[0]) {
          case "fulfil":
            return 'Please enter what this website needs.';
          case "color":
            return "Please enter what colors should be used.";
          default:
            return "Please enter what I need more to become internship ready."
        }
      }
      return `Please enter your ${name}.`
    },

    regexNotMatch: function() {

      const messages = {
        "name": "Only use letters and spaces in your name.",
        "linkedin": "Your linkedin url should be like https:\/\/www.linkedin.com\/in\/ayushweb\/",
        "occupation": "Only use alphabets, numbers, underscore( _ ), hyphen( - ) and round brackets ( () ) in your occupation.",
        "organization": "Only use alphabets, numbers, underscore( _ ), hyphen( - ), comma( , ) and round brackets ( () ) in your organization."
      }
      return messages[input.name];
    }
  }

  let value = input.value.trim();
  input.value = value;
  if (value === '') {
    return errorMessages.emptyTextField()
  }

  value = value.replace(/\s{2,}/g, " ");
  input.value = value;
  const pattern = regex();
  if (pattern !== undefined && !pattern.test(value)) {
    return errorMessages.regexNotMatch();
  }
}

function checkRadioField(radioNodeList) {
  const errorMessages = {
    "fulfil": "Please answer - this website does the work?",
    "color": "Select 'yes' or 'can be better' for the colours used in the site.",
    "internship": "Am I internship ready? Select 'yes' or 'no'."
  }

  let checked = 0;

  for (let radio of radioNodeList) {
    if (radio.checked) {
      checked++;

      // Check if negative option selected
      if (radio.value === "no") {

        // Check for suggestions
        const textInput = document.querySelector(`input[name='${radio.name}-suggestions']`);
        return checkTextField(textInput);
      }
    }
  }

  // Check if any radio checked
  if (checked === 0) {
    return errorMessages[radioNodeList[0].name]
  } else if (checked > 1) {
    return "Do not apply your brains and change the code"
  }
}

// TODO:
async function sendData(form) {
  // Take data from UI
  // Send it through fetch 'POST'
  // Wait for response
  // Check for error code - 200 for ok and some other code for error
  // Inform the user about the status
  // If errors found, get the array of errors from response in json and show them in ui
}

function stopAndAskForReview(e) {
  if (reviewed) return;
  e.preventDefault();
  e.returnValue = 'Would?';
  const review = document.getElementById("review");
  review.classList.remove("none");
}