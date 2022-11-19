const express = require('express')
const Article = require('./../models/article')
const router = express.Router()
const {ensureAuthenticated} = require('../config/auth');
const {sendNotification} = require('../config/telegram_bot');

router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('articles/new', { article: new Article(), user: req.user})
})

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article, user: req.user})
})

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article , user: req.user || null})
})

router.post('/', ensureAuthenticated, async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', ensureAuthenticated, async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.author.name= req.body.authorName
    article.author.email = req.body.email

    try {
      article = await article.save()
      sendNotification(`
NEW POST🚀🪵
<b>Title:</b> ${req.body.title}
<b>Author:</b> ${req.body.authorName}
<b>Description:</b> ${req.body.description} <a href="https://codecommunity-06ix.onrender.com/articles/${article.slug}">Read more.</a>`);
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article, user: req.user})
    }
  }
}

module.exports = router