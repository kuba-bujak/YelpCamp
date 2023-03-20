// ---------- Set Requirements ---------- //

const campground = require("../../models/campground");

// ---------- Create map for every Campground ---------- //

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: campground.geometry.coordinates,
	zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 })
			.setHTML(
				`<h3>${campground.title}</h3>`
			)
	)
	.addTo(map);