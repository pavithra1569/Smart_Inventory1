const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/debug/users',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('status:', res.statusCode);
    console.log('body:', body);
  });
});

req.on('error', (err) => {
  console.error('request error', err);
});

req.end();
