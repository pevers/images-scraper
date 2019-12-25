'use strict'

var Scraper = require ('./index');

let google = new Scraper.Google({
	keyword: 'banana',
	limit: 200,
	puppeteer: {
		headless: false
	},
  tbs: {
		// every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
    isz: undefined,	 				// options: l(arge), m(edium), i(cons), etc. 
    itp: undefined, 				// options: clipart, face, lineart, news, photo
		ic: undefined, 					// options: color, gray, trans
		sur: undefined,					// options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
  }
});

(async () => {
	const results = await google.start();
	console.log('results',results);
})();
