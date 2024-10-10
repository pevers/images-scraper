'use strict';

const Scraper = require('./google');

const google = new Scraper();

(async () => {
  const results = await google.downloadImages('cat', 10);
  console.log('results', results);
})();
