const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'tour name could not be empty'],
      minLength: [10, "the name can't be less than 10 chars"],
      maxLength: [40, "the name can't be more than 40 chars"],
    },
    slug: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: ['tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'the difficulty should be one of these values (easy, medium, hard)',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating can't be less than 1.0"],
      max: [5, "rating can't be more than 5.0"],
      set: (val) => val.toFixed(1),
    },
    ratingsQuantity: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'tour must have price'],
    },
    discount: {
      type: Number,
      validate: {
        validator(discount) {
          return discount < this.price;
        },
        message: 'the discount ({VALUE}) should be less than the price',
      },
    },
    secret: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'tour must have a description'],
    },
    imageCover: {
      type: String,
      trim: true,
      required: true,
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add virtual property
tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// user virtual reviews prop -- for populating tour reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// create compound index on price and ratingsAverage
tourSchema.index({ price: 1, ratingsAverage: -1 });

// create index on slug
tourSchema.index({ slug: 1 });

// create index on startLocation
tourSchema.index({ startLocation: '2dsphere' });

/* Document Middleware (hooks) in mongoose */
// save -> create() save()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embed users inside the tour.guides
// tourSchema.pre('save', async function (next) {
//   const promises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(promises);
//   next();
// });

// POST save Hook
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

/* Query Middleware */
tourSchema.pre(/^find/, function (next) {
  // this keyword here means the query
  this.find({ secret: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

/* Aggregation Middleware */
tourSchema.pre('aggregate', function (next) {
  // if $geoNear is the first element in the pipeline
  if (this.pipeline()[0]['$geoNear']) {
    this.pipeline().splice(1, 0, { $match: { secret: { $ne: true } } });
  } else {
    // remove secret tours from the aggregation piplene
    this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  }

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
