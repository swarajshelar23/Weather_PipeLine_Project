const http = require('http');
const app = require('../index');

let passed = 0, failed = 0;
let server;

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3001, path, method,
      headers: { 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, fn) {
  return fn()
    .then(() => { console.log(`  ✅ PASS: ${name}`); passed++; })
    .catch(e => { console.log(`  ❌ FAIL: ${name} — ${e.message}`); failed++; });
}

async function runTests() {
  server = http.createServer(app);
  await new Promise(r => server.listen(3001, r));
  console.log('\n--- Running Weather API Tests ---');

  await test('GET /health returns ok', async () => {
    const res = await request('GET', '/health');
    if (res.body.status !== 'ok') throw new Error('Health check failed');
  });

  await test('GET /api/weather returns seeded data', async () => {
    const res = await request('GET', '/api/weather');
    if (res.body.count < 4) throw new Error('Expected at least 4 records');
  });

  await test('GET /api/weather/:city returns city data', async () => {
    const res = await request('GET', '/api/weather/Mumbai');
    if (res.body.city !== 'Mumbai') throw new Error('City mismatch');
  });

  await test('GET /api/weather/:city 404 for unknown city', async () => {
    const res = await request('GET', '/api/weather/Atlantis');
    if (res.status !== 404) throw new Error('Expected 404');
  });

  await test('POST /api/weather adds new record', async () => {
    const res = await request('POST', '/api/weather',
      { city: 'Pune', temperature: 27.5, humidity: 65, condition: 'Pleasant' });
    if (res.status !== 201) throw new Error('Expected 201');
  });

  await test('GET /api/stats returns aggregates', async () => {
    const res = await request('GET', '/api/stats');
    if (!res.body.avg_temp) throw new Error('Missing avg_temp');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  server.close();
  if (failed > 0) process.exit(1);
}

runTests();