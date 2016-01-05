'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird')
  , RateLimiter = require('limiter').RateLimiter
  , EventEmitter = require('events')
  , util = require('util');

function Scraper () {
	EventEmitter.call(this);
}

util.inherits(Scraper, EventEmitter);

/**
 * Get the image src for images, options specify the details.
 */
Scraper.prototype.list = function (options) {
	var self = this;

	if (!options || !options.keyword) return Promise.reject(new Error('no keyword provided'));

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
						var html = JSON.parse(body).html;
						if (!html) {
							self.emit('end', result);
							return resolve(result);
						}

						var $ = cheerio.load(html);
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

								self.emit('result', item);
								result.push(item);
							} catch(err) {
								// warn
								console.log('warn', err);
							}
						});

						if (options.num && result.length > options.num) {
							var out = result.slice(0, options.num);
							self.emit('end', out);
							return resolve(out);
						}

						// next page
						resolve(nextPage(n + 60))
					} else {
						self.emit('end', result);
						resolve(result);
					}
				});
			});
		});		
	}

	return nextPage(1);
}

module.exports = Scraper;