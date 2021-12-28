import path from 'path';

export const getImageName = (name) => {
  if (name === undefined) {
    return '';
  }
  const extname = path.extname(name);
  const imageName = name
    .slice(0, name.length - (extname.length))
    .replaceAll('/', '-')
    .replaceAll('_', '-')
    .replaceAll('.', '-');

  return `${imageName}${extname}`;
};

export const getFileName = (str) => {
  const url = new URL(str);
  const result = `${url.hostname}${url.pathname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  return `${result.slice(0, result.length - 1)}.html`;
};

export const getDirName = (str) => {
  const url = new URL(str);
  const result = `${url.hostname}${url.pathname}`
    .replaceAll('/', '-')
    .replaceAll('.', '-');
  return `${result.slice(0, result.length - 1)}_files`;
};
