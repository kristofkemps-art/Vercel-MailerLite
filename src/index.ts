import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.join(path.dirname(__filename), '../')

const app = express()

app.use(express.json())


// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/subscribe', async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  
  const GROUP_ID = "168721174766814526"; // Server gets the API key, not the client
  const API_KEY = process.env.MAILERLITE_API_KEY;
  if (!API_KEY) {
    res.status(500).json({ error: "SERVER_MISCONFIGURED", message: "Missing MAILERLITE_API_KEY" });
    return;
  }
  
  let email;
  try {
    ({ email } = req.body || {});
  } catch {
    res.status(400).json({ error: "BAD_REQUEST" });
    return;
  }
  
  if (!email) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "email required" });
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
        groups: [GROUP_ID]
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

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("*", express.static("public"))

export default app
