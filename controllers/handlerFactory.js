/* eslint-disable node/no-unsupported-features/es-builtins */

const util = require('util');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const exists = util.promisify(fs.existsSync);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// GOOGLE STORAGE ----------
const { STORAGE_PROJECT_ID } = process.env;
const { STORAGE_KEY_FILE_NAME } = process.env;
const BUCKET_NAME = 'fp_storage';

const storage = new Storage({
  STORAGE_PROJECT_ID,
  STORAGE_KEY_FILE_NAME,
});
// -------------------------

/*
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(res.status);

    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
  */

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const bucket = storage.bucket(BUCKET_NAME);

    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(res.status);

    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }

    // Get all files in the bucket
    const [files] = await bucket.getFiles();

    // Filter files that have the article ID in their file names
    const articleFiles = files.filter((file) => file.name.includes(req.params.id));

    // Delete each file
    await Promise.all(articleFiles.map((file) => file.delete()));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// UPDATE DATA
exports.updateOne = (Model, type = 'text') =>
  catchAsync(async (req, res, next) => {
    let update;
    const docObj = {
      new: true,
      runValidators: true,
    };

    // PRIVACY
    if (type === 'privacy') {
      update = req.body;

      const docP1 = await Model.findByIdAndUpdate(req.params.id, update, docObj);

      res.status(200).json({
        status: 'success',
        data: {
          data: docP1,
        },
      });
    }

    // IMAGES
    if (type === 'images') {
      update = req.body;

      const docW1 = await Model.findByIdAndUpdate(req.params.id, update, docObj);

      res.status(200).json({
        status: 'success',
        data: {
          data: docW1,
        },
      });
    }

    // UPDATING FIRST DATA SET (EDIT)
    if (type === 'text') {
      update = Object.assign({}, req.body, {
        p1: req.body.p1.replace(/&lt;/g, '<'),
        p2: req.body.p2.replace(/&lt;/g, '<'),
        p3: req.body.p3.replace(/&lt;/g, '<'),
      });

      const docE1 = await Model.findByIdAndUpdate(req.params.id, update, docObj);
      const imgWithPath = (n) => `public/img/articles/article-${docE1.id}-img${n}.jpeg`;
      const deleteSecondImage = () => unlink(imgWithPath(2));
      const secondImageExist = () => exists(imgWithPath(2));
      const IMAGES = [docE1.img1.includes('img'), docE1.img2.includes('img')].filter((el) => !!el).length;
      const FILES = req.body.FILE_LEN;
      const IMG_1_1 = docE1.img1.includes('img1');
      const IMG_1_2 = docE1.img1.includes('img2');
      const IMG_2_1 = docE1.img2.includes('img1');
      const NO_NULL = docE1.img2 !== 'null';
      const NO_FILE = !secondImageExist();

      // RENAMES ARTICLE IMAGE FILES
      const replaceImages = (arg = false) =>
        rename(imgWithPath(1), imgWithPath(3))
          .then(() => rename(imgWithPath(2), imgWithPath(1)))
          .then(() => rename(imgWithPath(3), imgWithPath(2)))
          .then(() => arg === 'andDelete' && deleteSecondImage());

      if (!docE1) {
        return next(new AppError('No document found with that ID', 404));
      }

      // REPLACES LOCAL IMG1 WITH IMG2 AND IMG2 WITH IMG1
      if (IMAGES === 2 && FILES === 0 && IMG_1_2 && IMG_2_1) replaceImages();

      //DELETES SECOND IMAGE
      if (IMAGES === 1 && FILES === 0 && IMG_1_1 && NO_NULL) deleteSecondImage();
      if (IMAGES === 1 && FILES === 0 && IMG_1_2) replaceImages('andDelete');
      if (IMAGES === 1 && FILES === 1 && IMG_1_1 && NO_FILE) deleteSecondImage();
      if (IMAGES === 1 && FILES === 1 && IMG_1_2) replaceImages('andDelete');

      // SECOND SET OF DATA UPDATING IMAGE PATHS
      update = {
        img1: `article-${req.params.id}-img1.jpeg`,
        img2: `article-${req.params.id}-img2.jpeg`,
      };

      const docE2 = await Model.findByIdAndUpdate(req.params.id, update, docObj);

      res.status(200).json({
        status: 'success',
        data: {
          data: docE2,
        },
      });
    }

    next();
  });

// INCLUDES USER ID TO ARTICLE WHEN USERMODEL IS USED AS AN ARGUMENT
exports.createOne = (Model, userModel = null) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    const userDoc = await userModel.findById(req.user);
    Object.assign(doc, { owner: userDoc._id });
    await doc.save();
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested get reviews on article (hack)
    let filter = {};
    if (req.params.articleId) filter = { article: req.params.articleId };

    let query = Model.find(filter);

    const publicArticles = { private: { $eq: false } };
    const privateUserArticles = { private: { $eq: true }, owner: { $eq: req.user._id } };
    query = Model.find({ $or: [publicArticles, privateUserArticles] });

    if (popOptions) query = query.populate(popOptions);

    const features = new APIFeatures(query, req.query).filter().sort().limit().paginate();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });
