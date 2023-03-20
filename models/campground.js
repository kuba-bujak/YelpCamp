// ---------- Set Requirements ---------- //

const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// ---------- Campgrounds Data Schema ---------- //

const ImageSchema = new Schema({
	url: String,
	filename: String
})

ImageSchema.virtual('thumbnail').get(function() { 		// => change original size into width: 200px
	return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }; // => after change DB drom local to online

const CampgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
}, opts);

// ---------- Create popup Markup to Mapbox ---------- //

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
	return `
	<strong><a href="/campgrounds/${ this._id }">${ this.title }</a></strong>
	<p>${ this.description.substring(0, 20) }...</p>`;
})

// ----------  Delete all Reviews when deleting Campground  ---------- //

CampgroundSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		})
	}
})

module.exports = mongoose.model('Campground', CampgroundSchema)

