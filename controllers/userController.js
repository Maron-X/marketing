const multer = require('multer');
const sharp = require('sharp');
const Model = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

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

exports.uploadImages = upload.single('photo');

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `users-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(400, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`images/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'country',
    'state',
    'city',
    'street',
    'phone',
    'phoneCode',
    'wishList'
  );
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await Model.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updateWishList = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (!req.body.wishList) {
    return next(
      new AppError('This route ust for add product in wishlist', 400)
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // 3) Update user document
  const updatedUser = await Model.updateOne(
    { _id: req.user.id },
    {
      $push: req.body
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.removeFromWishList = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (!req.body.wishList) {
    return next(
      new AppError('This route ust for add product in wishlist', 400)
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // 3) Update user document
  const updatedUser = await Model.updateOne(
    { _id: req.user.id },
    {
      $pull: req.body
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updateCheckout = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data

  // console.warn('req.body', req);
  if (!req.body.checkout) {
    return next(
      new AppError('This route use for add product in checkout', 400)
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // 3) Update user document
  const updatedUser = await Model.updateOne(
    { _id: req.user.id },
    {
      $push: req.body
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.removeFromCheckout = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (!req.body.checkout) {
    return next(
      new AppError('This route ust for add product in checkout', 400)
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // 3) Update user document
  const updatedUser = await Model.updateOne(
    { _id: req.user.id },
    {
      $pull: req.body
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Model.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createOne = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getOne = factory.getOne(Model);
exports.getAll = factory.getAll(Model);

// Do NOT update passwords with this!
exports.updateOne = factory.updateOne(Model);
exports.deleteOne = factory.deleteOne(Model);
