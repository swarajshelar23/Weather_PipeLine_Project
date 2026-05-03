const express = require('express');

const app = express();
app.use(express.json());

// In-memory store (avoids native DB dependencies for local runs)
let nextId = 1;
const nowIso = () => new Date().toISOString();

// Seed data
const weather = [
  { city: 'Mumbai',    temperature: 31.2, humidity: 82, condition: 'Humid'  },
  { city: 'Delhi',     temperature: 22.5, humidity: 55, condition: 'Clear'  },
  { city: 'Bangalore', temperature: 24.0, humidity: 70, condition: 'Cloudy' },
  { city: 'Chennai',   temperature: 34.8, humidity: 78, condition: 'Sunny'  },
].map((row) => ({ id: nextId++, recorded_at: nowIso(), ...row }));

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'weather-dashboard' }));

app.get('/api/weather', (req, res) => {
  res.json({ count: weather.length, data: weather });
});

app.get('/api/weather/:city', (req, res) => {
  const row = weather.find(
    (item) => item.city.toLowerCase() === req.params.city.toLowerCase()
  );
  if (!row) return res.status(404).json({ error: 'City not found' });
  res.json(row);
});

app.post('/api/weather', (req, res) => {
  const { city, temperature, humidity, condition } = req.body;
  if (!city || temperature === undefined) {
    return res.status(400).json({ error: 'city and temperature are required' });
  }
  const row = {
    id: nextId++,
    city,
    temperature,
    humidity: humidity ?? null,
    condition: condition ?? null,
    recorded_at: nowIso(),
  };
  weather.push(row);
  res.status(201).json({ id: row.id, city: row.city, temperature: row.temperature });
});

app.get('/api/stats', (req, res) => {
  const temperatures = weather
    .map((item) => Number(item.temperature))
    .filter((value) => Number.isFinite(value));

  const total = weather.length;
  const avg = temperatures.length
    ? temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length
    : 0;
  const stats = {
    total,
    avg_temp: Number(avg.toFixed(2)),
    max_temp: temperatures.length ? Math.max(...temperatures) : null,
    min_temp: temperatures.length ? Math.min(...temperatures) : null,
  };
  res.json(stats);
});

module.exports = app;

if (require.main === module) {
  app.listen(3032, () => console.log('Weather API running on http://localhost:3032'));
}