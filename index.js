import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';

const Url = 'https://www.coolwaters.kz';

const getImageName = (img, str) => {
  const url = new URL(str);
  const hostname = `${url.hostname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  const imageName = img.replaceAll('/', '-');
  return `${hostname}-${imageName}`;
};

const getFileName = (str) => {
  const url = new URL(str);
  const result = `${url.hostname}${url.pathname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  return `${result}.html`;
};

const getDirName = (str) => {
  const url = new URL(str);
  const result = `${url.hostname}${url.pathname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  return `${result}_files`;
};

const getData = (url) => axios
  .get(url);

const changeImageSrc = (html, url) => {
  const $ = cheerio.load(html);
  $('img').map(function(i, el) {
    const src = $(this).attr('src');
    const imageName = getImageName(src, url);
    return src;
  }).get().join(' ');
};

const writeData = (data, filename) => fs
  .writeFile(filename, data)
  .then(() => console.log('File was Wrote'))
  .catch((error) => console.log('File was not wrote: ', error));

const createDir = (name) => fs
  .mkdir(name, { recursive: true })
  .then(() => console.log('Dir was created'))
  .catch((error) => console.log('Dir was not created: ', error));

const getImageLinks = (html, url) => {
  const $ = cheerio.load(html);
  const hostName = new URL(url);
  const host = `${hostName.hostname}/`;
  return $('img').map(function(i, el) {
    const src = $(this).attr('src');
    const imagePath = `${host}${src}`;
    return imagePath;
  }).get().join(' ');
};

const writeImages = (coll, dirname) => {
  
}

export default () => {
  getData(Url)
    .then((result) => {
      changeImageSrc(result.data, Url);
      const filename = getFileName(Url);
      const dirname = getDirName(Url);
      const imageLinks = getImageLinks(result.data, Url);
      console.log(imageLinks);
      writeData(result.data, filename);
      createDir(dirname);
      writeImages(imageLinks, dirname);
    })
    .catch((error) => console.log(error));
};
