const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'microcrechedbebe';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Liste-de-naissance';
const DATA_PATH = 'data/gifts.json';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
function auth(req) {
  return req.headers['authorization']?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

async function readData() {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (res.status === 404) return { data: [], sha: null };
  const json = await res.json();
  // Nettoyer le base64 (GitHub ajoute des \n)
  const clean = json.content.replace(/\n/g, '');
  const decoded = Buffer.from(clean, 'base64').toString('utf-8');
  return { data: JSON.parse(decoded), sha: json.sha };
}

async function writeData(data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
  const body = { message: 'Update gifts', content, committer: { name: 'Liste Bot', email: 'bot@liste.fr' } };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`,
    { method: 'PUT', headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'GitHub write error'); }
  return true;
}

function validateGift(body) {
  const { name, price, category, image, url } = body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) return { valid: false, error: 'Nom invalide' };
  if (price != null && (isNaN(Number(price)) || Number(price) < 0)) return { valid: false, error: 'Prix invalide' };
  return { valid: true, data: { name: name.trim().slice(0,200), price: price != null ? Number(price) : null, category: (category||'autre').trim().slice(0,50), image: (image||'').trim().slice(0,500), url: (url||'').trim().slice(0,500) } };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'GET') {
      const { data } = await readData();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!auth(req)) return res.status(401).json({ error: 'Non autorisé' });
      const v = validateGift(req.body);
      if (!v.valid) return res.status(400).json({ error: v.error });
      const { data, sha } = await readData();
      const gift = { id: Date.now().toString(), ...v.data, createdAt: new Date().toISOString() };
      data.push(gift);
      await writeData(data, sha);
      return res.status(201).json(gift);
    }
    if (req.method === 'PUT') {
      if (!auth(req)) return res.status(401).json({ error: 'Non autorisé' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID manquant' });
      const v = validateGift(req.body);
      if (!v.valid) return res.status(400).json({ error: v.error });
      const { data, sha } = await readData();
      const idx = data.findIndex(g => g.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Cadeau non trouvé' });
      data[idx] = { ...data[idx], ...v.data, updatedAt: new Date().toISOString() };
      await writeData(data, sha);
      return res.status(200).json(data[idx]);
    }
    if (req.method === 'DELETE') {
      if (!auth(req)) return res.status(401).json({ error: 'Non autorisé' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID manquant' });
      const { data, sha } = await readData();
      const filtered = data.filter(g => g.id !== id);
      if (filtered.length === data.length) return res.status(404).json({ error: 'Cadeau non trouvé' });
      await writeData(filtered, sha);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('gifts error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}