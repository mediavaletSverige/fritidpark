const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect(true));

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restriction('member'), reviewController.setArticleUserIds, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restriction('admin', 'coadmin', 'member'), reviewController.updateReview)
  .delete(authController.restriction('admin', 'coadmin', 'member'), reviewController.deleteReview);

module.exports = router;
