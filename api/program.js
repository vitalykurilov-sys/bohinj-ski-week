import crypto from 'node:crypto';

// Self-contained endpoint (same pattern as beacon.js / submit.js): no shared
// helpers between serverless functions, so this file duplicates the JWT
// signing and Sheets-append logic on purpose.

const SPREADSHEET_ID = '1d2izG1DEoKwpEQx1kUgB3bpvU_9IgzJ8Vs0IKHd-67g';
const APPEND_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/ProgramRequests!A1:append?valueInputOption=RAW`;

const ALLOWED_LOCALES = ['en', 'hu', 'hr'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cached OAuth access token, module-level so warm invocations reuse it
let cachedToken = null;
let cachedTokenExpiry = 0;

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && now < cachedTokenExpiry - 60) {
    return cachedToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${unsigned}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  cachedToken = tokenData.access_token;
  cachedTokenExpiry = now + (tokenData.expires_in || 3600);
  return cachedToken;
}

function sanitizeSrc(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
}

function sanitizeEmail(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 120) return '';
  if (!EMAIL_RE.test(trimmed)) return '';
  return trimmed;
}

export default async function handler(req, res) {
  // CORS headers (same-origin in practice, kept for parity with submit.js)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const email = sanitizeEmail(body.email);
  if (!email) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const locale = ALLOWED_LOCALES.includes(body.locale) ? body.locale : 'en';
  const src = sanitizeSrc(body.src);
  const marketing = body.marketing === true;

  const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL;
  const GOOGLE_SA_PRIVATE_KEY = process.env.GOOGLE_SA_PRIVATE_KEY;

  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_PRIVATE_KEY) {
    console.error('Program request error: missing Google service account env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const privateKey = GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, '\n');
    const accessToken = await getAccessToken(GOOGLE_SA_EMAIL, privateKey);

    const appendResponse = await fetch(APPEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[new Date().toISOString(), email, locale, src, marketing ? 'yes' : '', '']]
      })
    });

    if (!appendResponse.ok) {
      console.error('Program request Sheets append error:', await appendResponse.text());
      return res.status(500).json({ error: 'Failed to save request' });
    }
  } catch (error) {
    console.error('Program request Sheets error:', error);
    return res.status(500).json({ error: 'Failed to save request' });
  }

  // Sheet append succeeded - reply 200 even if the Telegram notification below fails
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const telegramMessage = `PROGRAM REQUEST: ${email} | ${locale} | src=${src}`;

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage
          })
        }
      );

      if (!telegramResponse.ok) {
        console.error('Program request Telegram error:', await telegramResponse.text());
      }
    } else {
      console.error('Program request: missing Telegram credentials, skipping notification');
    }
  } catch (error) {
    console.error('Program request Telegram error:', error);
  }

  return res.status(200).json({ success: true });
}
