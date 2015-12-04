'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird')
  , RateLimiter = require('limiter').RateLimiter;

var fs = require('fs');

function Scraper () {}

/**
 * Get the image src for images, options specify the details.
 */
Scraper.prototype.list = function (options) {
	var self = this;

	if (!options.keyword) return Promise.reject(new Error('no keyword provided'));

	this.rlimit = new RateLimiter(options.rlimit || 0, 'second');
	this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

	var base = 'https://images.search.yahoo.com/search/images?fr=yfp-t-404&fr2=piv-web&o=js&p=%&tab=organic&tmpl=&nost=1';

	var roptions = {
		'User-Agent': this.userAgent
	}

	var result = [];
	var nextPage = function (n) {
		return new Promise(function (resolve, reject) {
			roptions.url = base.replace('%', options.keyword) + '&b=' + n;
			self.rlimit.removeTokens(1, function() {
				request(roptions, function(err, response, body) {
					if (!err && response.statusCode === 200) {
						var $ = cheerio.load(JSON.parse(body).html);
						$('.ld').each(function () {
							var meta = JSON.parse($(this).attr('data'));
							try {
								var item = {
									url: meta.iurl,
									thumb: meta.ith,
									width: meta.w,
									height: meta.h,
									size: meta.s.match(/[-+]?(\d*[.])?\d+/)[0],
									format: meta.s.match(/\D\D/)[0]
								}

								result.push(item);
							} catch(err) {
								// warn
								console.log('warn', err);
							}
						});

						if (options.num && result.length > options.num) {
							return resolve(result.slice(0, options.num));
						}

						// next page
						resolve(nextPage(n + 60))
					} else resolve(result);
				});
			});
		});		
	}

	return nextPage(1);
}

module.exports = Scraper;