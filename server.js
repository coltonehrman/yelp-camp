const seedDB = require('./seeds');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Comment = require('./models/comment');
const Campground = require('./models/campground');
const app = express();

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });

// seedDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('landing');
});

// ====================
// CAMPGROUNDS ROUTES
// ====================

// INDEX
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
        
    res.render('campgrounds/index', { campgrounds });
});

// NEW
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// CREATE
app.post('/campgrounds', async (req, res) => {
    await Campground.create(req.body.campground);
    res.redirect('/campgrounds');
});

// SHOW
app.get('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id)
            .populate('comments').exec();
        
        if (!campground) throw new Error('null campground');
        
        res.render('campgrounds/show', { campground });
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

// =================
// COMMENTS ROUTES
// =================

// NEW
app.get('/campgrounds/:campgroundID/comments/new', async (req, res) => {
    try {
        const { campgroundID } = req.params;
        const campground = await Campground.findById(campgroundID);
        
        if (!campground) throw new Error('null campground');
        
        res.render('comments/new', { campground });
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

// CREATE
app.post('/campgrounds/:campgroundID/comments', async (req, res) => {
    const { campgroundID } = req.params;
    
    const [ campground, comment ] = await Promise.all([
        Campground.findById(campgroundID),
        Comment.create(req.body.comment)
    ]);
    
    campground.comments.push(comment);
    await campground.save();
    
    res.redirect('/campgrounds/' + campgroundID);
});

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Listening on port...');
});