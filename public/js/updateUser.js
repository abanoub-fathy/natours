import axios from 'axios';
import { showAlert } from './alert';

export const sendUpdateRequest = async (updates, type) => {
  console.log('calling sendUpdateRequest');

  const url =
    type === 'password' ? '/api/v1/users/changePassword' : '/api/v1/users/me';

  try {
    const { data } = await axios.patch(url, updates);
    if (data && data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }

    // reload the page
    window.setTimeout(() => {
      location.reload(true);
    }, 500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
