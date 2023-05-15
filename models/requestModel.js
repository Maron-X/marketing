const mongoose = require('mongoose');
const { slug } = require('../controllers/globalFactory');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الإسم مطلوب']
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب']
    },
    phone: {
      type: String,
      required: [true, 'الهاتف مطلوب']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'الوصف مطلوب']
    },
    item: {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      required: [true, 'يجب ان يكون الطلب مرتبط بمكان']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'يجب ان تكون الفئة مرتبطة بمستخدم']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

schema.index({ slug: 1 });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
schema.pre('save', function(next) {
  this.slug = slug(this.name);
  next();
});

schema.pre(/^find/, function(next) {
  this.populate({
    path: 'item'
  });
  next();
});

const Request = mongoose.model('Request', schema);

module.exports = Request;
