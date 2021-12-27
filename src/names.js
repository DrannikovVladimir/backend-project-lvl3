export const getImageName = (img) => {
  const imageName = img.replaceAll('/', '-');
  return imageName;
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
