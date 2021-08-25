'use strict';

var Scraper = require('./google/scraper');

let google = new Scraper();

(async () => {
  const results = await google.scrape(['banana', 'strawberry'], 10);
  console.log('results', JSON.stringify(results));
})();
