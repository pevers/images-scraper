describe('Google Tests', function() {
	this.timeout(60000);		// 1 minute timeout

	const Scraper = require('../index');
	const validator = require('validator');
	const expect = require('chai').expect;

	it('should probably not return anything for ROTC275-mice', () => {
		const google = new Scraper.Google({
			keyword: 'ROTC275-mice',
			limit: 10
		});
		return google.start().should.eventually.be.empty;
	});
	
	it('should eventually return some results for coca cola', async () => {
		const google = new Scraper.Google({
			keyword: 'coca cola',
			limit: 10
		});
		const results = await google.start();
		results.forEach(item => {
			validator.isURL(item.url).should.be.true;
			validator.isURL(item.thumb_url).should.be.true;
			expect(item.width).to.be.a('number');
			expect(item.height).to.be.a('number');
		});
	});

	it('should return icons', async () => {
		const google = new Scraper.Google({
			keyword: 'coca cola',
			advanced: { resolution: 'i' },
			limit: 10
		});
		const results = await google.start();
		results.forEach(item => {
			expect(item.width <= 256).to.be.true;
		});
	});

	it('should be rejected if no keyword is provided', () => {
		expect(() => new Scraper.Google({
			limit: 10
		})).to.throw('no keyword provided');
	});
});