// ---------- Set Requirements ---------- //

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('./schemas.js')

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

// ---------- Form Validation  ---------- //  

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if(error) {
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg, 400)
	} else {
		next();
	}
}

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if(error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400)
	} else {
		next();
	}
}

// ----------  Routing ---------- //  

app.get('/', (req, res) => {
	res.render('home');
});

// Show all campgrounds

app.get('/campgrounds', catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds })
}));

// Create new campground

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new')
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
	// if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
		const campground = new Campground(req.body.campground)
		await campground.save();
		res.redirect(`/campgrounds/${ campground._id }`)
}));

// Show campground details

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate('reviews');
	res.render('campgrounds/show', { campground });
}));

// Edit campground

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
	res.redirect(`/campgrounds/${ campground._id }`);
}));

// Delete campground

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	res.redirect(`/campgrounds`);
}));

// Add reviews

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	res.redirect(`/campgrounds/${ campground._id }`);
}))

// Delete reviews

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	res.redirect(`/campgrounds/${id}`);
}))


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