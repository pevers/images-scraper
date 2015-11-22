# google-images-scraper
Simple and fast scraper for Google images using Nightmare. A rate limiter is implemented and can be used to prevent bans.

# Installation
```npm install google-images-scraper```

# Example
Give me the first 10 images of Banana's

```js
var Scraper = require('./google-images-scraper');

var scraper = new Scraper({
	keyword: 'banana',
	rlimit: 10	// 10 p second
});

scraper.list(10).then(function (res) {
	console.log(res);
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

Another example to use the request and fs module to write the image to output:

```js
var Scraper = require('./google-images-scraper')
  , fs = require('fs')
  , request = require('request');

var scraper = new Scraper({
	keyword: 'banana',
	rlimit: 10	// 10 p second
});

scraper.list(10).then(function (res) {
	console.log('first 10 results', res);

	res.forEach(function(r) {
		var file = r.split('/');
		var r = request(r).pipe(fs.createWriteStream(file[file.length-1]));
	});
});
```

#Options
Options that can be passed to google-images-scraper:

```js
var options = {
	keyword: 'keyword' // required,
	rlimit: '10',	// number of requests to Google p second (can be 0 for unlimited)
	userAgent: 'G.I. Joe'	// the user agent for each request to Google
}
```

# License
Copyright (c) 2015, Peter Evers <pevers90@gmail.com>
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.