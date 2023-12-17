import { showMapBox } from './mapbox';
import { sendLoginRequest } from './login';
import { logoutUser } from './logout';
import { sendUpdateRequest } from './updateUser';
import { bookTour } from './stripe';
import { sendSignupRequest } from './signup';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const emailElement = document.getElementById('email');
const nameElement = document.getElementById('name');
const passwordElement = document.getElementById('password');
const passwordConfirmElement = document.getElementById('passwordConfirm');
const photoElement = document.getElementById('photo');
const logoutElement = document.getElementById('logout');
const updateUserForm = document.getElementById('updateUserForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const currentPasswordElement = document.getElementById('currentPassword');
const newPasswordElement = document.getElementById('newPassword');
const newPasswordConfirmElement = document.getElementById('newPasswordConfirm');
const savePasswordBtnElement = document.getElementById('savePasswordBtn');
const bookTourBtnElement = document.getElementById('bookTourBtn');

// if login form element exists
if (loginForm) {
  console.log('login form element exists');
  loginForm.addEventListener('submit', (e) => {
    console.log('login form submitted');
    e.preventDefault();
    sendLoginRequest(emailElement.value, passwordElement.value);
  });
}

// if signup form element exists
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendSignupRequest(
      nameElement.value,
      emailElement.value,
      passwordElement.value,
      passwordConfirmElement.value,
    );
  });
}

// if there is a map element
if (mapBox) {
  const loactions = JSON.parse(mapBox.dataset.locations);
  showMapBox(loactions);
}

// if update user form element exists
if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('update user form submitted');

    const form = new FormData();
    form.append('name', nameElement.value);
    form.append('email', emailElement.value);
    form.append('photo', photoElement.files[0]);

    sendUpdateRequest(form, 'data');
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // set savePasswordBtn to saving
    savePasswordBtnElement.textContent = 'Saving...';

    await sendUpdateRequest(
      {
        currentPassword: currentPasswordElement.value,
        newPassword: newPasswordElement.value,
        newPasswordConfirm: newPasswordConfirmElement.value,
      },
      'password',
    );

    // set value back to empty
    currentPasswordElement.value = '';
    newPasswordElement.value = '';
    newPasswordConfirmElement.value = '';

    // set savePasswordBtn to save
    savePasswordBtnElement.textContent = 'Save password';
  });
}

// if logout element
if (logoutElement) {
  logoutElement.addEventListener('click', (e) => {
    e.preventDefault();
    logoutUser();
  });
}

if (bookTourBtnElement) {
  bookTourBtnElement.addEventListener('click', (e) => {
    // set textContent to processing
    e.target.textContent = 'Processing...';

    // get the tourId
    const tourId = e.target.dataset.tourId;

    bookTour(tourId);
  });
}

const alertMsg = document.querySelector('body').dataset.alert_msg;
if (alertMsg) showAlert('success', alertMsg);
