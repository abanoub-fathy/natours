const { Router } = require('express');
const viewController = require('../controllers/viewController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const requireAuth = require('../middlewares/requireAuth');
const setAlertMsg = require('../middlewares/setAlertMsg');

const router = Router();

// setAlertMsg should be used to set the appropriate alert message in the view
router.use(setAlertMsg);

router.get('/', isLoggedIn, viewController.getOverview);
router.get('/tours/:slug', isLoggedIn, viewController.getTour);
router.get('/login', isLoggedIn, viewController.login);
router.get('/signup', isLoggedIn, viewController.signup);
router.get('/logout', isLoggedIn, viewController.logout);
router.get('/me', requireAuth, viewController.getAccount);

router.post('/submit-user-data', requireAuth, viewController.updateUserData);
router.get('/my-booked-tours', requireAuth, viewController.myBookedTours);

module.exports = router;
