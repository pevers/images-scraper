# images-scraper
This a simple way to scrape Google/Bing images using Nightmare and not be dependent on any API. The headless browser will just behave like a normal person, scroll and click. A rate limiter is implemented and can be used to prevent bans. The Bing scraper doesn't need a headless browser and operates therefore a lot faster.

# Installation
```npm install images-scraper```

# Example Google
Give me the first 10 images of Banana's from Google (using headless browser)

```js
var Scraper = require ('images-scraper')
  , google = new Scraper.Google();

google.list({
	keyword: 'banana',
	num: 10,
	nightmare: {
		show: true
	}
})
.then(function (res) {
	console.log('first 10 results from google', res);
}).catch(function(err) {
	console.log('err', err);
});
```

Will output:

```
[ 'https://www.organicfacts.net/wp-content/uploads/2013/05/Banana21.jpg',
  'http://www.bbcgoodfood.com/sites/default/files/glossary/banana-crop.jpg',
  'http://dreamatico.com/data_images/banana/banana-3.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4c/Bananas.jpg',
  'http://pngimg.com/upload/banana_PNG835.png',
  'http://globe-views.com/dcim/dreams/bananas/bananas-03.jpg',
  'http://i.huffpost.com/gen/1553496/images/o-BANANA-facebook.jpg',
  'http://fitnessandhealthadvisor.com/wp-content/uploads/2013/05/bananas1.jpeg',
  'http://i.telegraph.co.uk/multimedia/archive/03120/banana_3120781b.jpg',
  'http://cdn1.medicalnewstoday.com/content/images/articles/271157-bananas.jpg' ]

```

# Example Bing (very fast)
```js
var Scraper = require ('images-scraper')
  , bing = new Scraper.Bing();

bing.list({
	keyword: 'banana',
	num: 10
})
.then(function (res) {
	console.log('first 10 results from bing', res);
}).catch(function(err) {
	console.log('err',err);
})
```

# Options
Options that can be passed to each scraper:

```js
var options = {
	// general
	keyword: 'keyword',		// required,
	userAgent: 'G.I. Joe',	// the user agent for each request to Google (default: Chrome)

	// google specific
	rlimit: '10',			// number of requests to Google p second, default: unlimited
	timeout: 10000,			// timeout when things go wrong, default: 10000
	nightmare: {
							// all the options for Nightmare, (show: true for example)
	}	
}
```

# License
Copyright (c) 2015, Peter Evers <pevers90@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
