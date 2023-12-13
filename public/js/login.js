import axios from 'axios';
import { showAlert } from './alert';

export const sendLoginRequest = async (email, password) => {
  try {
    const { data } = await axios.post('/api/v1/users/login', {
      email,
      password,
    });

    console.log('data =', data);
    if (data && data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    const errMsg = err.response.data.message;
    showAlert('error', errMsg);
  }
};
