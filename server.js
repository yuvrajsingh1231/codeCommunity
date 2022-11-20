const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const authRouter = require('./routes/auth')
const methodOverride = require('method-override')
const passport = require('passport')
const app = express()

require('./config/passport-config')(passport);

mongoose.connect(process.env.DB || 'mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(session({
  secret: 'qwertyuio123456789^%$#@!',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.warning_msg = req.flash('warning_msg');
  res.locals.error = req.flash('error');
  next();
})


app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles, user: req.user })
})

app.use('/articles', articleRouter);
app.use('/auth', authRouter);

app.get('/auth/logout', (req, res) => {
  req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success_msg', 'You are logged out');
      res.redirect('/');
    });
});

app.get('*', (req, res) => {
  res.render('articles/404.ejs');
})

app.listen(process.env.PORT || 5000)