var ntmap;
var places;
var markerGroup;
var $geo;

$(document).ready(function() {
	initOptions();
	initMap();
	centreMap();
	initAndLoad();
});

function initOptions() {
	options = JSON.parse(Cookies.get('nt-options') || '{}');
}

function initMap() {
	ntmap = L.map('mapid', {
		fullscreenControl: true,
		fullscreenControlOptions: {
		  position: 'topright'
		},
		zoomControl: false,
		maxBounds: new L.LatLngBounds( new L.LatLng(-90, -180), new L.LatLng(90, 180)),
		minZoom: 2,
	});
	L.control.zoom({
		position:'topright'
	}).addTo(ntmap);
	markerGroup = L.featureGroup().addTo(ntmap);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(ntmap);
	ntmap.on('contextmenu', function (eventData) { window.location.hash ='#closest-5-'+eventData.latlng.lat + ',' + eventData.latlng.lng; });
}

function centreMap() {
	// centre on the complete bounds of all UK
	ntmap.fitBounds(
		[
			[52.421457000779704, -3.6571837775409226],
			[50.880985171180015, 0.2859234809875489]
		]
	);
}

function addDoneMarker(latitude, longitude, place) {
	var markerIcon = L.ExtraMarkers.icon({
		markerColor: 'green-light',
		icon: 'fa-check',
		prefix: 'fa'
	});
	console.info('adding done marker for ' + place.title);
	addMarker(latitude, longitude, place, markerIcon);
}

function addMarker(latitude, longitude, place, markerIcon) {
	if (markerIcon === undefined) {
		markerIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});
	}
	var marker = L.marker([latitude, longitude]);

	// header and link
	var markerContent = '<a href="'+place.websiteUrl+'" target="_blank">'+place.title+'</a> ';
	// directions
	markerContent += '<a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+latitude+','+longitude+'&travelmode=driving">Directions</a><br/>';
	// description
	markerContent += place.description+'<br />';
	// image
	markerContent += '<img width="200px" src="'+place.imageUrl+'"/><br />';
	var placeId = getPlaceId(place);
	if (isPlaceDone(place)) {
		markerContent += '<a href="./option/#'+placeId+'=false">unmark place as visited &cross;</a><br />';
	} else {
		markerContent += '<a href="./option/#'+placeId+'=true">mark place as visited &check;</a><br />';
	}
	// markerContent += '<a target="_blank" href="https://www.happycow.net/searchmap?lat='+latitude+'&lng='+longitude+'&vegan=true">Local vegan food</a>';
	marker.bindPopup(markerContent);
	marker.addTo(markerGroup);
}

function displayPlaces() {
	var placesData = Object.values(places);
	for (var i = 0; i < placesData.length; i++) {
		var place = placesData[i];
		if (isPlaceDone(place)) {
			addDoneMarker(place.location.latitude, place.location.longitude, place);
		} else {
			addMarker(place.location.latitude, place.location.longitude, place);
		}
	}
}

function isPlaceDone(place) {
	var options = JSON.parse(Cookies.get('ntoptions') || '{}');
	var placeId = getPlaceId(place);
	if (options[placeId] === undefined) {
		return false;
	}
	console.info(JSON.parse(options[placeId]));
	return JSON.parse(options[placeId]);
}

function getPlaceId(place) {
	return place.websiteUrl.replace(/^https:\/\/www.nationaltrust.org.uk\//, '');
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1);
	var a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

function load() {
	$(document).ready(function() {
		markerGroup.clearLayers();
		displayPlaces();
	});
}

function init() {
	$(window).bind( 'hashchange', function(event) {
		load();
	});
	$.ajax({
		url: './places.json',
		async: false,
	}).done(function(data) {
		places = data;
	});
}

function initAndLoad() {
	init();
	load();
}