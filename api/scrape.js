import { createClient } from '@vercel/kv';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
};

function extractJsonLd(html) {
  try {
    const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of matches) {
      try {
        const data = JSON.parse(m[1]);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const obj = item['@graph'] ? item['@graph'].find(x => x['@type'] === 'Product') : item;
          if (obj && obj['@type'] === 'Product') {
            let price = null;
            if (obj.offers) {
              const offers = Array.isArray(obj.offers) ? obj.offers : [obj.offers];
              price = parseFloat(offers[0]?.price || offers[0]?.lowPrice || 0) || null;
            }
            let image = null;
            if (obj.image) {
              image = Array.isArray(obj.image) ? obj.image[0] : obj.image;
              if (typeof image === 'object') image = image.url || image.contentUrl;
            }
            return { name: obj.name, price, image, source: 'json-ld' };
          }
        }
      } catch {}
    }
  } catch {}
  return null;
}

function extractMeta(html) {
  const get = (patterns) => {
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1]) return m[1].trim();
    }
    return null;
  };
  return { name: get([/property=["']og:title["'][^>]*content=["']([^"']+)["']/i,/<title>([^<]+)<\/title>/i]), image: get([/property=["']og:image["'][^>]*content=["']([^"']+)["']/i]), price: null };
}

function extractAmazon(html) {
  const priceWhole = (html.match(/class=["'][^"']*a-price-whole["'][^>]*>([^<]+)/i) || [])[1]?.replace(/[^\d]/g, '') || '';
  const priceFrac = (html.match(/class=["'][^"']*a-price-fraction["'][^>]*>([^<]+)/i) || [])[1]?.replace(/[^\d]/g, '') || '00';
  const price = priceWhole ? parseFloat(priceWhole + '.' + priceFrac) : null;
  const name = (html.match(/id=["']productTitle["'][^>]*>\s*([^<]+)/i) || [])[1]?.trim() || (html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || [])[1]?.trim();
  const image = (html.match(/id=["']landingImage["'][^>]*(?:src|data-old-hires)=["']([^"']+)["']/i) || [])[1] || (html.match(/"hiRes":"([^"]+)"/i) || [])[1];
  return { name, price, image, source: 'amazon' };
}

function extractVertbaudet(html) {
  const name = (html.match(/class=["'][^"']*product[_-]?name["'][^>]*>([^<]+)/i) || [])[1]?.trim() || (html.match(/itemprop=["']name["'][^>]*content=["']([^"']+)["']/i) || [])[1]?.trim();
  const priceStr = (html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i) || [])[1] || (html.match(/class=["'][^"']*price[^"']*["'][^>]*>\s*([0-9]+[,.]?[0-9]*)\s*€/i) || [])[1];
  const price = priceStr ? parseFloat(priceStr.replace(',', '.')) : null;
  const image = (html.match(/itemprop=["']image["'][^>]*content=["']([^"']+)["']/i) || [])[1] || (html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || [])[1];
  return { name, price, image, source: 'vertbaudet' };
}

function extractIKEA(html) {
  const name = (html.match(/class=["'][^"']*product-name["'][^>]*>([^<]+)<\/span>/i) || [])[1]?.trim() || (html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || [])[1]?.trim();
  const price = (html.match(/class=["'][^"']*price__integer["'][^>]*>([^<]+)/i) || [])[1]?.replace(/\s/g, '');
  const priceDecimal = (html.match(/class=["'][^"']*price__decimal["'][^>]*>([^<]+)/i) || [])[1] || '00';
  const priceFinal = price ? parseFloat(price + '.' + priceDecimal) : null;
  const image = (html.match(/class=["'][^"']*product-card__image[^"']*["'][^>]*src=["']([^"']+)["']/i) || [])[1] || (html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || [])[1];
  return { name, price: priceFinal, image, source: 'ikea' };
}

function cleanName(name) {
  if (!name) return null;
  return name.replace(/\s*[-|–]\s*(Amazon\.fr|Vertbaudet|IKEA|Kinderkraft|Maisons du Monde)[^$]*/gi, '').replace(/\s*:.*$/, '').trim().slice(0, 120);
}

function ensureAbsoluteUrl(url, baseUrl) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  try { return new URL(url, baseUrl).href; } catch { return url; }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL manquante' });
  let targetUrl;
  try { targetUrl = new URL(url); } catch { return res.status(400).json({ error: 'URL invalide' }); }
  try {
    const response = await fetch(targetUrl.href, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return res.status(200).json({ success: false, error: 'Erreur ' + response.status, url });
    const html = await response.text();
    const hostname = targetUrl.hostname.toLowerCase();
    let result = {};
    if (hostname.includes('amazon')) result = { ...extractMeta(html), ...extractAmazon(html) };
    else if (hostname.includes('vertbaudet')) result = { ...extractMeta(html), ...extractVertbaudet(html) };
    else if (hostname.includes('ikea')) result = { ...extractMeta(html), ...extractIKEA(html) };
    else { const jsonLd = extractJsonLd(html); const meta = extractMeta(html); result = jsonLd ? { ...meta, ...jsonLd } : meta; }
    result.name = cleanName(result.name);
    result.image = ensureAbsoluteUrl(result.image, targetUrl.href);
    result.url = targetUrl.href;
    result.success = !!(result.name || result.image);
    return res.status(200).json(result);
  } catch (err) { return res.status(200).json({ success: false, error: err.message, url }); }
}
