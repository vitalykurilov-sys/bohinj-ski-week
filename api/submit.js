export default async function handler(req, res) {
  // CORS headers
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
    const { name, email, phone, dates, people, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const PETER_EMAIL = process.env.PETER_EMAIL || 'teniska.sola@gmail.com';

    // Format Telegram message
    const telegramMessage = `
🎿 *New Booking Request!*

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
📅 *Dates:* ${dates || 'Not specified'}
👥 *People:* ${people || 'Not specified'}

💬 *Message:*
${message || 'No message'}

---
📨 Forward to Peter: ${PETER_EMAIL}
🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Ljubljana' })}
    `.trim();

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown'
        })
      }
    );

    if (!telegramResponse.ok) {
      console.error('Telegram error:', await telegramResponse.text());
    }

    // Send email to Peter via Resend (if configured)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const emailHtml = `
        <h2>New Booking Request - Bohinj Ski Week</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Dates:</strong> ${dates || 'Not specified'}</p>
        <p><strong>Number of People:</strong> ${people || 'Not specified'}</p>
        <p><strong>Message:</strong><br>${message || 'No message'}</p>
        <hr>
        <p><small>Sent from bohinj-ski-week.vercel.app at ${new Date().toLocaleString()}</small></p>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Bohinj Ski <bookings@resend.dev>',
          to: PETER_EMAIL,
          cc: 'spo.youtravel@gmail.com',
          subject: `Booking Request: ${name} - ${people || '?'} people`,
          html: emailHtml
        })
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
