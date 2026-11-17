// Utilidades compartidas. Cada servicio se activa solo si su variable de entorno existe.
import { neon } from '@neondatabase/serverless';

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'manyosa@limly.io';
export const PLANS = ['reporte', 'monitoreo', 'portafolio'];

export function productId(plan) {
  return process.env['POLAR_PRODUCT_' + plan.toUpperCase()] || '';
}
export function checkoutEnabled() {
  const on = {};
  for (const p of PLANS) on[p] = Boolean(process.env.POLAR_ACCESS_TOKEN && productId(p));
  return on;
}
export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}
export function db() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}
export async function ensureLeads(sql) {
  await sql`CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, country TEXT,
    plan TEXT, message TEXT, lang TEXT, source TEXT, consent_at TIMESTAMPTZ
  )`;
}
export function clean(v, max = 500) {
  return String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}
