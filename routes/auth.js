const passport = require('passport');
const Router = require('express').Router();
const User = require('../models/user');

function storeBackURL(req, res, next) {
    req.session.backURL = req.originalUrl;
    next();
}

Router.get('/register', storeBackURL, (req, res) => {
    res.render('auth/register'); 
});

Router.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body;
    
    try {
        await User.register({ username, email }, password);
        return next();
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
}, passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/register'
}));

Router.get('/login', (req, res) => {
    res.render('auth/login'); 
});

Router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect(req.session.backURL || '/campgrounds');
});

Router.get('/logout', (req, res) => {
    req.logout();
    res.redirect(req.session.backURL || '/');
});

module.exports = Router;