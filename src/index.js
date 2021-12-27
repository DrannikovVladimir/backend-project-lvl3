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

const Url = 'https://www.coolwaters.kz';

const writeData = (data, filename) => fs
  .writeFile(filename, data)
  .catch((error) => console.log('File was not wrote: ', error));

const createDir = (name) => fs
  .mkdir(name, { recursive: true })
  .catch((error) => console.log('Dir was not created: ', error));

const getImageLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostName = new URL(url);
  const host = `${hostName.origin}/`;
  return $('img').map(function () {
    const src = $(this).attr('src');
    const imagePath = `${host}${src}`;
    return imagePath;
  }).get().join(' ');
};

const downloadPage = (html, dirname, filename) => {
  const $ = cheerio.load(html);
  $('img').map(function () {
    const name = getImageName($(this).attr('src'));
    const path = Path.join(dirname, name);
    return $(this).attr('src', path);
  });
  writeData($.html(), filename);
};

const downloadImages = (links, dirname) => {
  const data = links.split(' ').map((link) => {
    const name = getImageName(link).slice(26);
    return ({ name, link });
  });
  data.map(({ name, link }) => downloadImage(link)
    .then((result) => {
      const path = Path.join(dirname, name);
      writeData(result, path);
    }));
};

export default () => {
  getData(Url)
    .then((result) => {
      const filename = getFileName(Url);
      const dirname = getDirName(Url);
      const links = getImageLinks(result.data, Url);
      createDir(dirname);
      downloadImages(links, dirname);
      downloadPage(result.data, dirname, filename);
    })
    .catch((error) => console.log(error));
};
