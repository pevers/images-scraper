'use strict'

var Scraper = require ('./index')
  , google = new Scraper.Google()
  , bing = new Scraper.Bing()
  , pics = new Scraper.Picsearch()
  , yahoo = new Scraper.Yahoo();

// will take ALOT of time if num=undefined
google.list({
	keyword: 'coca cola',
	num: 10,
	detail: true,
	nightmare: {
		show: true
	},
  advanced: {
    imgType: 'photo', // options: clipart, face, lineart, news, photo
    resolution: undefined, // options: l(arge), m(edium), i(cons), etc.
    color: undefined // options: color, gray, trans
  }
})
.then(function (res) {
	console.log('first 10 results from google', res);
}).catch(function(err) {
	console.log('err',err);
});

// listening on events is also possible
google.on('result', function(item) {
	console.log('result', item);
});

bing.list({
	keyword: 'banana',
	num: 10
})
.then(function (res) {
	console.log('first 10 results from bing', res);
}).catch(function(err) {
	console.log('err',err);
});

pics.list({
	keyword: 'banana',
	num: 10,
}).then(function (res) {
	console.log('out',res);
}).catch(function (err) {
	console.log('err',err);
});

yahoo.list({
	keyword: 'banana',
	num: 10,
}).then(function (res) {
	console.log('results', res);
}).catch(function (err) {
	console.log('err',err);
});