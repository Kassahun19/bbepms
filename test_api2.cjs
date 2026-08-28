const http = require('http');

function makeRequest(userId, userRole, districtId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/districts',
    method: 'GET',
    headers: {
      'x-user-role': userRole,
      'x-user-id': userId,
      'x-district-id': districtId
    }
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => { 
        console.log(`Response for ${userId}, ${userRole}, ${districtId}:`);
        try {
            const json = JSON.parse(data);
            if (Array.isArray(json)) {
                console.log("Length:", json.length);
                if (json.length === 1) console.log(json[0].name);
            } else {
                console.log("Not an array", Object.keys(json));
            }
        } catch(e) {
            console.log("Parse error", e.message);
        }
    });
  });
  req.end();
}

makeRequest('USR-EXEC-PREDEF-2', 'BOARD_OF_DIRECTORS', 'DIST-HO');
makeRequest('BOARD_USER_ID', 'BOARD_OF_DIRECTORS', 'HWA');
