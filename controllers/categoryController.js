const imagePath = 'categories';
const multer = require('multer');
const sharp = require('sharp');
const Model = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImages = upload.fields([{ name: 'image', maxCount: 1 }]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (req.files.image) {
    // 1) Image
    req.body.image = `${imagePath}-${req.params.id ||
      req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.image[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`images/${imagePath}/${req.body.image}`);
  }

  next();
});

exports.getAll = factory.getAll(Model);
exports.getOne = factory.getOne(Model);
exports.createOne = factory.createOne(Model);
exports.updateOne = factory.updateOne(Model);
exports.deleteOne = factory.deleteOne(Model);
