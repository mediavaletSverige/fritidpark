/* eslint-disable no-void */
/* eslint-disable no-return-assign */
/* eslint-disable node/no-unsupported-features/es-syntax */

const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

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
  fileFilter: multerFilter,
});

exports.uploadArticleImages = upload.fields([
  { name: 'img1', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
]);

exports.resizeArticleImages = catchAsync(async (req, res, next) => {
  // 1) First image

  if (!req.files.img1) return next();
  req.body.img1 = `article-${req.params.id}-img1.jpeg`;

  const articleById = await Article.findById(req.params.id);

  if (articleById.img1 && fs.existsSync(`public/img/articles/${articleById.img1}`)) {
    fs.unlinkSync(`public/img/articles/${articleById.img1}`);
  }

  await sharp(req.files.img1[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`public/img/articles/${req.body.img1}`);

  // 1) Second image
  if (!req.files.img2) return next();
  req.body.img2 = `article-${req.params.id}-img2.jpeg`;

  if (articleById.img2 && fs.existsSync(`public/img/articles/${articleById.img2}`)) {
    fs.unlinkSync(`public/img/articles/${articleById.img2}`);
  }

  await sharp(req.files.img2[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`public/img/articles/${req.body.img2}`);

  next();
});

void (function exportTopics(...args) {
  return args.forEach(
    (topic) =>
      (exports[`${topic}Articles`] = (req, _, next) => {
        req.query = { topics: `${topic}` };
        next();
      })
  );
})('fritid', 'park', 'bad');

exports.getAllArticles = factory.getAll(Article);
exports.getArticle = factory.getOne(Article, { path: 'reviews' });

// IF USERMODEL IS USED THE USERS ID IS INCLUDED INTO THE ARTICLE
exports.createArticle = factory.createOne(Article, User);
exports.updateArticle = factory.updateOne(Article);
exports.updateArticlePrivacy = factory.updateOne(Article, 'privacy');
exports.updateArticleImages = factory.updateOne(Article, 'images');
exports.deleteArticle = factory.deleteOne(Article);

exports.getArticleStats = catchAsync(async (_, res) => {
  const stats = await Article.aggregate([
    {
      $unwind: '$topics',
    },
    {
      $group: {
        _id: '$topics',
        num: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getArticlesWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat, lng.', 400));
  }

  const articles = await Article.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: {
      data: articles,
    },
  });
});
