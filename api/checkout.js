// Crea un checkout de Polar a partir del ID de producto. No necesitas "checkout links".
// Si Polar aún no está configurado, lleva al formulario de contacto con el plan elegido.
import { productId, siteUrl, PLANS } from '../lib/util.js';

export default async function handler(req, res) {
  const plan = String(req.query.plan || '');
  const lang = String(req.query.lang || 'es').slice(0, 2);
  const base = siteUrl(req);
  const id = PLANS.includes(plan) ? productId(plan) : '';
  if (!process.env.POLAR_ACCESS_TOKEN || !id) {
    res.writeHead(302, { Location: `${base}/?plan=${encodeURIComponent(plan)}#contacto` }); return res.end();
  }
  const api = process.env.POLAR_SERVER === 'production' ? 'https://api.polar.sh' : 'https://sandbox-api.polar.sh';
  try {
    const r = await fetch(`${api}/v1/checkouts/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: [id],
        success_url: `${base}/gracias?checkout_id={CHECKOUT_ID}&lang=${lang}`,
        metadata: { startup: 'brota', plan },
      }),
    });
    const j = await r.json();
    if (!r.ok || !j.url) throw new Error(`polar ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
    res.writeHead(303, { Location: j.url }); return res.end();
  } catch (e) {
    console.error(e);
    res.writeHead(302, { Location: `${base}/?plan=${encodeURIComponent(plan)}#contacto` }); return res.end();
  }
}
