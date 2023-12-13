const express = require('express');
const controller = require('../controllers/reviewController');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
const setReviewReqBody = require('../middlewares/setReviewReqBody');

const router = new express.Router({ mergeParams: true });

// Authenticated Routes
router.use(requireAuth);

router
  .route('/')
  .get(controller.getAllReviews)
  .post(restrictTo('user'), setReviewReqBody, controller.createReview);

router
  .route('/:id')
  .get(controller.getReview)
  .patch(restrictTo('admin', 'user'), controller.updateReview)
  .delete(restrictTo('admin', 'user'), controller.deleteReview);

module.exports = router;
