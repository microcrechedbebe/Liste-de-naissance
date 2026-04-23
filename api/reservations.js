import { kv } from '@vercel/kv';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
function setCors(res){res.setHeader('Access-Control-Allow-Origin',ALLOWED_ORIGIN);res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')}
function auth(req){const t=req.headers['authorization']?.replace('Bearer ','');return t===process.env.ADMIN_PASSWORD}
export default async function handler(req,res){
  setCors(res);
  if(req.method==='OPTIONS')return res.status(200).end();
  try{
    if(req.method==='GET'){const r=await kv.get('reservations')||[];return res.status(200).json(r)}
    if(req.method==='POST'){
      const{giftId,name,message}=req.body||{};
      if(!giftId||typeof giftId!=='string')return res.status(400).json({error:'giftId manquant'});
      if(!name||typeof name!=='string'||name.trim().length<2)return res.status(400).json({error:'Prénom invalide'});
      const gifts=await kv.get('gifts')||[];
      if(!gifts.find(g=>g.id===giftId))return res.status(404).json({error:'Cadeau non trouvé'});
      const reservations=await kv.get('reservations')||[];
      if(reservations.find(r=>r.giftId===giftId))return res.status(409).json({error:'Ce cadeau est déjà réservé'});
      const r={id:Date.now().toString(),giftId,name:name.trim().slice(0,50),message:(message||'').trim().slice(0,200),createdAt:new Date().toISOString()};
      reservations.push(r);await kv.set('reservations',reservations);return res.status(201).json(r);
    }
    if(req.method==='DELETE'){
      if(!auth(req))return res.status(401).json({error:'Non autorisé'});
      const{id}=req.query;if(!id)return res.status(400).json({error:'ID manquant'});
      const r=await kv.get('reservations')||[];
      await kv.set('reservations',r.filter(x=>x.id!==id));return res.status(200).json({success:true});
    }
    return res.status(405).json({error:'Méthode non autorisée'});
  }catch(err){console.error('API reservations error:',err);return res.status(500).json({error:'Erreur serveur'})}
}