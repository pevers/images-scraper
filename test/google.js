describe('google', function() {
	this.timeout(50000);		// 50 s timeout

	var Scraper = require('../index');
	var google = new Scraper.Google();
	var _ = require('lodash');
	var validator = require('validator');
	var should = require('chai').should();

	it('should probably not return anything for xckjasxasxasxasxcdcsdcsdcsq23123412312365u76j67', function() {
		return google.list({
			keyword: 'xckjasxasxasxasxcdcsdcsdcsq23123412312365u76j67',
			num: 10
		}).should.eventually.be.empty;
	});
	
	it('should eventually return some results', function(done) {
		return google.list({
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

	it('should return icons', function(done) {
		return google.list({
			keyword: 'coca cola',
			resolution: 'i',
			num: 10
		})
		.then(function(res) {
			_.find(res, function(item) {
				return parseInt(item.size) < 25; 
			}).should.not.be.empty;
			done();
		})
		.catch(function(err) {
			should.fail(null, null, err);
			done();
		})
	});

	it('should be rejected if no keyword is provided', function() {
		return google.list({}).should.rejected;
	});

	it('should be rejected if no options are provided', function() {
		return google.list().should.rejected;
	});
});