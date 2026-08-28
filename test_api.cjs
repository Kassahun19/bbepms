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
  res.on('end', () => { 
      const json = JSON.parse(data);
      console.log("Is array?", Array.isArray(json));
      if (Array.isArray(json)) {
          console.log("Length:", json.length);
          console.log("First element:", json[0]);
      } else {
          console.log("Keys:", Object.keys(json));
          if (json.data) console.log("Data length:", json.data.length);
      }
  });
});
req.end();
