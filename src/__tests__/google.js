const Scraper = require('../google/scraper');
const validator = require('validator');

jest.setTimeout(60_000);

test('should be rejected if no search query is provided', () => {
  const scraper = new Scraper();
  return expect(scraper.scrape).rejects.toThrow('Invalid search query provided');
});

test('should eventually return some results for banana', async () => {
  const google = new Scraper();
  const results = await google.scrape('banana', 10);
  for (result of results) {
    expect(validator.isURL(result.url)).toBe(true);
  }
});

test('should return the correct length with pagination', async () => {
  const google = new Scraper();
  const results = await google.scrape('banana', 300);
  expect(results.length).toBe(300);
  for (result of results) {
    const occurrences = results.filter((searchResult) => searchResult.url === result.url);
    expect(occurrences.length).toBeLessThan(5);
  }
});

test('should stop when the end is reached', async () => {
  const google = new Scraper();
  const results = await google.scrape('banana', 1000);
  expect(results.length).toBeLessThan(1000);
});
