// DOM
const myWorkSec = document.getElementById("my-work"),
  introSec = document.getElementById("introduction"),
  contactSec = document.getElementById("contact"),
  reviewSec = document.getElementById("review"),
  forms = document.querySelectorAll(".form"),
  linkToReviewSec = document.getElementById("cta-for-review"),
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
  const box = form.querySelector(".message"),
    errorList = box.querySelector(".list");

  // Show loading animation in the form UI
  form.classList.add("loading");

  hideMessageBoxAndClearErrorsInUI(box);

  // Return an array of errors as string
  const errors = validateData(form);
  if (errors !== []) {

    // Inform user

    // Make list nodes for each error and append it to the errorList
    errors.forEach(error => {
      const li = document.createElement("li");
      li.innerText = error;
      errorList.appendChild(li);
    });

    // Show the message box
    box.classList.remove("none");

  } else {

    // If no errors, then send form data
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

// Return an array of errors as string
function validateData(form) {

  // Array of errors to return
  let errors = [];

  // Validate common fields
  const nameField = form.querySelector("input[name='name']"),
    linkedinField = form.querySelector("input[name='linkedin']");

  // Regular expressions
  const nameRegex = /^([a-z]+\s?)+$/i,
    linkedinRegex = /^https:\/\/www.linkedin.com\/in\/[^']+\/$/;

  let name = nameField.value.trim(),
    linkedin = linkedinField.value.trim();

  // Validate name field
  if (name === '') {
    errors.push("Please enter your name.")

  } else {
    name = name.replace(/\s{2,}/g, " ");
    if (!nameRegex.test(name)) {
      errors.push("Only use letters and spaces in your name")
    }
  }
  nameField.value = name;

  // Validate linked field
  if (linkedin === '') {
    errors.push("Please enter your linkedin profile url.")

  } else {
    if (!linkedinRegex.test(linkedin)) {
      errors.push("Do not use apostrophe(\') in your LinkedIn")
    }
  }
  linkedinField.value = linkedin;

  // Validate different fields

  // Check the form type from its id attribute
  const formType = form.id.split("-", 1)[0];

  if (formType === 'message') {} else if (formType === 'review') {}

  return errors;
}

function sendData(form) {

}

function stopAndAskForReview(e) {
  if (reviewed) return;
  e.preventDefault();
  e.returnValue = 'Would?';
  const review = document.getElementById("review");
  review.classList.remove("none");
}