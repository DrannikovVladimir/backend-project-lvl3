import axios from 'axios';

export const getData = (url) => axios
  .get(url);

export const downloadImage = (url) => axios
  .get(url, {
    responseType: 'arraybuffer',
  })
  .then((response) => Buffer.from(response.data, 'binary'))
  .catch((error) => console.log(error.message));
