const Router = require('express').Router();
const Campground = require('../models/campground');

function storeBackURL(req, res, next) {
    req.session.backURL = req.originalUrl;
    next();
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

Router.get('/', storeBackURL, async (req, res) => {
    const campgrounds = await Campground.find({});
        
    res.render('campgrounds/index', { campgrounds });
});

Router.get('/new', storeBackURL, isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

Router.post('/', isLoggedIn, async (req, res) => {
    await Campground.create(req.body.campground);
    res.redirect('/campgrounds');
});

Router.get('/:id', storeBackURL, async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const campground = await Campground.findById(id)
                .populate({
                    path: 'comments',
                    populate: { path: 'author' } 
                }).exec();
            
            if (!campground) throw new Error('null campground');
        
            res.render('campgrounds/show', { campground });
        } catch(err) {
            console.log(err);
            throw err;
        }
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

module.exports = Router;