'use strict';

var Scraper = require('./google/scraper');

let google = new Scraper();

(async () => {
  const results = await google.scrape('banana', 10); // For multiple queries: ['banana', 'strawberry']
  console.log('results', JSON.stringify(results));
})();
