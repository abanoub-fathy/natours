// type can be error or success
export const showAlert = (type, message) => {
  // hide any previous alert
  hideAlert();

  const alertMarkup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alertMarkup);

  // hide alert after 5 seconds
  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const alertElement = document.querySelector('.alert');
  if (alertElement) alertElement.remove();
};
