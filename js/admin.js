// admin.js v2.0
const $=(sel)=>document.querySelector(sel);
const $$=(sel)=>document.querySelectorAll(sel);
const esc=(str)=>{const d=document.createElement('div');d.textContent=String(str||'');return d.innerHTML};
let adminToken='',allGifts=[],allReservations=[];
function showToast(msg,type='default',duration=3500){const t=$('#toast');t.textContent=msg;t.className=`toast ${type} show`;clearTimeout(t._timer);t._timer=setTimeout(()=>{t.className='toast'},duration)}
$('#login-form').addEventListener('submit',async(e)=>{
  e.preventDefault();const pwd=$('#admin-password').value;
  const btn=e.target.querySelector('button');btn.disabled=true;btn.textContent='Connexion…';
  try{
    const res=await fetch('/api/gifts',{headers:{'Authorization':`Bearer ${pwd}`}});
    if(res.status===401)throw new Error('Mot de passe incorrect');
    adminToken=pwd;sessionStorage.setItem('adminToken',pwd);showDashboard();
  }catch(err){
    $('#login-error').style.display='block';$('#login-error').textContent=`❌ ${err.message}`;
    btn.disabled=false;btn.textContent='Connexion';
  }
});
function showDashboard(){$('#login-screen').style.display='none';$('#dashboard').style.display='block';loadAll()}
$('#logout-btn').addEventListener('click',()=>{
  sessionStorage.removeItem('adminToken');adminToken='';
  $('#login-screen').style.display='flex';$('#dashboard').style.display='none';$('#admin-password').value='';
});
async function loadAll(){
  try{
    const[gRes,rRes]=await Promise.all([fetch('/api/gifts'),fetch('/api/reservations')]);
    allGifts=await gRes.json();allReservations=await rRes.json();
    updateStats();renderGiftsTable();renderReservations();
  }catch(err){showToast('Erreur de chargement','error')}
}
function updateStats(){
  const total=allGifts.length,reserved=allReservations.length;
  const pct=total>0?Math.round((reserved/total)*100):0;
  const totalValue=allGifts.reduce((s,g)=>s+(Number(g.price)||0),0);
  $('#stat-total').textContent=total;$('#stat-reserved').textContent=reserved;
  $('#stat-pct').textContent=`${pct}%`;$('#stat-value').textContent=`${totalValue.toFixed(0)} €`;
}
function renderGiftsTable(filter=''){
  const tbody=$('#gifts-tbody');
  const filtered=filter?allGifts.filter(g=>(g.name||'').toLowerCase().includes(filter.toLowerCase())):allGifts;
  if(!filtered.length){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:#aaa">Aucun cadeau</td></tr>';return}
  tbody.innerHTML=filtered.map(g=>{
    const res=allReservations.find(r=>r.giftId===g.id);
    const imgSrc=esc(g.image||'');const name=esc(g.name||'');const cat=esc(g.category||'');const price=g.price?`${g.price} €`:'—';
    return `<tr>
      <td>${imgSrc?`<img src="${imgSrc}" alt="${name}" class="table-img" onerror="this.style.display='none'">`:'<span class="table-img-placeholder">🎁</span>'}</td>
      <td><div class="table-name">${name}</div>${g.url?`<a href="${esc(g.url)}" target="_blank" rel="noopener" class="table-link">Voir →</a>`:''}</td>
      <td><span class="table-cat">${cat}</span></td>
      <td class="table-price">${price}</td>
      <td>${res?`<span class="badge badge-reserved">✅ ${esc(res.name)}</span>`:'<span class="badge badge-free">Disponible</span>'}</td>
      <td><div class="table-actions">${res?`<button class="btn-sm btn-danger" onclick="cancelReservation('${esc(res.id)}')">Annuler rés.</button>`:''}<button class="btn-sm btn-danger" onclick="deleteGift('${esc(g.id)}')">Supprimer</button></div></td>
    </tr>`;
  }).join('');
}
$('#search-gifts').addEventListener('input',(e)=>{renderGiftsTable(e.target.value)});
$('#scrape-btn').addEventListener('click',async()=>{
  const url=$('#scrape-url').value.trim();if(!url)return showToast('Entrez une URL','error');
  const btn=$('#scrape-btn');btn.disabled=true;btn.textContent='⏳ Scraping…';
  try{
    const res=await fetch(`/api/scrape?url=${encodeURIComponent(url)}`,{headers:{'Authorization':`Bearer ${adminToken}`}});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||`Erreur ${res.status}`)}
    const data=await res.json();
    if(data.title)$('#gift-name').value=data.title;
    if(data.price)$('#gift-price').value=data.price;
    if(data.image){$('#gift-image').value=data.image;$('#preview-img').src=data.image;$('#gift-preview').style.display='block'}
    if(data.url)$('#gift-url').value=data.url;
    if(data.category)$('#gift-category').value=data.category;
    showToast('✅ Informations récupérées !','success');
  }catch(err){showToast(`❌ ${err.message}`,'error')}
  finally{btn.disabled=false;btn.textContent='🔍 Scraper'}
});
$('#gift-image').addEventListener('input',(e)=>{
  const url=e.target.value.trim();
  if(url){$('#preview-img').src=url;$('#gift-preview').style.display='block'}else{$('#gift-preview').style.display='none'}
});
$('#add-gift-form').addEventListener('submit',async(e)=>{
  e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent='⏳ Ajout en cours…';
  const body={name:$('#gift-name').value.trim(),price:$('#gift-price').value?Number($('#gift-price').value):null,category:$('#gift-category').value,image:$('#gift-image').value.trim(),url:$('#gift-url').value.trim()};
  try{
    const res=await fetch('/api/gifts',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${adminToken}`},body:JSON.stringify(body)});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||`Erreur ${res.status}`)}
    const g=await res.json();allGifts.push(g);updateStats();renderGiftsTable();
    e.target.reset();$('#gift-preview').style.display='none';$('#scrape-url').value='';
    showToast('🎁 Cadeau ajouté !','success');
  }catch(err){showToast(`❌ ${err.message}`,'error')}
  finally{btn.disabled=false;btn.textContent='Ajouter le cadeau ✨'}
});
window.deleteGift=async(id)=>{
  if(!confirm('Supprimer ce cadeau ? Cette action est irréversible.'))return;
  try{
    const res=await fetch(`/api/gifts?id=${id}`,{method:'DELETE',headers:{'Authorization':`Bearer ${adminToken}`}});
    if(!res.ok)throw new Error('Erreur suppression');
    allGifts=allGifts.filter(g=>g.id!==id);updateStats();renderGiftsTable();showToast('🗑 Cadeau supprimé');
  }catch(err){showToast(`❌ ${err.message}`,'error')}
};
window.cancelReservation=async(id)=>{
  if(!confirm('Annuler cette réservation ?'))return;
  try{
    const res=await fetch(`/api/reservations?id=${id}`,{method:'DELETE',headers:{'Authorization':`Bearer ${adminToken}`}});
    if(!res.ok)throw new Error('Erreur annulation');
    allReservations=allReservations.filter(r=>r.id!==id);updateStats();renderGiftsTable();renderReservations();showToast('✅ Réservation annulée');
  }catch(err){showToast(`❌ ${err.message}`,'error')}
};
function renderReservations(){
  const list=$('#reservations-list');
  if(!allReservations.length){list.innerHTML="<p style='color:#aaa;text-align:center;padding:24px'>Aucune réservation pour l'instant</p>";return}
  list.innerHTML=allReservations.map(r=>{
    const gift=allGifts.find(g=>g.id===r.giftId);
    return `<div class="reservation-card">
      <div class="reservation-info">
        <strong>${esc(r.name)}</strong>
        <span>a réservé <em>${esc(gift?.name||'un cadeau')}</em></span>
        ${r.message?`<span class="reservation-msg">"${esc(r.message)}"</span>`:''}
      </div>
      <div class="reservation-meta">
        <span class="reservation-date">${new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
        <button class="btn-sm btn-danger" onclick="cancelReservation('${esc(r.id)}')">Annuler</button>
      </div>
    </div>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded',()=>{
  const saved=sessionStorage.getItem('adminToken');
  if(saved){adminToken=saved;showDashboard()}
});