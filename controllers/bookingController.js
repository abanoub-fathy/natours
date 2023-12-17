const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../errors/AppError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError(404, 'tour is not found'));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-booked-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.id}`,
    customer_email: req.user.email,
    client_reference_id: tour.id,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'CAD',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingFromSession = async (session) => {
  console.log('session =', session);

  // Retrieve the session ID
  const sessionId = session.id;

  try {
    // Fetch the complete session information using the session ID
    const retrievedSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Access the line items from the retrieved session
    const lineItems = retrievedSession.line_items;

    // Access the price from the first line item
    const price = lineItems[0].price_data.unit_amount / 100;

    // Rest of your code to create the booking
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;

    await Booking.create({ tour, user, price });
  } catch (error) {
    console.error('Error retrieving session:', error);
    // Handle the error appropriately
  }
};

exports.CheckoutWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_ENDPOINT_SECRET_LIVE,
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await createBookingFromSession(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({
    received: true,
  });
});

exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
