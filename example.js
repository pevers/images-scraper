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
	nightmare: {
		show: true
	}
	//resolution:'l',
})
.then(function (res) {
	console.log('first 10 results from google', res);
}).catch(function(err) {
	console.log('err',err);
});

bing.list({
	keyword: 'banana',
	num: 10
})
.then(function (res) {
	console.log('first 10 results from bing', res);
}).catch(function(err) {
	console.log('err',err);
})

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
	console.log('results',res);
}).catch(function (err) {
	console.log('err',err);
});