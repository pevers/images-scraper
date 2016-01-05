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

	var roptions = {
		'url': 'http://www.bing.com/images/search?q=%&view=detailv2'.replace('%', encodeURIComponent(options.keyword)),
		'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
	};

	var result = [], num = options.num;
	var extract = function(url) {
		return new Promise(function (resolve) {
			roptions.url = url;
			request(roptions, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					// extract all items, go to next page if exist
					var $ = cheerio.load(body);
					$('.item a[class="thumb"]').each(function (el) {
						var item = $(this).attr('href');
						
						var detail = $(this).parent().find('.fileInfo').text();
						item = {
							url: item,
							thumb: $(this).find('img').attr('src'),
							width: detail.split(' ')[0],
							height: detail.split(' ')[2],
							format: detail.split(' ')[3],
							size: detail.split(' ')[4],
							unit: detail.split(' ')[5]
						};
						
						self.emit('result', item);
						result.push(item);
					});

					if (num && result.length > num) {
						var out = result.slice(0, num);
						self.emit('end', out);
						return resolve(result.slice(0,num));
					}
					
					// search for current page and select next one
					var page = $('li a[class="sb_pagS"]').parent().next().find('a').attr('href');
					if (page) {
						resolve(extract('http://www.bing.com' + page + '&view=detailv2'));
					}
					else {
						self.emit('end', result);
						resolve(result);
					}

				} else {
					self.emit('end', result);
					resolve(result)
				}
			});
		});
	};

	return extract(roptions.url);
}

module.exports = Scraper;