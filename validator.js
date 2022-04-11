"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.regex = exports.errorMessages = void 0;

// Regular expressions to check input text data
var regex = function regex(name) {
  var patterns = {
    "name": /^([a-z]+\s?)+$/i,
    "linkedin": /^https:\/\/www.linkedin.com\/in\/.+\/$/,
    "occupation": /^[\w-\(\)]+$/,
    "organization": /^[\w-\(\),]+$/
  };
  return patterns[name];
}; // Messages to be displayed in the UI 


exports.regex = regex;
var errorMessages = {
  emptyTextField: function emptyTextField(name) {
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

    return "Please enter your ".concat(name, ".");
  },
  regexNotMatch: function regexNotMatch(name) {
    var messages = {
      "name": "Only use letters and spaces in your name.",
      "linkedin": "Your linkedin url should be like https:\/\/www.linkedin.com\/in\/ayushweb\/",
      "occupation": "Only use alphabets, numbers, underscore( _ ), hyphen( - ) and round brackets ( () ) in your occupation.",
      "organization": "Only use alphabets, numbers, underscore( _ ), hyphen( - ), comma( , ) and round brackets ( () ) in your organization."
    };
    return messages[name];
  },
  emptyRadioField: function emptyRadioField(name) {
    var messages = {
      "fulfil": "Please answer - this website does the work?",
      "color": "Select 'yes' or 'can be better' for the colours used in the site.",
      "internship": "Am I internship ready? Select 'yes' or 'no'."
    };
    return messages[name];
  }
};
exports.errorMessages = errorMessages;
