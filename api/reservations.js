const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'microcrechedbebe';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Liste-de-naissance';
const RES_PATH = 'data/reservations.json';
const GIFTS_PATH = 'data/gifts.json';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
function auth(req) {
  return req.headers['authorization']?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

async function readFile(path) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (res.status === 404) return { data: [], sha: null };
  const json = await res.json();
  const clean = json.content.replace(/\n/g, '');
  return { data: JSON.parse(Buffer.from(clean, 'base64').toString('utf-8')), sha: json.sha };
}

async function writeFile(path, data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
  const body = { message: 'Update reservations', content, committer: { name: 'Liste Bot', email: 'bot@liste.fr' } };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { method: 'PUT', headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'GitHub write error'); }
  return true;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'GET') {
      const { data } = await readFile(RES_PATH);
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { giftId, name, message } = req.body || {};
      if (!giftId) return res.status(400).json({ error: 'giftId manquant' });
      if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Prénom invalide' });
      const { data: gifts } = await readFile(GIFTS_PATH);
      if (!gifts.find(g => g.id === giftId)) return res.status(404).json({ error: 'Cadeau non trouvé' });
      const { data: reservations, sha } = await readFile(RES_PATH);
      if (reservations.find(r => r.giftId === giftId)) return res.status(409).json({ error: 'Déjà réservé' });
      const reservation = { id: Date.now().toString(), giftId, name: name.trim().slice(0,50), message: (message||'').trim().slice(0,200), createdAt: new Date().toISOString() };
      reservations.push(reservation);
      await writeFile(RES_PATH, reservations, sha);
      return res.status(201).json(reservation);
    }
    if (req.method === 'DELETE') {
      if (!auth(req)) return res.status(401).json({ error: 'Non autorisé' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID manquant' });
      const { data, sha } = await readFile(RES_PATH);
      await writeFile(RES_PATH, data.filter(r => r.id !== id), sha);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('reservations error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}