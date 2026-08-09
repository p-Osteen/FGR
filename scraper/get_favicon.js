const axios = require('axios');
const fs = require('fs');

async function download() {
  const url = 'https://fitgirl-repacks.site/wp-content/uploads/2016/08/cropped-icon-192x192.jpg';
  try {
    const res = await axios({ url, responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
    res.data.pipe(fs.createWriteStream('../ui/public/favicon.jpg'));
    console.log('Downloaded');
  } catch (err) {
    console.error('Failed', err.message);
  }
}
download();
