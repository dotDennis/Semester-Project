// declare containers & elements
const form = document.querySelector(".form");
const submitButton = document.querySelector(".btn-submit");
const statusContainer = document.querySelector(".status-container");

// api url etc.

const API = "https://gamehub-api.dennisl.no/wp-json/contact-form-7/v1/contact-forms/56/feedback";

// Validate input values

// Regex to check if the email is valid, returns ? true : false
function validateEmail(email) {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const patternMatches = regEx.test(email.value);
  return patternMatches;
}

// check if input larger or equal to minLength of 'x'
function checkLength(input, minLen) {
  if (input.value.trim().length >= minLen) {
    return true;
  } else {
    return false;
  }
}

const formInputs = () => [form["firstName"], form["lastName"], form["email"], form["message"]];

// apply error styling to item(s) passed in as through 'input'. uses (input.target) = false if it's an eventlistener, and (input.target) = true if it's not.
// because the eventListener does not have a .target value
function errorStyling(input) {
  const target = input.target ? input.composedPath()[0] : form[input];
  target.style.borderBottom = "3px solid #ffa7a7";
  target.nextElementSibling.style.display = "block";
}

// apply success styling to item(s)
function successStyling(input) {
  const target = input.target ? input.composedPath()[0] : form[input];
  target.style.borderBottom = "3px solid #00dd00";
  target.nextElementSibling.style.display = "none";
}

// Self explanatory? "if" inputName = firstName run case "firstName": return boolean ? true : false.
function isInputValid(inputName) {
  const [firstName, lastName, email, message] = formInputs();
  if (inputName === "firstName") {
    return checkLength(firstName, 1);
  }
  if (inputName === "lastName") {
    return checkLength(lastName, 1);
  }
  if (inputName === "email") {
    return validateEmail(email);
  }
  if (inputName === "message") {
    return checkLength(message, 15);
  }
  return false;
}

// Function connected from event listener, to check for input changes. Then check if its valid, then apply respsctive styling
function inputCheckValid(el) {
  const input = el.target.name;
  if (!isInputValid(input)) {
    errorStyling(el);
  }
  if (isInputValid(input)) {
    successStyling(el);
  }
}

// add input event listener
formInputs().forEach((element) => {
  element.addEventListener("input", inputCheckValid);
});

// 'Submit' (button click) form part of the validation

// If this is passed, form is valid.
function validForm() {
  const [firstName, lastName, email, message] = formInputs();
  const isInputValidArr = [checkLength(firstName, 1), checkLength(lastName, 1), validateEmail(email), checkLength(message, 15)];

  // if n (in this case, the array objects) === true, it will return true, otherwise no return.
  function isTrue(n) {
    return n === true;
  }

  // every object in the array gets passed through the 'isTrue' function, return boolean ? true:false
  const isFormValid = isInputValidArr.every(isTrue);
  return isFormValid;
}

// function check every input through a functon of if statements if it's valid. If this returns true, apply successStyling, else if return = false, apply errorStyling.
function submitCheckAll() {
  formInputs().forEach(function (input) {
    isInputValid(input.name) ? successStyling(input.name) : errorStyling(input.name);
  });
}

// on button click, check if form is valid, it form isn't valid, check all inputs & apply respective styling to them induvidually.
// else clear the form & display a success message
async function handleSubmit() {
  statusContainer.removeAttribute("style");
  const body = new FormData(form);

  if (!validForm()) {
    submitCheckAll();
    form.removeAttribute("style");
  } else {
    submitButton.innerHTML = "Sending...";

    try {
      const response = await fetch(API, { method: "POST", body });
      const json = await response.json();

      if (json.status === "mail_sent" && validForm()) {
        form.reset();
        submitButton.innerHTML = "Send";
        statusContainer.innerHTML = `<p class="success-txt">Your message has been sent</p>`;
        statusContainer.style.display = "block";
        formInputs().forEach((input) => {
          input.removeAttribute("style");
        });
      } else {
        sendError(json.message);
      }
    } catch (error) {
      sendError(error);
    } finally {
      window.scrollTo({ top: 0 });
    }
  }
}

function sendError(error) {
  submitButton.innerHTML = "error";
  submitButton.disabled = true;
  setTimeout(resetButton, 7000);
  statusContainer.innerHTML = `<p class='error-txt'>Oops! ${error}</p>`;
  statusContainer.style.display = "block";
}

function resetButton() {
  submitButton.disabled = false;
  submitButton.innerHTML = "Send";
}

// submit form event listener
submitButton.addEventListener("click", handleSubmit);
