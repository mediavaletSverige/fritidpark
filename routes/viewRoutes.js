const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', viewsController.index);
router.get('/userMenu', authController.protect(false), viewsController.userMenu);
router.get('/artiklar', authController.protect(false), viewsController.getArticles('all'));
router.get('/mina-artiklar', authController.protect(false), viewsController.getArticles('my'));
router.get('/artikel/:slug', authController.protect(false), viewsController.getArticle);
router.get('/write', authController.protect(false), viewsController.createArticle);
router.get('/edit', authController.protect(false), viewsController.editArticle);

module.exports = router;
