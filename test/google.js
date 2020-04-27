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

  it('should be rejected if no search query is provided', () => {
    const scraper = new Scraper();
    return scraper.scrape().should.be.rejected;
  });

  it('should return the correct length with pagination', async () => {
    const google = new Scraper();
    const results = await google.scrape('banana', 300);
    expect(results.length).be.equal(300);
    for (result of results) {
      const occurrences = results.filter(searchResult => searchResult.url === result.url);
      expect(occurrences.length).to.lessThan(5);
    }
  });

  it('should stop when the end is reached', async () => {
    const google = new Scraper();
    const results = await google.scrape('banana', 1000);
    expect(results.length).be.lessThan(1000);
  })
});
