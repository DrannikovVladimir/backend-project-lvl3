/* eslint-disable func-names */
import fs from 'fs/promises';
import cheerio from 'cheerio';
import Path from 'path';
import {
  getData,
  downloadImage,
} from './server.js';
import {
  getImageName,
  getFileName,
  getDirName,
} from './names.js';

const writeData = (data, filename) => fs
  .writeFile(filename, data)
  .catch((error) => console.log('File was not wrote: ', error));

const createDir = (name) => fs
  .mkdir(name, { recursive: true })
  .catch((error) => console.log('Dir was not created: ', error));

const getLinksTagLink = (html, url) => {
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

const downloadTagLinks = (links, dirname) => {
  const data = links.split(' ').filter((item) => item).map((link) => {
    const currentLink = new URL(link);
    const name = `${currentLink.hostname}${currentLink.pathname}`;
    if (name.includes('http')) {
      return null;
    }
    return ({ name, link });
  });

  data.filter((item) => item !== null).map(({ name, link }) => getData(link)
    .then((result) => {
      const currentName = getImageName(name);
      const path = Path.join(dirname, currentName);
      writeData(result.data, path);
    }));
};

const getScriptLinks = (html, url) => {
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

const downloadScripts = (links, dirname) => {
  const data = links.split(' ').map((link) => {
    const currentLink = new URL(link);
    const name = `${currentLink.hostname}${currentLink.pathname}`;
    if (name.includes('http')) {
      return null;
    }
    return ({ name, link });
  });

  data.filter((item) => item !== null).map(({ name, link }) => getData(link)
    .then((result) => {
      const currentName = getImageName(name);
      const path = Path.join(dirname, currentName);
      writeData(result.data, path);
    }));
};

const getImageLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostName = new URL(url);
  return $('img').map(function () {
    const src = $(this).attr('src');
    const host = src.includes('http') ? '' : `${hostName.href}`;
    const path = `${host}${src}`;
    return path;
  }).get().join(' ');
};

const downloadImages = (links, dirname) => {
  const data = links.split(' ').map((link) => {
    const currentLink = new URL(link);
    const hostname = currentLink.hostname.replaceAll('.', '-');
    const pathname = currentLink.pathname.replaceAll('/', '-');
    const name = `${hostname}${pathname}`;
    return ({ name, link });
  });
  data.map(({ name, link }) => downloadImage(link)
    .then((result) => {
      const path = Path.join(dirname, name);
      writeData(result, path);
    }));
};

const downloadPage = (html, dirname, filename, url) => {
  const host = new URL(url);
  const hostname = host.hostname.replaceAll('.', '-');
  const $ = cheerio.load(html);
  $('img').map(function () {
    const name = getImageName($(this).attr('src'));
    const pathname = $(this).attr('src').includes('cdn')
      ? name
      : `${hostname}-${name}`;
    const path = Path.join(dirname, pathname);
    return $(this).attr('src', path);
  });
  $('link').map(function () {
    if ($(this).attr('href').includes('http')) {
      return $(this);
    }
    const name = getImageName($(this).attr('href'));
    const path = Path.join(dirname, `${hostname}-${name}`);
    return $(this).attr('href', path);
  });
  $('script').map(function () {
    if ($(this).attr('src') && !$(this).attr('src').includes('http')) {
      const name = getImageName($(this).attr('src'));
      const path = Path.join(dirname, `${hostname}-${name}`);
      return $(this).attr('src', path);
    }
    return $(this);
  });
  writeData($.html(), filename);
};

export default (url) => {
  const filename = getFileName(url);
  const dirname = getDirName(url);

  getData(url)
    .then((result) => {
      const imageLinks = getImageLinks(result.data, url);
      const scriptLinks = getScriptLinks(result.data, url);
      const linksTagLink = getLinksTagLink(result.data, url);
      createDir(dirname);
      downloadScripts(scriptLinks, dirname);
      downloadTagLinks(linksTagLink, dirname);
      downloadImages(imageLinks, dirname);
      downloadPage(result.data, dirname, filename, url);
    })
    .catch((error) => console.log(error));
};
