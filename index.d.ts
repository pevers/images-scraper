import { LaunchOptions } from 'puppeteer';

export default class Scraper {
  constructor(options: Scraper.ScraperOptions);
  /**
   * Scrape for a given query until we reached the limit.
   * @param searchQuery the search query.
   * @param limit search limit, defaults to 100
   */
  scrape(searchQuery: string | string[], limit?: number): Promise<Scraper.ScrapeResult>;
}

declare namespace Scraper {
  export interface ScraperOptions {
    /**
     * The user agent when browsing.
     * @default "Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64"
     */
    userAgent?: string;
    /**
     * Scroll delay in milliseconds before scrolling down.
     *  Set to a high value for slow connections.
     * @default 500
     */
    scrollDelay?: number;
    /**
     * Extra options to the Puppeteer headless browser API
     * @default {}
     */
    puppeteer?: LaunchOptions;
    /**
     * Custom search options
     * @default {}
     */
    tbs?: SearchOptions;
    /**
     * Enables/disables safe search
     * @default false
     */
    safe?: boolean;
  }

  export interface SearchOptions {
    /**
     * Icon size, l(arge), m(edium), i(cons), etc.
     */
    isz?: string;
    /**
     * Type, clipart, face, lineart, news, photo
     */
    itp?: string;
    /**
     * Colors, color, gray, trans
     */
    ic?: string;
    /**
     * Commercial options, fmc (commercial reuse with modification), fc (commercial
     */
    sur?: string;
  }

  export interface ScrapeResult {
    /**
     * The URL for an image.
     */
    url: string;
    /**
     * The source for an image.
     */
    source: string;
    /**
     * Title for an image.
     */
    title: string;
  }
}
