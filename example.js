'use strict'

var Scraper = require ('./lib/google-images-scraper');

var scraper = new Scraper({
	keyword: 'coca cola',
	nightmare: {
		show: true
	}
});

scraper.list(300).then(function (res) {
	console.log(res);
});