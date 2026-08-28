const http = require('http');
// Just test the endpoint from node exactly like fetchJsonOrFallback does
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/districts',
  method: 'GET'
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { 
      try {
          const json = JSON.parse(data);
          console.log("Length:", json.length);
      } catch(e) {
          console.log("Parse error", e.message);
      }
  });
});
req.end();
