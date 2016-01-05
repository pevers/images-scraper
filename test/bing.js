describe('bing', function() {
	this.timeout(50000);		// 50 s timeout

	var Scraper = require('../index');
	var bing = new Scraper.Bing();
	var _ = require('lodash');
	var validator = require('validator');
	var should = require('chai').should();

	it('should probably not return anything for xckjasxasxasxasxcdcsdcsdcsq23123412312365u76j67', function() {
		return bing.list({
			keyword: 'xckjasxasxasxasxcdcsdcsdcsq23123412312365u76j67',
			num: 10
		}).should.eventually.be.empty;
	});
	
	it('should eventually return some results', function(done) {
		return bing.list({
			keyword: 'coca cola',
			num: 10
		})
		.then(function(res) {
			res.forEach(function(item) {
				validator.isURL(item.url).should.be.true;
				validator.isURL(item.thumb).should.be.true;
				validator.isNumeric(item.width).should.be.true;
				validator.isNumeric(item.height).should.be.true;
				validator.isNumeric(item.size).should.be.true;
			});
			done();
		})
		.catch(function(err) {
			should.fail(null, null, err);
			done();
		});
	});

	it('should be rejected if no keyword is provided', function() {
		return bing.list({}).should.rejected;
	});

	it('should be rejected if no options are provided', function() {
		return bing.list().should.rejected;
	});
});