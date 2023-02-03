const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', viewsController.index);
router.get('/login', viewsController.login);
router.get('/userMenu', authController.protect(false), viewsController.userMenu);
router.get('/articles', authController.protect(false), viewsController.getArticles('all'));
router.get('/myArticles', authController.protect(false), viewsController.getArticles('my'));
router.get('/article/:slug', authController.protect(false), viewsController.getArticle);
router.get('/write', authController.protect(false), viewsController.createArticle);
router.get('/edit', authController.protect(false), viewsController.editArticle);

module.exports = router;
