'use strict'

const puppeteer = require('puppeteer');

/**
 * @param {string} keyword search query
 * @param {number} limit amount of results to query for otherwise go on indefinitely
 * @param {string} userAgent user agent
 * @param {object} puppeteer puppeteer options
 * @param {object} advanced extra options for image size, see docs
 */
class Scraper {

	constructor({ keyword, limit = 10, userAgent = 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0', puppeteer = {}, advanced }) {
		if (keyword === undefined) {
			throw new Error('no keyword provided');
		}
	
		this.searchBase = 'https://www.google.com/search?q=%&source=lnms&tbm=isch&sa=X';
		this.keyword = keyword;
		this.limit = limit;
		this.userAgent = userAgent;
		this.puppeteerOptions = puppeteer;
		this.advanced = advanced;
	}

	async start() {
		var self = this;
		let query = self.searchBase;
		if (this.advanced) {
			var build = [];
			if (this.advanced.resolution) {
				build.push('isz:' + this.advanced.resolution);
			}
			if (this.advanced.imgType) {
				build.push('itp:' + this.advanced.imgType);
			}
			if (this.advanced.color) {
				build.push('ic:' + this.advanced.color);
			}
	
			build = build.length > 1 ? build.join(',') : build[0];
			query += '&tbs=' + build;
		}

		const browser = await puppeteer.launch(self.puppeteerOptions);
		const page = await browser.newPage();
		await page.goto(query.replace('%', encodeURIComponent(self.keyword)));
		await page.addScriptTag({path:  __dirname + '/jquery-3.4.1.min.js'})
		await page.setViewport({width: 1920, height: 1080});
		await page.setUserAgent(self.userAgent);

		const results = await page.evaluate((limit) => {
			return new Promise((resolve) => {
				let results = [];
				setInterval(() => {
					// see if we have any results
					$('.rg_l').each((index, element) => {
						// check if we reached the limit
						if (results.length >= limit) {
							return resolve(results);
						}

						var meta = JSON.parse($(element).parent().find('.rg_meta').text());
						var item = {
							title: meta.pt,
							type: 'image/' + meta.ity,
							width: meta.ow,
							height: meta.oh,
							url: meta.ou,
							thumb_url: meta.tu,
							thumb_width: meta.tw,
							thumb_height: meta.th
						};
	
						if (!results.filter(result => result.url === item.url).length) {
							results.push(item);
						}
					});

					// check if we reached the bottom, if so exit
					if (($(window).scrollTop() + $(window).height() == $(document).height()) &&
							!$('.ksb._kvc').is(':visible')) {
								return resolve(results);
							}

					// scroll
					$('html, body').animate({ scrollTop: $(document).height() }, 1000);
					let button = $('.ksb._kvc');
					if (button) {
						$.data(document, 'finished', false);
						button.click();
					}
				}, 1000);
			});
		}, self.limit);

		await browser.close();
		return results;
	}
}

module.exports = Scraper;
