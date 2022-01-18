// TODO: 
// Write suitable comments

// DOM
const myWorkSec = document.getElementById("my-work"),
  introSec = document.getElementById("introduction"),
  contactSec = document.getElementById("contact"),
  reviewSec = document.getElementById("review"),
  forms = [contactSec.querySelector(".form"), reviewSec.querySelector(".form")],
  linkToReviewSec = document.getElementById("cta-for-review"),
  radioFormInputs = document.querySelectorAll(".form .ui.radio"),
  clearFormBtns = document.querySelectorAll(".form button.clear");

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
  btn.addEventListener("click", (e) => {
    const form = e.currentTarget.parentElement;
    clearFormFields(form);
  })
});
forms.forEach(form => {
  form.addEventListener("submit", validateDataAndSubmit)
});

// Shows elements when a specific section is viewed
function showElemOnIntersection(entries, observer) {
  const entry = entries[0];

  if (entry.isIntersecting) {
    const section = entry.target;

    // Show elements
    section.querySelectorAll(".my-work-card, .my-work-btn").forEach(elem => elem.classList.add("show"));
    observer.unobserve(section)
  }
}

// Positions a button according to the section viewed
function moveBtnOnIntersection(entries) {
  const entry = entries[0];
  btn = document.getElementById("cta-for-contact");

  if (entry.isIntersecting) {

    // position the button in the 'introduction' section
    btn.classList.remove("position");
    return;
  }

  // fix the button on bottom right of viewport
  btn.classList.add("position");
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
    showSuggestionsField(suggestionsField);
    return;
  }

  // Hide suggestions field
  hideSuggestionsField(suggestionsField);
}

function showSuggestionsField(field) {

  const input = field.querySelector("input");
  field.classList.remove("none");
  field.classList.add("required");
  input.disabled = false;
}

function hideSuggestionsField(field) {

  const input = field.querySelector("input")
  field.classList.add("none");
  field.classList.remove("required");
  input.disabled = true;
  input.value = '';
}

function clearFormFields(form) {

  const textFields = form.querySelectorAll("input[type='text'], textarea"),
    radioFields = form.querySelectorAll("input[type='radio']"),
    suggestionsFields = form.querySelectorAll(".field.suggestions"),
    activeRatingField = form.querySelectorAll(".rating .icon.active"),
    messageBox = form.querySelector(".message");

  // Clear text fields
  textFields.forEach(field => field.value = '');

  // Clear radio
  radioFields.forEach(radio => radio.checked = false);

  // Hide and clear
  suggestionsFields.forEach(field => hideSuggestionsField(field));

  // Clear rating
  activeRatingField.forEach(icon => icon.classList.remove("active"));

  hideMessageBoxAndClearErrorsInUI(messageBox);
}

// TODO:
// Checks form data for errors and send the data if zero errors found
async function validateDataAndSubmit(e) {
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

    // TODO: 
    // If no errors, then send form data and wait for response 
    const errors = await sendData(form);
    if (errors.length !== 0) {

      showErrorsInUI(box, errors);

    } else {
      showSuccessInUI(box);
      clearFormFields(form);
    }
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
  const heading = messageBox.querySelector(".header");
  heading.innerText = "We have some issues";

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

function showSuccessInUI(messageBox) {
  const heading = messageBox.querySelector(".header");
  heading.innerText = "SUCCESS";

  // Show the message box
  messageBox.classList.remove("none")
}

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
      rating = form.querySelectorAll(".rating .icon.active").length;

    // Validate radio fields
    radioFields.forEach(field => {
      const message = checkRadioField(field.querySelectorAll("input[type='radio']"));
      if (message) {
        errors.push(message)
      }
    });

    // Validate Rating field
    if (rating === 0) {
      errors.push("Please rate this portfolio.")

    } else if (rating > 5) {
      errors.push("Do not temper the code or the form.")
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
            return "Please enter what I need more to become internship ready.";
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

  // Messages to be displayed in the UI 
  const errorMessages = {
    "fulfil": "Please answer - this website does the work?",
    "color": "Select 'yes' or 'can be better' for the colours used in the site.",
    "internship": "Am I internship ready? Select 'yes' or 'no'."
  }

  // Number of selections
  let checked = 0;

  for (let radio of radioNodeList) {
    if (radio.checked) {
      checked++;
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
// Sends data to server
async function sendData(form) {

  const formType = form.id.split("-", 1)[0],
    messageBox = form.querySelector(".ui.message");

  // Send data to this url
  const url = `/${formType}`;

  // Take data from UI
  let data = new FormData(form);

  // If the review form is submitted
  if (formType === "review") {
    const rating = form.querySelectorAll(".rating .icon.active").length;
    data.append("rating", rating)
  }

  // Send data and wait for response
  const response = await fetch(url, {
    method: "POST",
    body: data,
  });

  // Inform user about the response
  if (response.status === 200) {
    return []
  }

  // Show errors if found, there should be an array of strings
  const errors = await response.json();
  return errors
}