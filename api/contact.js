// Guarda el lead en Neon (si DATABASE_URL existe) y avisa por correo con Resend (si RESEND_API_KEY existe).
// Si ninguno está configurado responde { ok:false, fallback:'mailto' } y la landing abre el correo del visitante.
import { db, ensureLeads, clean, CONTACT_EMAIL } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website) return res.status(200).json({ ok: true }); // trampa anti-spam
  const d = {
    name: clean(b.name, 120), email: clean(b.email, 160), company: clean(b.company, 160),
    country: clean(b.country, 60), plan: clean(b.plan, 40), message: clean(b.message, 3000),
    lang: clean(b.lang, 5), source: clean(b.source, 60), consent_at: clean(b.consent_at, 40) || null,
  };
  if (!d.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return res.status(400).json({ ok: false, error: 'invalid' });

  let saved = false, mailed = false;
  const sql = db();
  if (sql) {
    try {
      await ensureLeads(sql);
      await sql`INSERT INTO leads (name,email,company,country,plan,message,lang,source,consent_at)
        VALUES (${d.name},${d.email},${d.company},${d.country},${d.plan},${d.message},${d.lang},${d.source},${d.consent_at})`;
      saved = true;
    } catch (e) { console.error('neon', e); }
  }
  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Brota <onboarding@resend.dev>',
          to: [CONTACT_EMAIL], reply_to: d.email,
          subject: `Brota · nuevo contacto: ${d.plan || 'general'} · ${d.company || d.name}`,
          text: Object.entries(d).map(([k, v]) => `${k}: ${v ?? ''}`).join('\n'),
        }),
      });
      mailed = r.ok;
      if (!r.ok) console.error('resend', r.status, await r.text());
    } catch (e) { console.error('resend', e); }
  }
  if (saved || mailed) return res.status(200).json({ ok: true, saved, mailed });
  return res.status(200).json({ ok: false, fallback: 'mailto' });
}
