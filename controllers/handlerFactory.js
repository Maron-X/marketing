const fs = require('fs');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const find = await Model.findById(req.params.id);
    if (!find) {
      return next(new AppError('No document found with that ID', 404));
    }

    let path;
    if (find.image) {
      path = find.image.split('-')[0];
      fs.unlink(`images/${path}/${find.image}`, err => {
        if (err) console.warn('Error deleting image:', err);
      });
    }
    if (find.imageCover) {
      path = find.imageCover.split('-')[0];
      fs.unlink(`images/${path}/${find.imageCover}`, err => {
        if (err) console.warn('Error deleting image cover:', err);
      });
    }

    if (find.images) {
      path = find.imageCover.split('-')[0];

      find.images.forEach(img => {
        fs.unlink(`images/${path}/${img}`, err => {
          if (err) console.warn('Error deleting additional image:', err);
        });
      });
    }

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const doc = await Model.create({ ...req.body, user: userId });

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.getMany = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find({
      _id: {
        $in: req.body.ids
      }
    });

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)

    let filter = {};
    if (req.params.categoryId) filter = { category: req.params.categoryId };
    if (req.params.userId) filter = { user: req.params.userId };

    const total = await Model.countDocuments(filter);

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .search()
      .paginate();

    const doc = await features.query.populate(popOptions || []);

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      total: total,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
