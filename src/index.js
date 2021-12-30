/* eslint-disable func-names */
import fs from 'fs/promises';
import debug from 'debug';
import cheerio from 'cheerio';
import Path from 'path';
import Listr from 'listr';
import 'axios-debug-log';

import {
  getData,
  downloadImage,
} from './server.js';
import {
  getImageName,
  getFileName,
  getDirName,
} from './names.js';
import {
  getImageLinks,
  getTagLinkLinks,
  getScriptLinks,
} from './dom.js';

const log = debug('page-loader');

const writeData = (data, filename) => fs
  .writeFile(filename, data)
  .catch((error) => console.log('File was not wrote: ', error));

const createDir = (name) => fs
  .mkdir(name, { recursive: true })
  .catch((error) => console.log('Dir was not created: ', error));

const writeResources = (data, dirname) => {
  data.filter((item) => item !== null).map(({ name, link }) => getData(link)
    .then((result) => {
      const currentName = getImageName(name);
      const path = Path.join(dirname, currentName);
      writeData(result.data, path);
    }));
};

const downloadTagLinks = (links, dirname) => {
  if (!links) {
    return;
  }
  const data = links.split(' ').filter((item) => item).map((link) => {
    const currentLink = new URL(link);
    const name = `${currentLink.hostname}${currentLink.pathname}`;
    if (name.includes('http')) {
      return null;
    }
    return ({ name, link });
  });
  writeResources(data, dirname);
};

const downloadScripts = (links, dirname) => {
  if (!links) {
    return;
  }
  const data = links.split(' ').map((link) => {
    const currentLink = new URL(link);
    const name = `${currentLink.hostname}${currentLink.pathname}`;
    if (name.includes('http')) {
      return null;
    }
    return ({ name, link });
  });
  writeResources(data, dirname);
};

const downloadImages = (links, dirname) => {
  if (!links) {
    return null;
  }
  const data = links.split(' ').map((link) => {
    const currentLink = new URL(link);
    const hostname = currentLink.hostname.replaceAll('.', '-');
    const pathname = currentLink.pathname.replaceAll('/', '-');
    const name = `${hostname}${pathname}`;
    return ({ name, link });
  });

  return data.map(({ name, link }) => {
    new Listr([{
      title: name,
      task: () => downloadImage(link)
        .then((result) => {
          const path = Path.join(dirname, name);
          writeData(result, path);
        }),
    }], { concurrent: true, exitOnError: false }).run();
  });
};

const downloadPage = (html, dirname, filename, url) => {
  const host = new URL(url);
  const hostname = host.hostname.replaceAll('.', '-');
  const $ = cheerio.load(html);
  $('img').map(function () {
    if ($(this).attr('src').includes('http')) {
      return $(this);
    }
    const name = getImageName($(this).attr('src'));
    const path = Path.join(dirname, `${hostname}-${name}`);
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
      const tagLinklinks = getTagLinkLinks(result.data, url);
      createDir(dirname);
      downloadScripts(scriptLinks, dirname);
      downloadTagLinks(tagLinklinks, dirname);
      downloadImages(imageLinks, dirname);
      downloadPage(result.data, dirname, filename, url);
    })
    .catch((error) => console.log(error));
};
