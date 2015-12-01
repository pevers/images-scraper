'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird');

function Scraper () { }

/**
 * Get the image src for all links, options.keyword is required.
 */
Scraper.prototype.list = function (options) {
	var self = this;

	if (!options.keyword) return Promise.reject(new Error('no keyword provided'));

	var roptions = {
		'url': 'http://www.bing.com/images/search?q=%&view=detailv2'.replace('%', encodeURIComponent(options.keyword)),
		'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
	};

	var result = [], num = options.num;
	var extract = function(url) {
		return new Promise(function (resolve) {
			options.url = url; 
			request(roptions, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					// extract all items, go to next page if exist
					var $ = cheerio.load(body);
					$('.item a[class="thumb"]').each(function (el) {
						result.push($(this).attr('href'));
					});

					if (num && result.length > num) {
						return resolve(result.slice(0,num));
					}
					
					// search for current page and select next one
					var page = $('li a[class="sb_pagS"]').parent().next().find('a').attr('href');
					if (page) resolve(extract('http://www.bing.com' + page + '&view=detailv2'));
					else resolve(result);

				} else resolve(result)
			});
		});
	};

	return extract(roptions.url);
}

module.exports = Scraper;