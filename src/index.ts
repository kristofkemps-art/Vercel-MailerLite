import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static("public"))
app.use(express.json())

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/mailer-lite', async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const API_KEY = process.env.MAILERLITE_API_KEY;
  if (!API_KEY) {
    res.status(500).json({ error: "SERVER_MISCONFIGURED", message: "Missing MAILERLITE_API_KEY" });
    return;
  }

  let email, groupId;
  try {
    ({ email, groupId } = req.body || {});
  } catch {
    res.status(400).json({ error: "BAD_REQUEST" });
    return;
  }

  if (!email || !groupId) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "email and groupId required" });
    return;
  }

  try {
    const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        email,
        groups: [String(groupId)]
      })
    });

    const data = await mlRes.json().catch(() => ({}));
    if (!mlRes.ok) {
      res.status(mlRes.status).json(data);
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
})

export default app
