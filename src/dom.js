/* eslint-disable func-names */
import cheerio from 'cheerio';

export const getImageLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostName = new URL(url);
  return $('img').map(function () {
    const src = $(this).attr('src');
    if (src) {
      const path = src.includes('http') ? '' : `${hostName.href}${src}`;
      return path;
    }
    return null;
  }).get().join(' ');
};

export const getScriptLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostname = new URL(url);
  return $('script').map(function () {
    const src = $(this).attr('src');
    if (src) {
      const path = src.includes('http') ? src : `${hostname.href}${src}`;
      return path;
    }
    return null;
  }).get().join(' ');
};

export const getTagLinkLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostname = new URL(url);
  return $('link').map(function () {
    const href = $(this).attr('href');
    if (href) {
      const path = href.includes('http') ? '' : `${hostname.href}${href}`;
      return path;
    }
    return null;
  }).get().join(' ');
};
