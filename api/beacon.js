import crypto from 'node:crypto';

const SPREADSHEET_ID = '1d2izG1DEoKwpEQx1kUgB3bpvU_9IgzJ8Vs0IKHd-67g';
const APPEND_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Pings!A1:append?valueInputOption=RAW`;

const ALLOWED_SECTIONS = ['hero', 'concept', 'why-bohinj', 'program', 'stay', 'prices', 'notes', 'faq', 'booking-steps', 'booking', 'contact'];
const ALLOWED_LOCALES = ['en', 'hu', 'hr'];

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

function clampInt(value, min, max, fallback) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

function sanitizeSrc(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
}

function sanitizeReferrer(value) {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/[^a-z0-9.-]/g, '').slice(0, 60);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).end();
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).end();
  }

  const t = clampInt(body.t, 0, 86400, 0);
  const d = clampInt(body.d, 0, 100, 0);
  const s = ALLOWED_SECTIONS.includes(body.s) ? body.s : 'unknown';
  const l = ALLOWED_LOCALES.includes(body.l) ? body.l : 'en';
  const src = sanitizeSrc(body.src);
  const r = sanitizeReferrer(body.r);

  const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL;
  const GOOGLE_SA_PRIVATE_KEY = process.env.GOOGLE_SA_PRIVATE_KEY;

  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_PRIVATE_KEY) {
    return res.status(204).end();
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
        values: [[new Date().toISOString(), l, src, t, d, s, r]]
      })
    });

    if (!appendResponse.ok) {
      console.error('Sheets append error:', await appendResponse.text());
    }
  } catch (error) {
    console.error('Beacon error:', error);
  }

  return res.status(204).end();
}
