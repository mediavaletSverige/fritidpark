const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now(),
      min: [Date.now(), 'Only present or future dates are allowed'],
    },
    img1: {
      type: String,
    },
    alt1: String,
    fig1: {
      type: String,
      required: [true, 'An article must have a fig caption'],
      trim: true,
    },
    img2: {
      type: String,
    },
    alt2: String,
    fig2: { type: String, default: '', trim: true },
    author: {
      type: String,
      required: [true, 'An article must have a author'],
      trim: true,
      maxLength: [40, 'Author name must have less or equal then 40 characters'],
      minLength: [2, 'Author name must have more or equal then 2 characters'],
    },
    location: {
      type: {
        type: 'String',
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    h: {
      type: String,
      required: [true, 'An article must have a header'],
      trim: true,
      unique: [true, 'There can only be one header of the same name'],
    },
    q: { type: String, default: '', trim: true },
    p1: {
      type: String,
      required: [true, 'An article must have a paragraph'],
      trim: true,
    },
    p2: { type: String, default: '', trim: true },
    p3: { type: String, default: '', trim: true },
    topics: {
      type: [String],
      enum: {
        values: ['fritid', 'park', 'bad'],
        message: 'topics must be either fritid, park or bad',
      },
    },
    tags: {
      type: [String],
      validate: {
        validator: function (val) {
          const topics = ['fritid', 'park', 'bad'];
          return !topics.some((c) => val.includes(c));
        },
        message: 'Topics are not allowed as tags',
      },
    },
    slug: String,
    owner: String,
    private: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

articleSchema.index({ author: 1 });
articleSchema.index({ location: '2dsphere' });

// ARTICLE COMMENTS
articleSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'article',
  localField: '_id',
});

// CREATES ARTICLE ADDRESS

articleSchema.pre('save', function (next) {
  this.slug = slugify(this.h.split(' ').join('-'), { lower: true });
  next();
});

// ESTABLISHES IMAGE LINKS
articleSchema.pre('save', function (next) {
  this.img1 = `article-${this._id}-img1.jpeg`;
  this.img2 = `article-${this._id}-img2.jpeg`;
  next();
});

// CONVERTS &LT; BACK TO <
articleSchema.pre('save', function (next) {
  this.p1 = this.p1.replace(/&lt;/g, '<');
  this.p2 = this.p2.replace(/&lt;/g, '<');
  this.p3 = this.p3.replace(/&lt;/g, '<');
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
