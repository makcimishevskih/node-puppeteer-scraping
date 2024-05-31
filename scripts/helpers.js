export const sleep = (delay) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

export function getNumberFromRange(min, max) {
  return Math.random() * (max - min) + min;
}

export async function read(fileName) {
  try {
    const data = await fs.readFile(`./${fileName}.txt`, { encoding: 'utf8' });
    const hrefs = data.split('\r\n').filter(Boolean);
    return hrefs;
  } catch (err) {
    console.log('[READ FUNCTION]', err);
  }
}