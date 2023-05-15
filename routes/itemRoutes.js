const express = require('express');
const controller = require('../controllers/itemController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(controller.getAll)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    controller.uploadImages,
    controller.resizeImages,
    controller.createOne
  );

router
  .route('/:id')
  .get(controller.getOne)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    controller.uploadImages,
    controller.resizeImages,
    controller.updateOne
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    controller.deleteOne
  );

module.exports = router;
