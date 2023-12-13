import axios from 'axios';
import { showAlert } from './alert';

export const logoutUser = async () => {
  try {
    const { data } = await axios.get('/logout');
    if (data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        // go to home page
        location.assign('/');
      }, 200);
    }
  } catch {
    showAlert(
      'error',
      'Error logging out! please check your connection and try again',
    );
  }
};
