const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getArticles = function (arg) {
  return catchAsync(async (_, res) => {
    // GET ARTICLE DATA FROM COLLECTION
    const articles = await Article.find();

    // RENDER TEMPLATE
    res.status(200).render(`${arg === 'all' ? 'articles' : 'myArticles'}`, {
      title: `${arg === 'all' ? 'All' : 'My'} Articles`,
      articles,
    });
  });
};

exports.getArticle = catchAsync(async (req, res, next) => {
  // GET DATA FOR THE REQUESTED ARTICLE
  const article = await Article.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'date user review rating',
  });

  if (!article) {
    return next(new AppError('There is no article with that name', 404));
  }

  // RENDER TEMPLATE
  res.status(200).render('article', {
    title: `${article.h}`,
    article,
  });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.index = (req, res) => {
  res.status(200).render('base');
};

exports.userMenu = (req, res) => {
  res.status(200).render('userMenu', {
    title: 'Inställningar',
  });
};

exports.createArticle = (req, res) => {
  res.status(200).render('write', {
    title: 'Nytt inlägg',
  });
};

exports.editArticle = (req, res) => {
  res.status(200).render('edit', {
    title: 'Redigera inlägg',
  });
};
