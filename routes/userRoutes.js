const express = require('express');

const controller = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/admin', authController.admin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', controller.getMe, controller.getOne);
router.patch(
  '/updateMe',
  controller.uploadImages,
  controller.resizeImages,
  controller.updateMe
);
router.patch('/updateWishList', controller.updateWishList);
router.patch('/removeFromWishList', controller.removeFromWishList);
router.patch('/updateCheckout', controller.updateCheckout);
router.patch('/removeFromCheckout', controller.removeFromCheckout);
router.delete('/deleteMe', controller.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(controller.getAll)
  .post(controller.createOne);

router
  .route('/:id')
  .get(controller.getOne)
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

module.exports = router;
