const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../errors/AppError');
const factory = require('./handlerFactory');
const {
  milesToRadian,
  kmToRadian,
  KM_MULTIPLIER,
  MILES_MULTIPLIER,
} = require('../utils/earth-radius');

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, location } = req.params;
  const [latitude, longitude] = location.split(',');

  if (!latitude || !longitude) {
    return next(new AppError(400, 'location is in wrong format'));
  }

  // get radius from convert distance in miles to radians
  let radius = milesToRadian(distance);

  // if unit in the url query is in km
  if (req.query.unit === 'km') {
    radius = kmToRadian(distance);
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius],
      },
    },
  });

  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getToursDistanceToPoint = catchAsync(async (req, res, next) => {
  const { location } = req.params;
  const [latitude, longitude] = location.split(',');

  if (!latitude || !longitude) {
    return next(new AppError(400, 'location is in wrong format'));
  }

  let distanceMultiplier = KM_MULTIPLIER;

  if (req.query.unit === 'mile' || req.query.unit === 'miles') {
    distanceMultiplier = MILES_MULTIPLIER;
  }

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude * 1, latitude * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: distanceMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        _id: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.4 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyStats = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const montlyStats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $limit: 12,
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    count: montlyStats.length,
    data: {
      montlyStats,
    },
  });
});
