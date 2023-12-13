const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'booking must belong to a tour'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'booking should have a price'],
  },
  paid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paymentReference: {
    type: String,
  },
});

// create index on user
bookingSchema.index({ user: 1 });

// pre find hook
bookingSchema.pre(/^find/, function (next) {
  // populate the user and the tour name
  this.populate('user').populate({
    path: 'tour',
    select: {
      name: true,
    },
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
