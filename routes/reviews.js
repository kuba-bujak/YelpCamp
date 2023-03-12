// ---------- Set Requirements ---------- //

const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');

// ----------  Routing ---------- // 

// Add reviews

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete reviews

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;