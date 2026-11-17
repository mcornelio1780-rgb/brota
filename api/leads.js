// Vista privada de los leads guardados: /api/leads?key=TU_ADMIN_KEY
import { db, ensureLeads } from '../lib/util.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(401).send('No autorizado');
  const sql = db();
  if (!sql) return res.status(200).send('Base de datos no configurada (falta DATABASE_URL).');
  await ensureLeads(sql);
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 500`;
  if (req.query.format === 'csv') {
    const cols = ['created_at', 'name', 'email', 'company', 'country', 'plan', 'message', 'lang'];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="brota-leads.csv"');
    return res.send([cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n'));
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Brota · Leads</title>
<style>body{font:14px system-ui;margin:24px;color:#1F2A33}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}th{background:#E4EAE7}</style>
<h1>Leads de Brota (${rows.length})</h1><p><a href="?key=${esc(req.query.key)}&format=csv">Descargar CSV</a></p>
<table><tr><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Empresa</th><th>País</th><th>Interés</th><th>Mensaje</th></tr>
${rows.map((r) => `<tr><td>${esc(new Date(r.created_at).toLocaleString('es-PE'))}</td><td>${esc(r.name)}</td><td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td>${esc(r.company)}</td><td>${esc(r.country)}</td><td>${esc(r.plan)}</td><td>${esc(r.message)}</td></tr>`).join('')}</table>`);
}
