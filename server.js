const seedDB = require('./seeds');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Campground = require('./models/campground');
const app = express();

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });

seedDB();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
        .populate('comments').exec();
        
    res.render('campgrounds', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('new');
});

app.post('/campgrounds', async (req, res) => {
    console.log('POST campgrounds');
    const { name, image, description } = req.body;
    await Campground.create({ name, image, description });
    res.redirect('/campgrounds');
});

app.get('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id)
            .populate('comments').exec();
        
        if (!campground) throw new Error('null campground');
        
        res.render('campground', { campground });
    } catch(err) {
        res.redirect('/campgrounds');
    }
});

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Listening on port...');
});