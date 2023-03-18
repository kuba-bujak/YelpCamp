// ---------- Set Requirements ---------- //

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const axios = require('axios');

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

// Create random names for campgrounds

const sample = array => array[Math.floor(Math.random() * array.length)];

// call unsplash and return small image

async function seedImg() {
	try {
	  const resp = await axios.get('https://api.unsplash.com/photos/random', {
		 params: {
			client_id: 'iPr0sgpPR0YCsh1thHQX7_7vaI4HcJa3e1EA0FxVfxY',
			collections: 1114848,
		 },
	  })
	  return resp.data.urls.small
	} catch (err) {
	  console.error(err)
	}
 }

// Delete, then add seeds to DB

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 10; i++) {
		// setup
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20 + 10)

		// seed data into campground
		const camp = new Campground({
			author: '6410d146e33334f8fef99f7e',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam distinctio in fuga ea sed laudantium minima laboriosam. Natus, quas, molestiae reiciendis maiores enim harum optio expedita iusto culpa fuga vitae.',
			price: price,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude
				]
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dtcwpvabh/image/upload/v1678639432/samples/landscapes/nature-mountains.jpg',
					filename: 'samples/landscapes/nature-mountains'
				},
				{
					url: 'https://res.cloudinary.com/dtcwpvabh/image/upload/v1678639429/samples/landscapes/beach-boat.jpg',
					filename: 'samples/landscapes/beach-boat'
				}
			]
		}); 
		await camp.save();
	}
}

// ---------- Disconnect from MongoDB ---------- //

seedDB().then(() => {
	mongoose.connection.close();
})  