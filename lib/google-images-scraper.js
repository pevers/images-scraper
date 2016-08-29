'use strict'

var request = require('request')
  , cheerio = require('cheerio')
  , Promise = require('bluebird')
  , Nightmare = require('nightmare')
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

	this.keyword = options.keyword;
	this.rlimit = new RateLimiter(options.rlimit || 0, 'second');
	this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
	this.noptions = options.nightmare || {};
	this.timeout = options.timeout || 10000;
	this.advanced = options.advanced;

	return self._links().then(function (res) {
		if (options.num) {
			res = res.slice(0, options.num);
		}

		res.filter(function (r) {
			return r !== null;
		});

		self.emit('end', res);
		
		return res;
	});
}

/**
 * Returns a complete list of all the image details.
 */
Scraper.prototype._links = function () {
	var self = this;
	var search_base = 'https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X';
	if (this.advanced) {
		var base = '&tbs=';
		var build = [];
		if (this.advanced.resolution) {
			build.push('isz:'+this.advanced.resolution);
		}
		if (this.advanced.imgType) { 
			build.push('itp:'+this.advanced.imgType);
		}
		if (this.advanced.color) {
			build.push('ic:'+this.advanced.color);
		}

		build = build.length > 1 ? build.join(',') : build[0];
		search_base += '&tbs='+build;
	}
	return new Promise.resolve(
		new Nightmare(self.noptions)
			.useragent(self.userAgent)
			.goto(search_base.replace('%', encodeURIComponent(self.keyword)))
			.wait()
			.inject('js', __dirname + '/jquery-2.1.4.min.js')
			
			.evaluate(function (timeout) {
				$.data(document, 'timeout', false);
				setTimeout(function () {
					$.data(document, 'timeout', true);
				}, timeout);

				setInterval(function() {
					$('html, body').animate({ scrollTop: $(document).height() }, 1000);

					var button = $('.ksb._kvc');	// try to load more
					if (button) {
						$.data(document, 'finished', false);
						button.click();
					}
				}, 1000);

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
			}, self.timeout)
			.wait(function () {
				return (($(window).scrollTop() + $(window).height() == $(document).height()) &&
						!$('.ksb._kvc').is(':visible') &&
						$.data(document, 'finished')) || $.data(document, 'timeout');
			})

			.evaluate(function () {
				// get all the src's
				var results = [];
				$('.rg_l').each(function () {
					var meta = JSON.parse($(this).parent().find('.rg_meta').text());

					var item = {
						type: 'image/' + meta.ity,
						width: meta.ow,
						height: meta.oh,
						// size: meta.os.match(/[-+]?(\d*[.])?\d+/)[0], // fails query as property no longer exists
						url: meta.ou,
						thumb_url: meta.tu,
						thumb_width: meta.tw,
						thumb_height: meta.th
						// unit: meta.os.match(/\D+/).slice(-1)[0] // fails query as property no longer exists
					};

					results.push(item);
				});
				return results;
			}).end()
	);
}

module.exports = Scraper;
