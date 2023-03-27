const Article = require('../models/articleModel');
const catchWrapper = require('../utils/catchWrapper');
const ErrorHandler = require('../utils/errorHandler');

exports.getArticles = function (arg) {
  return catchWrapper(async (_, res) => {
    // GET ARTICLE DATA FROM COLLECTION
    const articles = await Article.find();

    // RENDER TEMPLATE
    res.status(200).render(`${arg === 'all' ? 'articles' : 'myArticles'}`, {
      title: `${arg === 'all' ? 'All' : 'My'} Articles`,
      articles,
    });
  });
};

exports.getArticle = catchWrapper(async (req, res, next) => {
  // GET DATA FOR THE REQUESTED ARTICLE
  const article = await Article.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'date user review rating',
  });

  if (!article) {
    return next(new ErrorHandler('Det finns ingen artikel vid det namnet!', 404));
  }

  // RENDER TEMPLATE
  res.status(200).render('article', {
    title: `${article.h}`,
    article,
  });
});

exports.index = (req, res) => {
  res.status(200).render('login', {
    title: 'Inloggning',
  });
};

exports.userMenu = (req, res) => {
  res.status(200).render('userMenu', {
    title: 'Min sida',
  });
};

exports.createArticle = (req, res) => {
  res.status(200).render('write', {
    title: 'Ny artikel',
  });
};

exports.editArticle = (req, res) => {
  res.status(200).render('edit', {
    title: 'Redigera artikel',
  });
};
