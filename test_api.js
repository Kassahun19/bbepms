const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/districts',
  method: 'GET',
  headers: {
    'x-user-role': 'BOARD_OF_DIRECTORS',
    'x-district-id': 'HWA'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { console.log("Response:", data); });
});
req.end();
