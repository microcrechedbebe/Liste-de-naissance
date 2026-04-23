// app.js v2.0
const esc=(str)=>{const d=document.createElement('div');d.textContent=String(str||'');return d.innerHTML};
const $=(sel)=>document.querySelector(sel);
const $$=(sel)=>document.querySelectorAll(sel);
function showToast(msg,type='default',duration=3500){const t=$('#toast');t.textContent=msg;t.className=`toast ${type} show`;clearTimeout(t._timer);t._timer=setTimeout(()=>{t.className='toast'},duration)}
let allGifts=[],allReservations={},currentFilter='all';
function initCountdown(){
  const due=new Date('2026-08-07T00:00:00+02:00');
  function update(){
    const diff=due-new Date();
    if(diff<=0){['days','hours','mins','secs'].forEach(k=>$(`#cd-${k}`).textContent='00');return}
    $('#cd-days').textContent=Math.floor(diff/86400000);
    $('#cd-hours').textContent=String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
    $('#cd-mins').textContent=String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    $('#cd-secs').textContent=String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  }
  update();setInterval(update,1000);
}
async function loadData(){
  try{
    const[gRes,rRes]=await Promise.all([fetch('/api/gifts'),fetch('/api/reservations')]);
    if(!gRes.ok)throw new Error(`Gifts: ${gRes.status}`);
    if(!rRes.ok)throw new Error(`Reservations: ${rRes.status}`);
    const gData=await gRes.json(),rData=await rRes.json();
    allGifts=Array.isArray(gData)?gData:(gData.gifts||[]);
    const reservations=Array.isArray(rData)?rData:(rData.reservations||[]);
    allReservations={};
    reservations.forEach(r=>{allReservations[r.giftId]=r});
    renderGifts();updateProgress();
  }catch(err){
    console.error('Erreur chargement:',err);
    $('#gifts-grid').innerHTML='<div class="empty-state">😕 Impossible de charger la liste.<br><small>Réessayez dans quelques instants</small></div>';
  }
}
function updateProgress(){
  const total=allGifts.length,reserved=Object.keys(allReservations).length;
  const pct=total>0?Math.round((reserved/total)*100):0;
  $('#progress-count').textContent=`${reserved} / ${total} cadeaux réservés`;
  $('#progress-percent').textContent=`${pct}%`;
  requestAnimationFrame(()=>{$('#progress-bar').style.width=`${pct}%`});
}
function renderGifts(){
  const grid=$('#gifts-grid');
  const filtered=currentFilter==='all'?allGifts:allGifts.filter(g=>(g.category||'').toLowerCase()===currentFilter);
  if(!filtered.length){grid.innerHTML='<div class="empty-state">Aucun cadeau dans cette catégorie 🎁</div>';return}
  grid.innerHTML=filtered.map(g=>{
    const reserved=allReservations[g.id];
    const imgSrc=esc(g.image||g.imageUrl||'');
    const name=esc(g.name||g.title||'Cadeau');
    const price=g.price?`${esc(String(g.price))} €`:'';
    const cat=esc(g.category||'');
    return `<article class="gift-card${reserved?' reserved':''}" data-id="${esc(String(g.id))}">
      <div class="gift-img-wrap">${imgSrc?`<img src="${imgSrc}" alt="${name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"gift-emoji-fallback\\">🎁</div>'">`:'<div class="gift-emoji-fallback">🎁</div>'}</div>
      <div class="gift-body">
        <div class="gift-category">${cat}</div>
        <h3 class="gift-name">${name}</h3>
        ${price?`<div class="gift-price">${price}</div>`:''}
        <button class="gift-btn" ${reserved?'disabled':''} data-id="${esc(String(g.id))}">${reserved?'✅ Réservé':'🎁 Réserver'}</button>
      </div>
    </article>`;
  }).join('');
  grid.querySelectorAll('.gift-btn:not([disabled])').forEach(btn=>{
    btn.addEventListener('click',(e)=>{e.stopPropagation();openModal(btn.dataset.id)});
  });
  if(window.gsap)gsap.fromTo('.gift-card',{opacity:0,y:30},{opacity:1,y:0,duration:.5,stagger:.06,ease:'power2.out'});
}
function initFilters(){
  $$('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.filter-btn').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
      btn.classList.add('active');btn.setAttribute('aria-selected','true');
      currentFilter=btn.dataset.cat;renderGifts();
    });
  });
}
function openModal(giftId){
  const gift=allGifts.find(g=>String(g.id)===String(giftId));
  if(!gift)return;
  const reserved=allReservations[giftId];
  const imgSrc=gift.image||gift.imageUrl||'';
  const name=gift.name||gift.title||'Cadeau';
  const link=gift.url||gift.link||'#';
  const modalImg=$('#modal-img');
  modalImg.src=imgSrc;modalImg.alt=name;
  modalImg.onerror=()=>{modalImg.style.display='none'};
  $('#modal-category').textContent=gift.category||'';
  $('#modal-title').textContent=name;
  $('#modal-price').textContent=gift.price?`${gift.price} €`:'';
  $('#modal-link').href=link;
  $('#modal-link').style.display=link!=='#'?'inline-block':'none';
  $('#modal-gift-id').value=giftId;
  if(reserved){
    $('#modal-reserved-badge').style.display='block';
    $('#modal-reserved-by').textContent=reserved.name||"quelqu'un";
    $('#modal-form').style.display='none';
  }else{
    $('#modal-reserved-badge').style.display='none';
    $('#modal-form').style.display='block';
    $('#res-name').value='';$('#res-message').value='';
    $('#modal-submit-btn').disabled=false;
    $('#modal-submit-btn').textContent='Réserver ce cadeau 🎁';
  }
  $('#modal-overlay').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeModal(){$('#modal-overlay').classList.remove('active');document.body.style.overflow=''}
function initModal(){
  $('#modal-close').addEventListener('click',closeModal);
  $('#modal-overlay').addEventListener('click',(e)=>{if(e.target===$('#modal-overlay'))closeModal()});
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeModal()});
  $('#modal-form').addEventListener('submit',async(e)=>{
    e.preventDefault();
    const giftId=$('#modal-gift-id').value;
    const name=$('#res-name').value.trim();
    const message=$('#res-message').value.trim();
    if(!name){showToast('Veuillez entrer votre prénom 😊','error');return}
    const btn=$('#modal-submit-btn');
    btn.disabled=true;btn.textContent='⏳ Réservation en cours…';
    try{
      const res=await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({giftId,name,message})});
      if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||`Erreur ${res.status}`)}
      allReservations[giftId]={giftId,name,message};
      updateProgress();renderGifts();closeModal();
      showToast('🎉 Cadeau réservé ! Merci beaucoup !','success');
    }catch(err){
      btn.disabled=false;btn.textContent='Réserver ce cadeau 🎁';
      showToast(`❌ ${err.message}`,'error');
    }
  });
}
function initGuestbook(){
  const stored=JSON.parse(localStorage.getItem('guestbook')||'[]');
  renderGuestbookMessages(stored);
  const textarea=$('#gb-message');
  textarea.addEventListener('input',()=>{$('#char-current').textContent=textarea.value.length});
  $('#guestbook-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const name=$('#gb-name').value.trim(),relation=$('#gb-relation').value.trim(),message=$('#gb-message').value.trim();
    if(!name||!message){showToast('Prénom et message requis 😊','error');return}
    if(message.length>300){showToast('Message trop long (max 300 caractères)','error');return}
    const entry={name,relation,message,date:new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})};
    const messages=JSON.parse(localStorage.getItem('guestbook')||'[]');
    messages.unshift(entry);localStorage.setItem('guestbook',JSON.stringify(messages));
    renderGuestbookMessages(messages);
    $('#guestbook-form').reset();$('#char-current').textContent='0';
    showToast('💌 Message ajouté ! Merci !','success');
  });
}
function renderGuestbookMessages(messages){
  const list=$('#guestbook-list');
  if(!messages.length){list.innerHTML='<p style="text-align:center;color:#aaa;padding:24px">Soyez le premier à laisser un message 💙</p>';return}
  list.innerHTML=messages.map(m=>`<div class="guestbook-card">
    <div class="guestbook-card-header">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="guestbook-card-name">${esc(m.name)}</span>
        ${m.relation?`<span class="guestbook-card-relation">${esc(m.relation)}</span>`:''}
      </div>
      <span class="guestbook-card-date">${esc(m.date)}</span>
    </div>
    <p class="guestbook-card-message">${esc(m.message)}</p>
  </div>`).join('');
}
function initAdminAccess(){
  let clicks=0,timer;
  $('#footer-symbol').addEventListener('click',()=>{
    clicks++;clearTimeout(timer);
    timer=setTimeout(()=>{clicks=0},600);
    if(clicks>=3){clicks=0;window.location.href='/admin'}
  });
}
function initBackToTop(){
  const btn=$('#back-to-top');
  window.addEventListener('scroll',()=>{btn.classList.toggle('visible',window.scrollY>400)},{passive:true});
  btn.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});
}
function initAnimations(){
  if(!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo('.hero-badge',{opacity:0,y:-20},{opacity:1,y:0,duration:.8,ease:'power2.out'});
  gsap.fromTo('.hero-title',{opacity:0,y:40},{opacity:1,y:0,duration:1,delay:.2,ease:'power3.out'});
  gsap.fromTo('.hero-subtitle,.hero-divider',{opacity:0,y:20},{opacity:1,y:0,duration:.8,delay:.5,stagger:.15,ease:'power2.out'});
  gsap.fromTo('.countdown-wrapper',{opacity:0,y:20},{opacity:1,y:0,duration:.8,delay:.8,ease:'power2.out'});
  gsap.fromTo('.hero-cta',{opacity:0,scale:.9},{opacity:1,scale:1,duration:.6,delay:1.1,ease:'back.out(1.7)'});
  gsap.utils.toArray('.section-title,.section-subtitle').forEach(el=>{
    gsap.fromTo(el,{opacity:0,y:30},{opacity:1,y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 85%'}});
  });
}
function initParticles(){
  const container=$('#particles');if(!container)return;
  const symbols=['ⵣ','✦','◆','·'];
  for(let i=0;i<20;i++){
    const p=document.createElement('span');
    p.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${Math.random()*16+8}px;color:rgba(255,255,255,${Math.random()*.06+.02});animation:float ${Math.random()*6+6}s ease-in-out infinite;animation-delay:${Math.random()*6}s;pointer-events:none;user-select:none;`;
    container.appendChild(p);
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  initCountdown();initFilters();initModal();initGuestbook();
  initAdminAccess();initBackToTop();initParticles();loadData();
  window.addEventListener('load',initAnimations);
});
