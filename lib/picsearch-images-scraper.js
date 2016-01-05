'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird')
  , EventEmitter = require('events')
  , util = require('util');

function Scraper () {
	EventEmitter.call(this);
}

util.inherits(Scraper, EventEmitter);

/**
 * Get the image src for all links, options.keyword is required.
 */
Scraper.prototype.list = function (options) {
	var self = this;

	if (!options || !options.keyword) return Promise.reject(new Error('no keyword provided'));

	var base = 'http://www.picsearch.com';

	// define options
	this.roptions = {
		'url': base + '/index.cgi?q=%'.replace('%', encodeURIComponent(options.keyword)),
		'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
	};

	var result = [], num = options.num || 2000;	// max it to 2000 for default because we can go on indefinitely
	var nextPage = function(url) {
		return new Promise(function (resolve) {
			self.roptions.url = url;
			request(self.roptions, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					var $ = cheerio.load(body);

					// no results
					if (!$('.result').length) {
						return resolve(result);
					}
					
					$('.result').each(function() {
						result.push(base + $(this).find('a').attr('href')); 
					});

					if (num && result.length > num) {
						return resolve(result.slice(0,num));
					}

					// search for current page and select next one
					var page = $('#nextPage').attr('href');
					if (page) {
						resolve(nextPage(base + page));
					}
					else {
						resolve(result);
					}
				} else {
					resolve(result)
				}
			});
		});
	};

	return nextPage(self.roptions.url).then(function (res) {
		return Promise.mapSeries(res, function (r) {
			return self._extract(r);
		}).then(function (details) {
			var result = details.filter(function (d) {
				return d !== undefined;
			});
			self.emit('end', result);
			return result;
		});
	});
}

/**
 * Extract the original image and details from a target link.
 */
Scraper.prototype._extract = function (item) {
	var self = this;

	self.roptions.url = item;

	return new Promise(function (resolve, reject) {
		request(self.roptions, function (err, response, body) {
			if (!err && response.statusCode === 200) {
				var $ = cheerio.load(body);

				var detail = $('.detail-links p').eq(1).html().split('<br>')[1].trim();
				var url = $('.thumbnailDetails a[rel="nofollow"]').attr('href')

				try {
					var item = {
						url: url,
						thumb: $('a[rel="nofollow"] img').attr('src'),
						width: detail.split('x')[0],
						height: detail.split('x')[1].split(',')[0],	// regex vs. split
						format: url.match(/[0-9a-z]+$/i)[0],	// guess the format from the url
						size: detail.split(',')[1].match(/[-+]?(\d*[.])?\d+/)[0],
						unit: detail.split(',')[1].match(/[^\d]\D+/)[0]
					}					

					self.emit('result', item);
					resolve(item);
				} catch(err) {
					resolve();	// silently die
				}
			} else resolve();	// empty response, don't fail
		});
	});
}

module.exports = Scraper;