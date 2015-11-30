'use strict'

var Scraper = require ('./lib/google-images-scraper');

var scraper = new Scraper({
	keyword: 'banana',
	nightmare: {
		show: true
	}
});

scraper.list(10).then(function (res) {
	console.log(res);
}).catch(function(err) {
	console.log('err', err);
});