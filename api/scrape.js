import * as cheerio from 'cheerio';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
function setCors(res){res.setHeader('Access-Control-Allow-Origin',ALLOWED_ORIGIN);res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')}
function auth(req){const t=req.headers['authorization']?.replace('Bearer ','');return t===process.env.ADMIN_PASSWORD}
const HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36','Accept':'text/html,*/*;q=0.8','Accept-Language':'fr-FR,fr;q=0.9'};
function extractFromMeta($){return{title:$('meta[property="og:title"]').attr('content')||$('title').text().trim()||null,image:$('meta[property="og:image"]').attr('content')||null,description:$('meta[property="og:description"]').attr('content')||$('meta[name="description"]').attr('content')||null}}
function extractPrice($){
  const sels=['.a-price-whole','[data-testid="price"]','.price','.product-price','[itemprop="price"]'];
  for(const s of sels){const t=$(s).first().text().replace(/[^0-9,.]/g,'').trim();if(t){const n=parseFloat(t.replace(',','.'));if(!isNaN(n)&&n>0&&n<10000)return n}}
  return null;
}
function detectCategory(url,title){
  const t=(url+' '+title).toLowerCase();
  if(t.match(/matelas|lit|berceau|chambre|commode/))return 'chambre';
  if(t.match(/poussette|siège|auto|porteur/))return 'mobilite';
  if(t.match(/bain|baignoire|serviette/))return 'bain';
  if(t.match(/biberon|repas|chaise haute|stérilisateur/))return 'repas';
  if(t.match(/jouet|éveil|mobile|peluche/))return 'eveil';
  if(t.match(/thermomètre|santé|soin/))return 'sante';
  if(t.match(/vêtement|body|pyjama/))return 'vetements';
  return 'autre';
}
export default async function handler(req,res){
  setCors(res);
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée'});
  if(!auth(req))return res.status(401).json({error:'Non autorisé'});
  const{url}=req.query;
  if(!url)return res.status(400).json({error:'URL manquante'});
  let targetUrl;try{targetUrl=new URL(url)}catch{return res.status(400).json({error:'URL invalide'})}
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    const response=await fetch(targetUrl.toString(),{headers:HEADERS,signal:controller.signal,redirect:'follow'});
    clearTimeout(timeout);
    if(!response.ok)return res.status(502).json({error:`Site inaccessible (${response.status})`});
    const html=await response.text();
    const $=cheerio.load(html);
    const meta=extractFromMeta($);
    const price=extractPrice($);
    const category=detectCategory(url,meta.title||'');
    const title=(meta.title||'').replace(/\s*[|\-–—]\s*(Amazon|Vertbaudet|IKEA|Kinderkraft|Cdiscount|Fnac).*$/i,'').trim().slice(0,150);
    return res.status(200).json({title,price,image:meta.image||null,description:(meta.description||'').slice(0,300),category,url:targetUrl.toString()});
  }catch(err){
    if(err.name==='AbortError')return res.status(504).json({error:'Timeout'});
    return res.status(500).json({error:'Erreur lors du scraping'});
  }
}