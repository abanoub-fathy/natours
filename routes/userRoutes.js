const express = require('express');
const controller = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');
const requireAuth = require('../middlewares/requireAuth');
const setUserIdInReq = require('../middlewares/setUserIdInReq');
const restrictRoles = require('../middlewares/restrictTo');
const { upload, resizeImage } = require('../middlewares/upload');

// create router
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Authenticated Routes
router.use(requireAuth);

router
  .route('/me')
  .get(setUserIdInReq, controller.getMe)
  .patch(upload.single('photo'), resizeImage, controller.updateMe)
  .delete(controller.deleteMe);

router.patch('/changePassword', authController.changePassword);

// Authenticated & Restricted Routes
router.use(restrictRoles('admin'));

router.route('/').get(controller.getAllUsers).post(controller.createUser);

router
  .route('/:id')
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
