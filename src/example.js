'use strict';

var Scraper = require('./google/scraper');

let google = new Scraper();

(async () => {
  const results = await google.scrape('banana', 10);
  console.log('results', results);
})();
