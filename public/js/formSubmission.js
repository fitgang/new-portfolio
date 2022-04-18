import { regex, errorMessages } from "./validator.js";

const forms = document.querySelectorAll(".form"),
  clearFormBtns = document.querySelectorAll(".form button.clear"),
  radioFormInputs = document.querySelectorAll(".form .ui.radio");

// Event listeners
clearFormBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const form = e.currentTarget.parentElement;
    clearFormFields(form);
    hideMessageBoxAndClearErrorsInUI(form.querySelector(".message"))
  })
});

radioFormInputs.forEach(radio => {
  radio.addEventListener("click", toggleSuggestionField)
});

forms.forEach(form => {
  form.addEventListener("submit", validateDataAndSubmit)
});

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
  if (errors.length != 0) {

    // Inform user
    showErrorsInUI(box, errors);

  } else {

    // If no errors, then send form data and wait for response 
    const errors = await sendData(form);
    console.log(errors);
    if (errors.length !== 0) {
      showErrorsInUI(box, errors);
    } else {
      showSuccessInUI();
      clearFormFields(form);
    }
  }

  // Remove loading animation in the form UI
  form.classList.remove("loading");
}

// Return an array of errors as string
function validateData(form) {

  // Array of errors to return
  let errors = [];

  const textFields = form.querySelectorAll(".required.field input[type='text'], .required.field textarea");

  // Validate text fields
  textFields.forEach((field) => {
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
  let value = input.value.trim();

  input.value = value;
  if (value === '') {
    return errorMessages.emptyTextField(input.getAttribute("name"))
  }

  value = value.replace(/\s{2,}/g, " ");
  input.value = value;
  const pattern = regex(input.getAttribute("name"));
  if (pattern !== undefined && !pattern.test(value)) {
    return errorMessages.regexNotMatch(input.getAttribute("name"));
  }
}

function checkRadioField(radioNodeList) {
  // Number of selections
  let checked = 0;

  for (let radio of radioNodeList) {
    if (radio.checked) {
      checked++;
    }
  }
  // Check if any radio checked
  if (checked === 0) {
    return errorMessages.emptyRadioField(radioNodeList[0].name)
  } else if (checked != 1) {
    return "Do not apply your brains and change the code"
  }
}

// Sends data to server
async function sendData(form) {

  const formType = form.id.split("-", 1)[0];

  // Send data to this url
  const url = `/api/form/${formType}`;

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

// Helper functions

function clearFormFields(form) {

  const textFields = form.querySelectorAll("input[type='text'], textarea"),
    radioFields = form.querySelectorAll("input[type='radio']"),
    suggestionsFields = form.querySelectorAll(".field.suggestions"),
    activeRatingField = form.querySelectorAll(".rating .icon.active");

  // Clear text fields
  textFields.forEach(field => field.value = '');

  // Clear radio
  radioFields.forEach(radio => radio.checked = false);

  // Hide and clear
  suggestionsFields.forEach(field => hideSuggestionsField(field));

  // Clear rating
  activeRatingField.forEach(icon => icon.classList.remove("active"));
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

  informUser("Problem occured.", "warning");

  // Show the message box
  messageBox.classList.remove("none");
  messageBox.scrollIntoView();
}

function showSuccessInUI() {
  informUser("Sent successfully.", "success")
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


function createMessageComponent(message, type) {
  const div = document.createElement("div");
  div.className = `${type} message`;
  div.innerText = message;
  return div;
}

function informUser(message, type) {
  const messageElem = createMessageComponent(message, type);
  showMessage(messageElem);
}

function showMessage(elem) {
  const messageBox = document.getElementById("message-box");
  // Render element node
  messageBox.insertAdjacentElement('afterbegin', elem);

  // Hide after a time
  setTimeout(() => elem.remove(), 5000)
}