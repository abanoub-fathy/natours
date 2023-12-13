import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51KZdJ6IC6fpEF9J9wDMmo29FmVgkBeLNkx5tcuBJmDnA2D1AC1ob8XPJNcsCPbKKaUg26KQuX9KKUgE9KasBdiGs00fs7yVE0x',
    );
    // get checkout session from API
    const { data } = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // redirct user to stripe checkout page
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
