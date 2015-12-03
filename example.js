'use strict'

var Scraper = require ('./index')
  , google = new Scraper.Google()
  , bing = new Scraper.Bing()
  , pics = new Scraper.Picsearch();

// will take ALOT of time if num=undefined
google.list({
	keyword: 'banana',
	num: 10,
	detail: true,
	//resolution:'l',
	nightmare: {
		show: true
	}
})
.then(function (res) {
	console.log('first 10 results from google', res);
}).catch(function(err) {
	console.log('err', err);
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
	detail: true
}).then(function (res) {
	console.log('out',res);
}).catch(function (err) {
	console.log('err',err);
});