
const fs = require('fs');

const tr = JSON.parse(fs.readFileSync('/home/yusuf/Projects/test/polosim/polosim/messages/tr.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('/home/yusuf/Projects/test/polosim/polosim/messages/en.json', 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const trKeys = getAllKeys(tr);
const enKeys = getAllKeys(en);

const missingInEn = trKeys.filter(k => !enKeys.includes(k));
const missingInTr = enKeys.filter(k => !trKeys.includes(k));

console.log('Missing in en.json:', missingInEn);
console.log('Missing in tr.json:', missingInTr);
