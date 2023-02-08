/* eslint-disable no-unused-expressions */
/* eslint-disable node/no-unsupported-features/es-builtins */

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const StorageHandler = require('../utils/storageHandler');

const SH = new StorageHandler();

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(res.status);

    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }

    await SH.deleteImages(req.params.id);

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

    console.log(req.body);

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

      const IMAGES = req.body.IMAGE_LEN;
      const FILES = req.body.FILE_LEN;
      const IMG_1_1 = docE1.img1.includes('img1');
      const IMG_1_2 = docE1.img1.includes('img2');
      const IMG_2_1 = docE1.img2.includes('img1');
      const NO_NULL = docE1.img2 !== 'null';
      const NO_FILE = !SH.checkImage(docE1.id, 2);

      console.log(IMAGES, FILES, IMG_1_1, NO_NULL);

      // RENAMES ARTICLE IMAGE FILES
      const replaceImages = (arg = false) =>
        SH.renameImageFile(imgWithPath(1), imgWithPath(3))
          .then(() => SH.renameImageFile(imgWithPath(2), imgWithPath(1)))
          .then(() => SH.renameImageFile(imgWithPath(3), imgWithPath(2)))
          .then(() => arg === 'andDelete' && SH.deleteImage(docE1.id, 2));

      if (!docE1) {
        return next(new AppError('No document found with that ID', 404));
      }

      // REPLACES LOCAL IMG1 WITH IMG2 AND IMG2 WITH IMG1
      if (IMAGES === 2 && FILES === 0 && IMG_1_2 && IMG_2_1) replaceImages();

      //DELETES SECOND IMAGE

      if (IMAGES === 1 && FILES === 0 && IMG_1_1 && NO_NULL) SH.deleteImage(docE1.id, 2);
      if (IMAGES === 1 && FILES === 0 && IMG_1_2) replaceImages('andDelete');
      if (IMAGES === 1 && FILES === 1 && IMG_1_1 && NO_FILE) SH.deleteImage(docE1.id, 2);
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
