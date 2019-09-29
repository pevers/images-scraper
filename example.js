'use strict'

var Scraper = require ('./index');

let google = new Scraper.Google({
	keyword: 'coca cola',
	limit: 10,
	puppeteer: {
		headless: false
	},
  advanced: {
    imgType: 'photo', 			// options: clipart, face, lineart, news, photo
    resolution: undefined, 	// options: l(arge), m(edium), i(cons), etc.
    color: undefined 				// options: color, gray, trans
  }
});

(async () => {
	const results = await google.start();
	console.log('results',results);
})();
