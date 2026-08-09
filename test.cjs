const fs = require('fs');
const rawColors = JSON.parse(fs.readFileSync('d:/AI/Farley/src/components/paintexplorer/colors.json', 'utf8'));
const curated = {
  white: ['#EAD4C4', '#FAECD1', '#DFD5BB', '#E4DCBF', '#DBE0C4', '#DDE2E6'],
};
const colors = rawColors.filter(c => c.family.toLowerCase() === 'white');
const matches = curated.white.map(hex => colors.find(c => c.hex.toLowerCase() === hex.toLowerCase())?.name || 'Not Found');
console.log(matches);
