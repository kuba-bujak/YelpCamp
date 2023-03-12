// ---------- Set Requirements ---------- //

const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
 
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// ----------  Routing ---------- // 

// Show all campgrounds

router.get('/', catchAsync(campgrounds.index));

// Create new campground

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post('/', validateCampground, catchAsync(campgrounds.createCampground));

// Show campground details

router.get('/:id', catchAsync(campgrounds.showCampground));

// Edit campground

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor ,validateCampground, catchAsync(campgrounds.updateCampground));

// Delete campground

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;