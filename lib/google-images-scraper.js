'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird');

function Scraper () {}

Scraper.prototype.list = function (options) {
	var self = this;

	if (!options.keyword) return Promise.reject(new Error('no keyword provided'));

	var search_base = 'https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X';
	if (this.resolution) search_base += '&tbs=isz:' + options.resolution;

	var result = [];
	var page = function (n) {
		return new Promise(function (resolve, reject) {
			self.roptions = {
				'url': search_base.replace('%', encodeURIComponent(options.keyword)),
				'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
			};

			var ijn = '&ijn=' + n;
			var start = '&start=' + n * 100;
			self.roptions.url += ijn + start;

			request(self.roptions, function (err, response, body) {
				if (!err & response.statusCode === 200) {
					if (body === '') resolve(result);	// empty response

					var $ = cheerio.load(body);
					$('.rg_l').each(function () {
						try {

							var url = $(this).attr('href');
							var original = url.split('=')[1].split('&imgrefurl')[0];
							var meta = JSON.parse($(this).parent().find('.rg_meta').text());

							var item = {
								url: original,
								thumb: meta.tu,
								format: meta.ity,
							};

							result.push(item);
						} catch(err) {
							// just dont push this item
							console.log('warn', err);
						}
					});

					if (options.num && result.length >= options.num)
						return resolve(result.slice(0, options.num));
					else 
						return resolve(page(++n));
				} else resolve(result);
			});
		});
	}

	return page(0);
}

module.exports = Scraper;