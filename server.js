const seedDB        = require('./seeds');
const express       = require('express');
const mongoose      = require('mongoose');
const passport      = require('passport');
const bodyParser    = require('body-parser');
const session       = require('express-session');

const CampgroundsRouter = require('./routes/campgrounds');
const CommentsRouter    = require('./routes/comments');
const AuthRouter        = require('./routes/auth.js');
const IndexRouter       = require('./routes/');

const User = require('./models/user');

const app = express();

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

app.use('/', IndexRouter);
app.use('/', AuthRouter);
app.use('/campgrounds', CampgroundsRouter);
app.use('/campgrounds', CommentsRouter);

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Listening on port...');
});