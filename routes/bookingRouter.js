const express = require('express');
const controller = require('../controllers/bookingController');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');

const router = new express.Router();

router.use(requireAuth);

router.get('/checkout-session/:tourId', controller.getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(controller.getAllBookings).post(controller.createBooking);
router
  .route('/:id')
  .get(controller.getBooking)
  .patch(controller.updateBooking)
  .delete(controller.deleteBooking);

module.exports = router;
