const mongoose = require('mongoose');
const Article = require('./articleModel');

const reviewSchema = new mongoose.Schema(
  {
    comment: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    article: {
      type: mongoose.Schema.ObjectId,
      ref: 'Article',
      required: [true, 'Comment must belong to an article.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user.'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index({ article: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name logo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (articleId) {
  const stats = await this.aggregate([
    {
      $match: { article: articleId },
    },
    {
      $group: {
        _id: '$article',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Article.findByIdAndUpdate(articleId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Article.findByIdAndUpdate(articleId, {
      ratingsQuantity: 0,
      ratingsAverage: 3,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.article);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.article);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
