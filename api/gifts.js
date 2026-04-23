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
  const token = req.headers['authorization']?.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

async function readData() {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`, {
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (res.status === 404) return { data: [], sha: null };
  const json = await res.json();
  const content = JSON.parse(Buffer.from(json.content, 'base64').toString('utf-8'));
  return { data: content, sha: json.sha };
}

async function writeData(data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = { message: 'Update gifts data', content, committer: { name: 'Liste Naissance Bot', email: 'bot@naissance.fr' } };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
    body: JSON.stringify(body)
  });
  return res.ok;
}

function validateGift(body) {
  const { name, price, category, image, url } = body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) return { valid: false, error: 'Nom invalide (min 2 caractères)' };
  if (price !== undefined && price !== null && (isNaN(Number(price)) || Number(price) < 0)) return { valid: false, error: 'Prix invalide' };
  return { valid: true, data: { name: name.trim().slice(0, 200), price: (price !== undefined && price !== null) ? Number(price) : null, category: (category || 'autre').trim().slice(0, 50), image: (image || '').trim().slice(0, 500), url: (url || '').trim().slice(0, 500) } };
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
      const newGift = { id: Date.now().toString(), ...v.data, createdAt: new Date().toISOString() };
      data.push(newGift);
      await writeData(data, sha);
      return res.status(201).json(newGift);
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
    console.error('API gifts error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}