const axios = require('axios');

module.exports = async function getFileSize(url) {
  const response = await axios.get(url);
  return response.headers['content-length'];
};
