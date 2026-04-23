const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function auth(req) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

function detectCategory(url, title) {
  const t = (url + ' ' + (title || '')).toLowerCase();
  if (t.match(/matelas|lit\b|berceau|chambre|commode|armoire|drap|gigoteuse/)) return 'chambre';
  if (t.match(/poussette|si.ge.auto|porteur|trotteur|nacelle/)) return 'mobilite';
  if (t.match(/bain|baignoire|serviette|cape|toilette/)) return 'bain';
  if (t.match(/biberon|lait|repas|chaise.haute|st.rilisateur|tire.lait|vaisselle/)) return 'repas';
  if (t.match(/jouet|.veil|mobile|livre|peluche|hochet|tapis/)) return 'eveil';
  if (t.match(/thermom.tre|mouche|sant.|soin|cr.me|coton|pharmacie/)) return 'sante';
  if (t.match(/v.tement|body|pyjama|habit|chaussette|bonnet|grenouill/)) return 'vetements';
  return 'autre';
}

function cleanTitle(title, url) {
  if (!title) return '';
  // Supprimer les suffixes de marque/site
  return title
    .replace(/\s*[|\-–—]\s*(Amazon|Vertbaudet|IKEA|Kinderkraft|Cdiscount|Fnac|Aubert|Bébé9|Maxi-Cosi|Cybex|Babyzen|Stokke|Chicco|Mothercare|Kiabi|H&M|Zara).*$/i, '')
    .replace(/\s*:.*$/, '') // Supprimer tout après ":"
    .trim()
    .slice(0, 150);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });
  if (!auth(req)) return res.status(401).json({ error: 'Non autorisé' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL manquante' });

  let targetUrl;
  try { targetUrl = new URL(url); } catch { return res.status(400).json({ error: 'URL invalide' }); }

  try {
    // Microlink API — contourne les blocages, extrait OG tags + prix
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl.toString())}&meta=true&video=false&audio=false&iframe=false`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const mlRes = await fetch(microlinkUrl, {
      headers: { 'x-api-key': process.env.MICROLINK_API_KEY || '' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!mlRes.ok) {
      return res.status(502).json({ error: `Microlink inaccessible (${mlRes.status})` });
    }

    const mlData = await mlRes.json();

    if (mlData.status !== 'success') {
      return res.status(502).json({ error: mlData.message || 'Impossible de scraper cette URL' });
    }

    const { title: rawTitle, image, description, price } = mlData.data || {};

    const title = cleanTitle(rawTitle, url);
    const imageUrl = image?.url || null;
    const priceValue = price?.amount ? Number(price.amount) : null;
    const category = detectCategory(url, title);

    return res.status(200).json({
      title,
      price: priceValue,
      image: imageUrl,
      description: (description || '').slice(0, 300),
      category,
      url: targetUrl.toString(),
    });

  } catch (err) {
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Timeout — le site met trop de temps à répondre' });
    console.error('Scrape error:', err);
    return res.status(500).json({ error: 'Erreur lors du scraping' });
  }
}
