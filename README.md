[![Build Status](https://travis-ci.com/pevers/images-scraper.svg?branch=master)](https://travis-ci.com/pevers/images-scraper)
# images-scraper
This a simple way to scrape Google images using Puppeteer. The headless browser will behave as a 'normal' user and scrolls to the bottom of the page until we have enough results.

<p align="center">
    <img src="https://media.giphy.com/media/WSqsRhuPWPTrYtXAiN/giphy.gif">
</p>

# Installation
```npm install images-scraper```

# Example
Give me the first 200 images of Banana's from Google (using headless browser)

```js
var Scraper = require ('images-scraper');

let google = new Scraper.Google({
	keyword: 'banana',
	limit: 200,
	puppeteer: {
		headless: false
	},
  tbs: {
		// every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
    isz: undefined, 				// options: l(arge), m(edium), i(cons), etc. 
    itp: undefined, 				// options: clipart, face, lineart, news, photo
		ic: undefined, 					// options: color, gray, trans
		sur: undefined,					// options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
  }
});

(async () => {
	const results = await google.start();
	console.log('results',results);
})();
```

# Options
Options that can be passed to the scraper:

```js
var options = {
	keyword: 'banana', // required,
	userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0', // the user agent
	limit: 10, // amount of results to fetch
	puppeteer: {}, // puppeteer options, for example, { headless: false }
	tbs: {}, // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
}
```

# License
Copyright (c) 2019, Peter Evers <pevers90@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
