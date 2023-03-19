// ---------- Set Requirements ---------- //

if(process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// ---------- Connection to the MongoDB ---------- // 

mongoose.set('strictQuery', true);

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
	useNewUrlParser: true,
	useUnifiedTopology: true
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
	console.log('Database connected');
  });

// ---------- App Config ---------- //  

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); // => set view engine to ejs
app.set('views', path.join(__dirname, 'views')); // => set views folder

app.use(express.urlencoded({ extended: true })) // => encode the url while creating new campground -> without it after app.post in res.send(req.body) nothing will be shown
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
	replaceWith: '_'
}));

const sessionConfig = {
	secret: 'mysecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 	24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// ----------  Routing ---------- //  

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
	res.render('home');
});


// Error handler

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if(!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
})

// Server listening

app.listen(3000, () => {
	console.log('Serving on port 3000')
});