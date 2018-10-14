const seedDB        = require('./seeds');
const express       = require('express');
const mongoose      = require('mongoose');
const passport      = require('passport');
const bodyParser    = require('body-parser');
const session       = require('express-session');

const User          = require('./models/user');
const Comment       = require('./models/comment');
const Campground    = require('./models/campground');

const app = express();

function storeBackURL(req, res, next) {
    req.session.backURL = req.originalUrl;
    next();
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/yelp_camp', { useNewUrlParser: true });

// seedDB();

app.use(session({
    secret: 'Very very secret secret password by Me',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'pug');

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    next();
});

app.get('/', storeBackURL, (req, res) => {
    res.render('landing');
});

// ====================
// CAMPGROUNDS ROUTES
// ====================

// INDEX
app.get('/campgrounds', storeBackURL, async (req, res) => {
    const campgrounds = await Campground.find({});
        
    res.render('campgrounds/index', { campgrounds });
});

// NEW
app.get('/campgrounds/new', storeBackURL, isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// CREATE
app.post('/campgrounds', isLoggedIn, async (req, res) => {
    await Campground.create(req.body.campground);
    res.redirect('/campgrounds');
});

// SHOW
app.get('/campgrounds/:id', storeBackURL, async (req, res) => {
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
app.get('/campgrounds/:campgroundID/comments/new', storeBackURL, isLoggedIn, async (req, res) => {
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
app.post('/campgrounds/:campgroundID/comments', isLoggedIn, async (req, res) => {
    const { campgroundID } = req.params;
    
    const [ campground, comment ] = await Promise.all([
        Campground.findById(campgroundID),
        Comment.create(req.body.comment)
    ]);
    
    campground.comments.push(comment);
    await campground.save();
    
    res.redirect('/campgrounds/' + campgroundID);
});

// =================
// AUTH ROUTES
// =================

// GET REGISTER
app.get('/register', storeBackURL, (req, res) => {
    res.render('auth/register'); 
});

// POST REGISTER
app.post('/register', async (req, res, next) => {
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

// GET LOGIN
app.get('/login', (req, res) => {
    res.render('auth/login'); 
});

// POST LOGIN
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect(req.session.backURL || '/campgrounds');
});

// GET LOGOUT
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect(req.session.backURL || '/');
});

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Listening on port...');
});