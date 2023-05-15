const mongoose = require('mongoose');
const { slug } = require('../controllers/globalFactory');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الإسم مطلوب'],
      unique: true
    },
    slug: String,
    description: {
      type: String
    },
    image: {
      type: String,
      required: [true, 'الصورة مطلوبة']
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

const Category = mongoose.model('Category', schema);

module.exports = Category;
