import axios from 'axios';
import { showAlert } from './alert';

export const sendSignupRequest = async (
  name,
  email,
  password,
  passwordConfirm,
) => {
  try {
    const { data } = await axios.post('/api/v1/users/signup', {
      name,
      email,
      password,
      passwordConfirm,
    });

    if (data && data.status === 'success') {
      showAlert('success', 'Account is created successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    const errMsg = err.response.data.message;
    showAlert('error', errMsg);
  }
};
