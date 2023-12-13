const mongoose = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('../errors/AppError');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'review could not be empty'],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "rating can't be less than 1.0"],
      max: [5, "rating can't be more than 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// unique index of tour and user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// populate the reviews pre finding
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calculateTourStats = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  // if there is a stats
  if (stats.length) {
    const { ratingsAverage, ratingsQuantity } = stats[0];
    await Tour.findByIdAndUpdate(
      tourId,
      {
        ratingsAverage,
        ratingsQuantity,
      },
      {
        runValidators: true,
        new: true,
      },
    );
  }
};

reviewSchema.pre('save', async function (next) {
  const userPreviousReview = await Review.findOne({
    tour: this.tour,
    user: this.user,
  });

  if (userPreviousReview) {
    return next(new AppError(400, 'user already reviewed this tour'));
  }

  next();
});

reviewSchema.post('save', async function () {
  await this.constructor.calculateTourStats(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calculateTourStats(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
