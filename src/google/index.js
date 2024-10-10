'use strict';

const puppeteer = require('puppeteer');
const fs = require("fs");
const axios = require("axios");
const path = require('path');
const logger = require('../logger');

/**
 * @param {string | array} userAgent user agent
 * @param {object} puppeteer puppeteer options
 * @param {object} tbs extra options for TBS request parameter
 */
class GoogleScraper {
  constructor({
    userAgent = [
      'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
    ],
    scrollDelay = 500,
    puppeteer = { headless: true },
    tbs = {},
    safe = false,
  } = {}) {
    this.userAgent = Array.isArray(userAgent)
      ? userAgent[Math.floor(Math.random() * userAgent.length)]
      : userAgent;
    this.scrollDelay = scrollDelay;
    this.puppeteerOptions = puppeteer;
    this.tbs = this._parseRequestParameters(tbs);
    this.safe = this._isQuerySafe(safe);
    this.browser = null;
  }

  /**
   * Method to download images based on query
   * @param {string | string[]} queries 
   * @param {number} limit 
   * @param {string} directory 
   * @returns {object}
   */
  async downloadImages(queries, limit = 5, directory = 'downloads') {
    const downloadFolder = path.join(process.cwd(), directory);

    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder);
    }

    const imageUrls = await this.getImageUrl(queries, limit);

    for (const queryKey in imageUrls) {
      const imageUrlList = imageUrls[queryKey];
      for (let i = 0; i < imageUrlList.length; i++) {
        const { url } = imageUrlList[i];
        let extension = '.jpg';
        try {
          const response = await axios.head(url);
          const contentType = response.headers['content-type'];
          if (contentType) {
            if (contentType.includes('image/jpeg')) extension = '.jpg';
            else if (contentType.includes('image/png')) extension = '.png';
            else if (contentType.includes('image/gif')) extension = '.gif';
            else if (contentType.includes('image/webp')) extension = '.webp';
          }
        } catch (error) {
          logger.info(`Error fetching headers for ${url}: ${error.message}`);
        }
        const fileName = `${queryKey}_${i + 1}${extension}`;
        const queryDownloadPath = path.join(downloadFolder, queryKey);
        if (!fs.existsSync(queryDownloadPath)) {
          fs.mkdirSync(queryDownloadPath);
        }

        const filePath = path.join(queryDownloadPath, fileName);

        try {
          const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
          fs.writeFileSync(filePath, imageResponse.data);
          logger.info(`Downloaded ${fileName}`);
        } catch (error) {
          logger.error(`Error downloading image from ${url}: ${error.message}`);
        }
      }
      logger.info(`Saved files at ${downloadFolder}`);
    }

    return imageUrls;
  }

  /**
   * Method to get an object with image urls  
   * @param {string | string[]} queries 
   * @param {number} limit 
   * @returns {object}
   */
  async getImageUrl(queries, limit = 5) {
    try {
      const browser = await puppeteer.launch({ ...this.puppeteerOptions });
      const page = await browser.newPage();
      await page.setBypassCSP(true);
      await page.setUserAgent(this.userAgent);
      const queriesIsArray = Array.isArray(queries);
      const imageUrlObject = {};

      /**
       * Used for DRY
       * @param {string} query 
       */
      const getUrls = async (query) => {
        const pageUrl = `https://www.google.com/search?${this.safe}&source=lnms&tbs=${this.tbs}&tbm=isch&q=${this._parseRequestQueries(query)}`;
        logger.debug(pageUrl);
        await page.goto(pageUrl);

        await page.evaluate(async () => {
          for (let i = 0; i < 10; i++) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(resolve => setTimeout(resolve, this.scrollDelay));
          }
        });

        await page.waitForSelector('img');

        const images = await page.evaluate(() => {
          const imageElements = document.querySelectorAll('img');
          return Array.from(imageElements)
            .map(img => img.src)
            .filter(url => url.startsWith('http') && !url.includes('google'));
        });

        const queryKey = query.replace(/\s/g, '');
        imageUrlObject[queryKey] = images.slice(0, limit).map(url => ({ query, url }));
      }

      if (queriesIsArray) {
        for (const query of queries) {
          await getUrls(query);
        }
      } else {
        await getUrls(queries);
      }

      await browser.close();
      return imageUrlObject;

    } catch (err) {
      logger.error('An error occurred:', err);
    }
  }

  _parseRequestParameters(tbs) {
    if (!tbs) {
      return '';
    }

    return encodeURIComponent(
      Object.entries(tbs)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}:${value}`)
        .join(',')
    );
  }

  _parseRequestQueries(query) {
    return query ? encodeURIComponent(query) : '';
  }

  _isQuerySafe(safe) {
    return safe ? '&safe=active' : '';
  }
}

module.exports = GoogleScraper;
