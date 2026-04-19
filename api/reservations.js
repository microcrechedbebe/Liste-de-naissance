import { createClient } from '@vercel/kv';

// Vercel KV client — requires KV_REST_API_URL + KV_REST_API_TOKEN env vars
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const RESERVATIONS_KEY = 'naissance:reservations';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Return all reservations
      const reservations = await kv.get(RESERVATIONS_KEY) || {};
      return res.status(200).json({ ok: true, reservations });
    }

    if (req.method === 'POST') {
      const { itemId, guestName } = req.body || {};

      if (!itemId || !guestName) {
        return res.status(400).json({ error: 'itemId et guestName requis' });
      }

      // Sanitize
      const name = String(guestName).trim().slice(0, 50);
      const id = String(itemId).trim().slice(0, 50);

      if (!name) {
        return res.status(400).json({ error: 'Le nom ne peut pas être vide' });
      }

      // Atomic check-and-set
      const reservations = await kv.get(RESERVATIONS_KEY) || {};

      if (reservations[id]) {
        return res.status(409).json({
          error: 'Déjà réservé',
          reservedBy: reservations[id].name,
          reservedAt: reservations[id].at,
        });
      }

      reservations[id] = {
        name,
        at: new Date().toISOString(),
      };

      await kv.set(RESERVATIONS_KEY, reservations);

      return res.status(200).json({ ok: true, reservations });
    }

    if (req.method === 'DELETE') {
      const { itemId, guestName } = req.body || {};

      if (!itemId || !guestName) {
        return res.status(400).json({ error: 'itemId et guestName requis' });
      }

      const reservations = await kv.get(RESERVATIONS_KEY) || {};
      const reservation = reservations[itemId];

      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }

      // Only the person who reserved can unreserve (or same guest name)
      if (reservation.name.toLowerCase() !== String(guestName).trim().toLowerCase()) {
        return res.status(403).json({ error: 'Seul le réservataire peut annuler' });
      }

      delete reservations[itemId];
      await kv.set(RESERVATIONS_KEY, reservations);

      return res.status(200).json({ ok: true, reservations });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
