'use strict';

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const url = require('url');
const logger = require('../logger');

/**
 * @param {string} userAgent user agent
 * @param {object} puppeteer puppeteer options
 * @param {object} tbs extra options for TBS request parameter
 */
class GoogleScraper {
  constructor({
    userAgent = 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0',
    scrollDelay = 100,
    puppeteer = {},
    tbs = {},
  } = {}) {
    this.userAgent = userAgent;
    this.scrollDelay = scrollDelay;
    this.puppeteerOptions = puppeteer;
    this.tbs = this._parseRequestParameters(tbs);
  }

  _parseRequestParameters(tbs) {
    if (tbs === undefined) {
      return '';
    }

    const options = Object.keys(tbs)
      .filter(key => tbs[key])
      .map(key => `${key}:${tbs[key]}`)
      .join(',');
    return encodeURIComponent(options);
  }

  async scrape(searchQuery, limit = 100) {
    if (searchQuery === undefined || searchQuery === '') {
      throw new Error('Invalid search query provided');
    }
    const query = `https://www.google.com/search?q=${searchQuery}&source=lnms&tbm=isch&sa=X&tbs=${this.tbs}`;

    logger.info(`Start Google search for "${searchQuery}"`);
    const browser = await puppeteer.launch({
      ...this.puppeteerOptions,
    });
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto(query, {
      waitUntil: 'networkidle0',
    });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(this.userAgent);

    let results = [];
    let isEndNotReached = true;
    while (results.length < limit && isEndNotReached) {
      isEndNotReached = await this._scrollToEnd(page);
      await this._clickAllImages(page);

      const html = await page.content();
      const links = this._parseLinksFromHTML(html);
      results = links.slice(0, limit);

      logger.debug(`Got ${results.length} results so far`);
    }

    await browser.close();
    return results;
  }

  /**
   * Scroll to the end of the page.
   * @param {page} Puppeteer page to scroll
   * @returns false if the end of the page is reached. Otherwise true.
   */
  async _scrollToEnd(page) {
    logger.debug('Scrolling to the end of the page');

    const isScrollable = await this._isScrollable(page);
    if (!isScrollable) {
      logger.debug('No results on this page');
      return false;
    }

    const buttonIsVisible = await this._isButtonVisible(page);
    let infiniteScrollStatus = await this._getInfiniteScrollStatus(page);

    if (infiniteScrollStatus === "Looks like you've reached the end") {
      logger.debug('Reached the end of the page');
      return false;
    }

    const previousHeight = await page.evaluate('document.body.scrollHeight');

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    logger.debug(`Scrolled to bottom of the page`);

    if (buttonIsVisible) {
      await page.click("#islmp input[type='button']");
      logger.debug('Clicked on show more results');
    }

    await page.waitFor(this.scrollDelay);
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

    return true; // We (might) still have some more results
  }

  _isScrollable(page) {
    return page.evaluate(() => {
      return document.querySelector("#islmp input[type='button']") !== null;
    });
  }

  _isButtonVisible(page) {
    return page.evaluate(() => {
      function isVisible(e) {
        return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      }
      return isVisible(document.querySelector("#islmp input[type='button']"));
    });
  }

  _getInfiniteScrollStatus(page) {
    return page.evaluate(() => {
      let status = document.querySelector('#islmp div[data-endedmessage] > div:last-child')
        .innerText;
      return status;
    });
  }

  async _clickAllImages(page) {
    logger.debug('Scrolling to the end of the page');
    return page.evaluate(() => {
      let elements = document.querySelectorAll('#islrg img');

      function rightClick(element) {
        return new Promise(resolve => {
          let event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: false,
            view: window,
            button: 2,
            buttons: 2,
            clientX: element.getBoundingClientRect().x,
            clientY: element.getBoundingClientRect().y,
          });
          element.dispatchEvent(event);
          resolve();
        });
      }

      async function rightClickAll(elements) {
        for (const element of elements) {
          await rightClick(element);
        }
      }
      rightClickAll(elements);
    });
  }

  _parseLinksFromHTML(html) {
    let links = [];

    let $ = cheerio.load(html);

    $("#islrg a[href^='/imgres']").each(function(i, elem) {
      let description = $(this)
        .next()
        .find('div > div:first-child')
        .text();

      let link = $(this).attr('href');

      let parsedLink = url.parse(link, { parseQueryString: true });
      let imageurl = parsedLink.query.imgurl;
      let source = parsedLink.query.imgrefurl;

      links.push({ url: imageurl, source, description });
    });

    return links;
  }
}

module.exports = GoogleScraper;
