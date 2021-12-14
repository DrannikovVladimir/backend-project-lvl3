import fs from 'fs/promises';
import axios from 'axios';

const Url = 'https://ru.hexlet.io/courses';

const getData = (url) => axios
  .get(url);

const writeData = (data, filename) => fs
  .writeFile(filename, data)
  .then(() => console.log('File is Writing'))
  .catch((error) => console.log('Error writing: ', error));

const getFileName = (str) => {
  const url = new URL(str);
  const result = `${url.hostname}${url.pathname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  return `${result}.html`;
};

export default () => {
  getData(Url)
    .then((result) => {
      const filename = getFileName(Url);
      writeData(result.data, filename);
    })
    .catch((error) => console.log(error));
};
