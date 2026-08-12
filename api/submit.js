// Booking form handler: Telegram notify + Google Sheet.
// The guest auto-reply is sent by Apps Script attached to the Leads spreadsheet
// (automation/booking-autoresponder.gs), same pattern as the program autoresponder:
// new row -> onChange trigger -> confirmation email from info@ via Gmail, BCC to Peter.
// The [locale: xx] tag in the message cell tells the script which language to use.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, dates, people, message, consent, marketing, consentTimestamp, src, locale } = req.body;

    // Validate required fields (phone is optional)
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // GDPR: consent for data processing is mandatory
    if (!consent) {
      return res.status(400).json({ error: 'Data processing consent is required' });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Telegram notification without personal data (GDPR: no PII via Telegram)
    const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1d2izG1DEoKwpEQx1kUgB3bpvU_9IgzJ8Vs0IKHd-67g/edit';
    const telegramMessage = `New booking - ${dates || 'dates not specified'}, ${people || '?'} people
Source: ${src || 'direct'} (${locale || '?'})

Check details: ${SHEETS_URL}

${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Ljubljana' })}`.trim();

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: telegramMessage })
      }
    );

    if (!telegramResponse.ok) {
      console.error('Telegram error:', await telegramResponse.text());
    }

    // Save to Google Sheets. src and locale go as tags inside message, so they land
    // in the Sheet even though the Apps Script webhook maps fixed columns only.
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
    if (GOOGLE_SHEETS_URL) {
      try {
        const tags = [src ? `[src: ${src}]` : '', locale ? `[locale: ${locale}]` : ''].filter(Boolean).join(' ');
        const sheetMessage = `${message || ''}\n${tags}`.trim();
        await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, dates, people, message: sheetMessage, consent, marketing, consentTimestamp, src })
        });
      } catch (e) {
        console.error('Google Sheets error:', e);
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
