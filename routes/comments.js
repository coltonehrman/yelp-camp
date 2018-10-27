const Router = require('express').Router({ mergeParams: true });
const Comment = require('../models/comment');
const Campground = require('../models/campground');

function storeBackURL(req, res, next) {
    req.session.backURL = req.originalUrl;
    next();
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

Router.get('/new', storeBackURL, isLoggedIn, async (req, res) => {
    try {
        const { campgroundID } = req.params;
        const campground = await Campground.findById(campgroundID);
        
        if (!campground) throw new Error('null campground');
        
        res.render('comments/new', { campground });
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

Router.post('/', isLoggedIn, async (req, res) => {
    const { campgroundID } = req.params;
    req.body.comment.author = req.user._id;
    
    const [ campground, comment ] = await Promise.all([
        Campground.findById(campgroundID),
        Comment.create(req.body.comment)
    ]);
    
    console.log(comment);
    
    campground.comments.push(comment);
    await campground.save();
    
    res.redirect('/campgrounds/' + campgroundID);
});

module.exports = Router;