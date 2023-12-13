const express = require('express');
const controller = require('./../controllers/tourControllers');
const middlewares = require('../middlewares/tourMiddlewares');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
const reviewRouter = require('./reviewRouter');
const { upload, resizeTourImages } = require('../middlewares/upload');

// create router
const router = express.Router();

// mount the tourRouter to reviewRouter
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5').get(middlewares.top5Alias, controller.getAllTours);
router.route('/stats').get(controller.getTourStats);

router.get('/within/:distance/location/:location', controller.getToursWithin);
router.get('/distance/location/:location', controller.getToursDistanceToPoint);

router
  .route('/montly-stats/:year')
  .get(
    requireAuth,
    restrictTo('admin', 'lead-guide', 'guide'),
    controller.getMonthlyStats,
  );

router
  .route('/')
  .get(controller.getAllTours)
  .post(requireAuth, restrictTo('admin', 'lead-guide'), controller.createTour);

router
  .route('/:id')
  .get(controller.getTour)
  .patch(
    requireAuth,
    restrictTo('admin', 'lead-guide'),
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    resizeTourImages,
    controller.updateTour,
  )
  .delete(
    requireAuth,
    restrictTo('admin', 'lead-guide'),
    controller.deleteTour,
  );

module.exports = router;
