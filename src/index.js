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

const getImageLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostName = new URL(url);
  return $('img').map(function () {
    const src = $(this).attr('src');
    const host = src.includes('http') ? '' : `${hostName.href}`;
    const imagePath = `${host}${src}`;
    return imagePath;
  }).get().join(' ');
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
  writeData($.html(), filename);
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

export default (url) => {
  getData(url)
    .then((result) => {
      const filename = getFileName(url);
      const dirname = getDirName(url);
      const links = getImageLinks(result.data, url);
      createDir(dirname);
      downloadImages(links, dirname);
      downloadPage(result.data, dirname, filename, url);
    })
    .catch((error) => console.log(error));
};
