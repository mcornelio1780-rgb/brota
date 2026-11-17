// Le dice a la landing qué servicios están activos. No expone secretos.
import { checkoutEnabled, CONTACT_EMAIL } from '../lib/util.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    checkout: checkoutEnabled(),
    forms: Boolean(process.env.DATABASE_URL || process.env.RESEND_API_KEY),
    appUrl: process.env.APP_URL || '',
    contactEmail: CONTACT_EMAIL,
  });
}
