const fileSize = require('./helpers/file-size');

describe('Google Tests', function() {
  this.timeout(60000); // 1 minute timeout

  const Scraper = require('../src/google/scraper');
  const validator = require('validator');
  const expect = require('chai').expect;

  it('should not return anything for 4vWJtGWF6mj7', () => {
    const google = new Scraper();
    return google.scrape('4vWJtGWF6mj7', 10).should.eventually.be.empty;
  });

  it('should eventually return some results for banana', async () => {
    const google = new Scraper();
    const results = await google.scrape('banana', 10);
    for (result of results) {
      validator.isURL(result.url).should.be.true;
    }
  });

  it('should return icons', async () => {
    const google = new Scraper({ tbs: { isz: 'i' } });
    const results = await google.scrape('banana', 5);
    for (result of results) {
      const size = await fileSize(result.url);
      expect(size <= 100000).to.be.true;
    }
  });

  it('should be rejected if no search query is provided', () => {
    const scraper = new Scraper();
    return scraper.scrape().should.be.rejected;
  });
});
