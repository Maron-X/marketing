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
      type: String,
      required: [true, 'الوصف مطلوب']
    },
    area: {
      type: String,
      required: [true, 'المنطقة مطلوبة']
    },
    city: {
      type: String,
      required: [true, 'المدينة مطلوبة']
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب']
    },
    price: {
      type: String,
      required: [true, 'السعر مطلوب']
    },
    rooms: {
      type: Number,
      required: [true, 'عدد الغرف مطلوب']
    },
    bedRoom: {
      type: Number,
      required: [true, 'عدد غرف النوم مطلوب']
    },
    toilet: {
      type: Number,
      required: [true, 'عدد الحمامات مطلوب']
    },
    whatsapp: {
      type: String,
      required: [true, 'الهاتف مطلوب']
    },
    image: {
      type: String,
      required: [true, 'الصورة مطلوبة']
    },
    images: {
      type: Array,
      required: [true, 'صور المكان مطلوبة']
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'يجب ان يكون المكان مرتبط بفئة']
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
    path: 'category'
  });
  next();
});

const Item = mongoose.model('Item', schema);

module.exports = Item;
