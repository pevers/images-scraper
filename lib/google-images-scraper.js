'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird')
  , Nightmare = require('nightmare')
  , RateLimiter = require('limiter').RateLimiter;

function Scraper (options) {
	this.keyword = options.keyword;
	this.rlimit = new RateLimiter(options.rlimit || 0, 'second');
	this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
}

/**
 * Get the image src for all [num] links, if empty will get all.
 */
Scraper.prototype.list = function (num) {
	var self = this;

	return new Promise.resolve(
		self._links().bind(self).then(function (res) {
			var extract = res.slice(0,num).map(function(r) {
				return self._extractUrl(r);
			});
			return Promise.all(extract);
		})
	);
}

Scraper.prototype._extractUrl = function (url) {
	var self = this;

	return new Promise(function (resolve, reject) {
		var options = {
			'url': url,
			'User-Agent': self.userAgent
		};

		self.rlimit.removeTokens(1, function() {
			request(options, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					var $ = cheerio.load(body);
					resolve($('#il_fi').attr('src'));
				} else reject(err);
			});
		});
	});
}

/**
 * Returns a complete list of all the image details.
 */
Scraper.prototype._links = function () {
	var self = this;

	return new Promise.resolve(
		new Nightmare()
			.useragent(self.userAgent)
			.goto('https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X'.replace('%', encodeURIComponent(self.keyword)))
			.inject('js', __dirname + '/jquery-2.1.4.min.js')

			.evaluate(function () {
				// max wait 5 sec.
				setTimeout(function () {
					$.data(document, 'finished', true);
				}, 5000);

				return $('html, body').animate({ scrollTop: $(document).height() }, 2000, function () {
					$.data(document, 'finished', true);
				});
			})
			.wait(function () {
				return $.data(document, 'finished');
			})

			.evaluate(function () {
				$.data(document, 'finished', false);	// reset

				// catch all AJAX events such that we can determine when we are finished
				var oldSend = XMLHttpRequest.prototype.send;
				XMLHttpRequest.prototype.send = function () {
					var oldOnReady = this.onreadystatechange;
					this.onreadystatechange = function () {
						oldOnReady.call(this);
						if (this.readyState === XMLHttpRequest.DONE)
							$.data(document, 'finished', true);
					}
					oldSend.apply(this, arguments);
				}

				var button = $('.ksb._kvc');	// load more
				if (button) button.click();
			})
			.wait(function () {
				return $.data(document, 'finished');
			})

			.evaluate(function () {
				setTimeout(function () {
					$.data(document, 'finished', true);
				}, 5000);

				$.data(document, 'finished', false);
				$('html, body').animate({ scrollTop: $(document).height() }, 2000, function () {
					$.data(document, 'finished', true);
				});
			})
			.wait(function () {
				return $.data(document, 'finished');
			})

			.evaluate(function () {
				// get all the src's
				var results = [];
				$('.rg_l').each(function () {
					results.push($(this).attr('href'));
				});
				return results;
			})
	);
}

module.exports = Scraper;