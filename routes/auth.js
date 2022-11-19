const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/authModal');
const passport = require('passport')
const {notAuthenticated} = require('../config/auth')

router.use(express.urlencoded({extended: false}))

router.get('/signup', notAuthenticated, (req, res) => {
    res.render('auth/signup');
});

router.get('/login',notAuthenticated, (req, res) => {
    res.render('auth/login');
});

router.post('/signup', notAuthenticated, async (req, res) => {
    const {name, email, password, confirmPassword} = req.body;
    let errors = [];

    if(!name || !email || !password || !confirmPassword) {
        errors.push({msg: "fill all the feilds"});
    }

    if(password !== confirmPassword) {
        errors.push({msg: "password not equal to confirm Password"});
    }

    if(errors.length > 0) {
        res.render('auth/signup', {errors})
    } else {
        User.findOne({email: email})
            .then(async (user) => {
                if(user) {
                    errors.push({msg: "User alredy exists"})
                    res.render('auth/signup', {errors})
                }
                else {
                    const hashedPassword = await bcrypt.hash(password, 12);
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                    })

                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in.')
                            res.redirect('/auth/login')
                        })
                        .catch(e => {
                            console.log(e);
                        })
                }
            })
    }
});

router.post('/login', notAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true
    })(req, res, next);
});

module.exports = router;