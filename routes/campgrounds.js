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

async function getCampgroundById(req, res, next) {
    try {
        const { id } = req.params;
        
        try {
            const campground = await Campground.findById(id);
            
            if (!campground) throw new Error('null campground');
            
            req.campground = campground;
            
            next();
        } catch(err) {
            console.log(err);
            throw err;
        }
    } catch(err) {
        res.redirect('/campgrounds');
    }
}

function ownsCampground(req, res, next) {
    if (req.user._id.equals(req.campground.author._id)) return next();
    res.redirect('/campgrounds/' + req.params.id);
}

Router.get('/', storeBackURL, async (req, res) => {
    const campgrounds = await Campground.find({});
        
    res.render('campgrounds/index', { campgrounds });
});

Router.get('/new', storeBackURL, isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

Router.post('/', isLoggedIn, async (req, res) => {
    req.body.campground.author = req.user._id;
    await Campground.create(req.body.campground);
    res.redirect('/campgrounds');
});

Router.get('/:id', storeBackURL, async (req, res) => {
    try {
        const { id } = req.params;
        
        try {
            const campground = await Campground.findById(id)
                .populate('author')
                .populate({
                    path: 'comments',
                    populate: { path: 'author' }
                }).exec();
            
            if (!campground) throw new Error('null campground');
        
            res.render('campgrounds/show', { campground, user: req.user });
        } catch(err) {
            console.log(err);
            throw err;
        }
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

Router.get('/:id/edit', storeBackURL, isLoggedIn, getCampgroundById, ownsCampground, (req, res) => {
    res.render('campgrounds/edit', { campground: req.campground });
});

Router.put('/:id', isLoggedIn, getCampgroundById, ownsCampground, async (req, res) => {
    const { name, image, headline, description } = req.body.campground;
    
    try {
        req.campground.name = name;
        req.campground.image = image;
        req.campground.headers = headline;
        req.campground.description = description;
        
        await req.campground.save();
    } catch(err) {
        console.error(err);
    } finally {
        res.redirect('/campgrounds/' + req.params.id);
    }
});

Router.delete('/:id', isLoggedIn, getCampgroundById, ownsCampground, async (req, res) => {
    try {
        await Campground.findByIdAndRemove(req.params.id);
    } catch(err) {
        console.error(err);
    } finally {
        res.redirect('/campgrounds');
    }
});

module.exports = Router;