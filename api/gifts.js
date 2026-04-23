import { kv } from '@vercel/kv';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
function setCors(res){res.setHeader('Access-Control-Allow-Origin',ALLOWED_ORIGIN);res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')}
function auth(req){const t=req.headers['authorization']?.replace('Bearer ','');return t===process.env.ADMIN_PASSWORD}
function validateGift(body){
  const{name,price,category,image,url}=body||{};
  if(!name||typeof name!=='string'||name.trim().length<2)return{valid:false,error:'Nom invalide (min 2 caractères)'};
  if(price!==undefined&&(isNaN(Number(price))||Number(price)<0))return{valid:false,error:'Prix invalide'};
  return{valid:true,data:{name:name.trim().slice(0,200),price:price!==undefined?Number(price):null,category:(category||'autre').trim().slice(0,50),image:(image||'').trim().slice(0,500),url:(url||'').trim().slice(0,500)}};
}
export default async function handler(req,res){
  setCors(res);
  if(req.method==='OPTIONS')return res.status(200).end();
  try{
    if(req.method==='GET'){const gifts=await kv.get('gifts')||[];return res.status(200).json(gifts)}
    if(req.method==='POST'){
      if(!auth(req))return res.status(401).json({error:'Non autorisé'});
      const v=validateGift(req.body);
      if(!v.valid)return res.status(400).json({error:v.error});
      const gifts=await kv.get('gifts')||[];
      const g={id:Date.now().toString(),...v.data,createdAt:new Date().toISOString()};
      gifts.push(g);await kv.set('gifts',gifts);return res.status(201).json(g);
    }
    if(req.method==='PUT'){
      if(!auth(req))return res.status(401).json({error:'Non autorisé'});
      const{id}=req.query;if(!id)return res.status(400).json({error:'ID manquant'});
      const v=validateGift(req.body);if(!v.valid)return res.status(400).json({error:v.error});
      const gifts=await kv.get('gifts')||[];
      const idx=gifts.findIndex(g=>g.id===id);
      if(idx===-1)return res.status(404).json({error:'Cadeau non trouvé'});
      gifts[idx]={...gifts[idx],...v.data,updatedAt:new Date().toISOString()};
      await kv.set('gifts',gifts);return res.status(200).json(gifts[idx]);
    }
    if(req.method==='DELETE'){
      if(!auth(req))return res.status(401).json({error:'Non autorisé'});
      const{id}=req.query;if(!id)return res.status(400).json({error:'ID manquant'});
      const gifts=await kv.get('gifts')||[];
      const filtered=gifts.filter(g=>g.id!==id);
      if(filtered.length===gifts.length)return res.status(404).json({error:'Cadeau non trouvé'});
      await kv.set('gifts',filtered);return res.status(200).json({success:true});
    }
    return res.status(405).json({error:'Méthode non autorisée'});
  }catch(err){console.error('API gifts error:',err);return res.status(500).json({error:'Erreur serveur'})}
}