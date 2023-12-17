const { Router } = require('express');
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const requireAuth = require('../middlewares/requireAuth');

const router = Router();

router.get('/', isLoggedIn, viewController.getOverview);
router.get('/tours/:slug', isLoggedIn, viewController.getTour);
router.get('/login', isLoggedIn, viewController.login);
router.get('/signup', isLoggedIn, viewController.signup);
router.get('/logout', isLoggedIn, viewController.logout);
router.get('/me', requireAuth, viewController.getAccount);

router.post('/submit-user-data', requireAuth, viewController.updateUserData);
router.get('/my-booked-tours', requireAuth, viewController.myBookedTours);

module.exports = router;
