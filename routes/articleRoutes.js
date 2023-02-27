const express = require('express');
const articleController = require('../controllers/articleController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:articleId/reviews', reviewRouter);

// ALIASES
const aliases = function (alias, func) {
  router.route(`/${alias}`).get(func, articleController.getAllArticles);
};

aliases('fritid', articleController.fritidArticles);
aliases('park', articleController.parkArticles);
aliases('bad', articleController.badArticles);

// GET ARTICLE STATS
router
  .route('/stats')
  .get(
    authController.protect(true),
    authController.restrictTo('coadmin', 'author', 'advertiser'),
    articleController.getArticleStats
  );

// GEO ROUTES
router.route('/articles-within/:distance/center/:latlng/unit/:unit').get(articleController.getArticlesWithin);

// GET ALL & CREATE
router
  .route('/')
  .get(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.getAllArticles
  )
  .post(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.createArticle
  );

//  GET ONE, UPDATE AND DELETE
router
  .route('/:id')
  .get(articleController.getArticle)
  .patch(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.updateArticle
  )
  .delete(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.deleteArticle
  );

router
  .route('/images/:id')
  .patch(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.updateArticleImages,
    articleController.handleArticleImages,
    articleController.uploadArticleImages
  );

router
  .route('/existingimages/:id')
  .patch(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.updateArticleImages,
    articleController.handleArticleImages,
    articleController.uploadExistingArticleImages
  );

// MAKES ARTICLE PRIVATE OR PUBLIC
router
  .route('/privacy/:id')
  .patch(
    authController.protect(true),
    authController.restrictTo('admin', 'coadmin', 'author', 'advertiser'),
    articleController.updateArticlePrivacy
  );

module.exports = router;
