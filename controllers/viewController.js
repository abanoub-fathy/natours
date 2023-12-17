const AppError = require('../errors/AppError');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get the tour include reviews
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    'reviews',
  );

  if (!tour) {
    return next(new AppError(404, 'No tour found with that name'));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour: tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.header('Content-Security-Policy', "img-src 'self'");
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Create new account',
  });
});

exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
});

exports.myBookedTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.user.id,
  });

  const tourIDs = bookings.map((booking) => {
    return booking.tour;
  });

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.render('overview', {
    title: 'My Tours',
    tours,
  });
});
