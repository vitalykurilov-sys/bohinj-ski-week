// Booking form handler: Telegram notify + Google Sheet + auto-reply to guest via Resend.
// Guest auto-reply is BCC'd to Peter (his separate notification email was removed on purpose:
// Vitalij pings him by SMS, Peter just needs a copy of what the guest received).

const SHEETS_VIEW_URL = 'https://docs.google.com/spreadsheets/d/1d2izG1DEoKwpEQx1kUgB3bpvU_9IgzJ8Vs0IKHd-67g/edit';
const HEADER_IMG = 'https://bohinjskiweek.com/images/email-header.png';
const REPLY_TO = 'info@bohinjskiweek.com';

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

// "Feb 28 - Mar 5, 2027" -> {d1,m1,d2,m2,y} or null (form stores dates in EN in all locales)
function parseWeek(dates) {
  const m = /([A-Za-z]{3})\s+(\d{1,2})\s*-\s*([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})/.exec(dates || '');
  if (!m || !MONTHS[m[1]] || !MONTHS[m[3]]) return null;
  return { m1: MONTHS[m[1]], d1: +m[2], m2: MONTHS[m[3]], d2: +m[4], y: +m[5] };
}

function formatWeek(dates, locale) {
  const w = parseWeek(dates);
  if (!w) return dates || '';
  if (locale === 'hr') return `${w.d1}. ${w.m1}. ${w.y}. - ${w.d2}. ${w.m2}. ${w.y}.`;
  if (locale === 'hu') return `${w.y}. ${String(w.m1).padStart(2, '0')}. ${String(w.d1).padStart(2, '0')}. - ${w.y}. ${String(w.m2).padStart(2, '0')}. ${String(w.d2).padStart(2, '0')}.`;
  return dates;
}

// Season tag for booking numbers: Dec 2026 - Mar 2027 season = "27"
function seasonYY(now) {
  const y = now.getFullYear() + (now.getMonth() >= 4 ? 1 : 0);
  return String(y % 100).padStart(2, '0');
}

function makeBookingNumber(now) {
  return `BSW-${seasonYY(now)}${String(now.getTime()).slice(-5)}`;
}

const T = {
  hr: {
    subject: n => `Rezervacija ${n} zaprimljena - Bohinj Ski Week`,
    greeting: name => `Poštovani ${name},`,
    lead: 'Vaša rezervacija za Bohinj Ski Week je uspješno zaprimljena!',
    detailsTitle: 'Detalji rezervacije',
    number: 'Broj rezervacije',
    name: 'Ime',
    week: 'Termin',
    arrival: 'Dolazak',
    arrivalValue: 'nedjelja, od 15:00',
    guests: 'Gosti',
    guestsValue: p => `${p} ${+p === 1 ? 'osoba' : (+p >= 2 && +p <= 4 ? 'osobe' : 'osoba')}`,
    note: 'Napomena',
    next: 'Kompletnu ponudu s detaljima smještaja, cijenom za Vašu grupu i sljedećim koracima šaljemo Vam u roku od 24 sata.',
    questions: 'Ako imate pitanja, slobodno odgovorite na ovaj e-mail.',
    signoff: 'Lijep pozdrav,'
  },
  hu: {
    subject: n => `Foglalás ${n} rögzítve - Bohinj Ski Week`,
    greeting: name => `Kedves ${name}!`,
    lead: 'Foglalását a Bohinj Ski Weekre sikeresen rögzítettük!',
    detailsTitle: 'A foglalás részletei',
    number: 'Foglalási szám',
    name: 'Név',
    week: 'Időpont',
    arrival: 'Érkezés',
    arrivalValue: 'vasárnap, 15:00-tól',
    guests: 'Vendégek',
    guestsValue: p => `${p} fő`,
    note: 'Megjegyzés',
    next: 'A teljes ajánlatot a szállás részleteivel, az Önök árával és a következő lépésekkel 24 órán belül küldjük.',
    questions: 'Ha kérdése van, egyszerűen válaszoljon erre az e-mailre.',
    signoff: 'Üdvözlettel,'
  },
  en: {
    subject: n => `Booking ${n} received - Bohinj Ski Week`,
    greeting: name => `Dear ${name},`,
    lead: 'Your Bohinj Ski Week booking has been received!',
    detailsTitle: 'Booking details',
    number: 'Booking number',
    name: 'Name',
    week: 'Week',
    arrival: 'Arrival',
    arrivalValue: 'Sunday, from 3 pm',
    guests: 'Guests',
    guestsValue: p => `${p} ${+p === 1 ? 'person' : 'people'}`,
    note: 'Note',
    next: 'We will send you the complete offer with accommodation details, the price for your group and the next steps within 24 hours.',
    questions: 'If you have any questions, simply reply to this email.',
    signoff: 'Best regards,'
  }
};

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderGuestEmail(t, { bookingNumber, name, dates, people, message, locale }) {
  const noteRow = message ? `${t.note}: ${escapeHtml(message)}<br>` : '';
  return `
<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#222;">
  <img src="${HEADER_IMG}" alt="Bohinj Ski Week" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
  <div style="padding:28px 8px 8px 8px;">
    <p style="font-size:16px;margin:0 0 16px 0;">${t.greeting(escapeHtml(name))}</p>
    <p style="font-size:16px;margin:0 0 20px 0;"><strong>${t.lead}</strong></p>
    <div style="background:#f8f9fa;border-left:4px solid #15314e;padding:16px 20px;margin:0 0 20px 0;">
      <p style="font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#555;margin:0 0 10px 0;"><strong>${t.detailsTitle}</strong></p>
      <p style="font-size:15px;line-height:1.7;margin:0;">
        ${t.number}: <strong>${bookingNumber}</strong><br>
        ${t.name}: ${escapeHtml(name)}<br>
        ${t.week}: ${escapeHtml(formatWeek(dates, locale))}<br>
        ${t.arrival}: ${t.arrivalValue}<br>
        ${t.guests}: ${t.guestsValue(escapeHtml(people || '?'))}<br>
        ${noteRow}
      </p>
    </div>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">${t.next}</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px 0;">${t.questions}</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 4px 0;">${t.signoff}</p>
    <p style="font-size:15px;line-height:1.6;margin:0;"><strong>Peter</strong><br>Bohinj Ski Week</p>
    <p style="font-size:12px;color:#888;margin:28px 0 0 0;border-top:1px solid #e5e5e5;padding-top:12px;">
      <a href="https://bohinjskiweek.com/${locale === 'en' ? '' : locale + '/'}" style="color:#555;">bohinjskiweek.com</a> &middot; Bohinjska Bistrica, Slovenija
    </p>
  </div>
</div>`;
}

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

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // GDPR: consent for data processing is mandatory
    if (!consent) {
      return res.status(400).json({ error: 'Data processing consent is required' });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const PETER_EMAIL = process.env.PETER_EMAIL || 'teniska.sola@gmail.com';

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const now = new Date();
    const bookingNumber = makeBookingNumber(now);
    const lang = T[locale] ? locale : 'hr';
    const t = T[lang];

    // Telegram notification without personal data (GDPR: no PII via Telegram)
    const telegramMessage = `New booking ${bookingNumber} - ${dates || 'dates not specified'}, ${people || '?'} people
Source: ${src || 'direct'} (${lang})

Check details: ${SHEETS_VIEW_URL}

${now.toLocaleString('en-GB', { timeZone: 'Europe/Ljubljana' })}`.trim();

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

    // Save to Google Sheets
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
    if (GOOGLE_SHEETS_URL) {
      try {
        // src and booking number go inside message too, so they land in the Sheet
        // even if the Apps Script maps fixed columns only
        const tags = [`[${bookingNumber}]`, src ? `[src: ${src}]` : ''].filter(Boolean).join(' ');
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

    // Auto-reply to the guest, BCC to Peter
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Bohinj Ski Week <info@bohinjskiweek.com>',
            to: email,
            bcc: [PETER_EMAIL],
            reply_to: REPLY_TO,
            subject: t.subject(bookingNumber),
            html: renderGuestEmail(t, { bookingNumber, name, dates, people, message, locale: lang })
          })
        });
        if (!resendResponse.ok) {
          console.error('Resend error:', await resendResponse.text());
        }
      } catch (e) {
        console.error('Resend error:', e);
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
