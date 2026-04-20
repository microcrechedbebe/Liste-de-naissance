/* Liste de Naissance — Sofiane & Katia | app.js */
const CONFIG = { API_URL: '/api/reservations', POLL_INTERVAL: 15000 };

const GIFT_DATA = { categories: [
  { id:'sommeil', name:'Sommeil', icon:'🌙', items:[
    {id:'lit-evolutif',name:'Lit évolutif 60x120',desc:'Lit bébé convertible avec 3 hauteurs de sommier.',price:149,emoji:'🛏️',store:'IKEA',link:'https://www.ikea.com/fr/fr/cat/lits-bebe-24823/'},
    {id:'matelas',name:'Matelas ergonomique 60x120',desc:'Matelas mousse à mémoire de forme, housse lavable.',price:79,emoji:'🧽',store:'La Redoute',link:'https://www.laredoute.fr/'},
    {id:'surmatelas',name:'Surmatelas imperméable (x2)',desc:'Protection matelas respirante, lavable. Pack de 2.',price:25,emoji:'🛡️',store:'Amazon',link:'https://www.amazon.fr/s?k=surmatelas+impermeable+bebe'},
    {id:'gigoteuse',name:'Gigoteuse 2.5 TOG',desc:'Gigoteuse en coton bio, 18-20°C.',price:35,emoji:'🧸',store:'Vertbaudet',link:'https://www.vertbaudet.fr/Fr/gigoteuse-bebe.htm'},
    {id:'veilleuse',name:'Veilleuse musicale',desc:'Veilleuse avec mélodies apaisantes et projection étoiles.',price:25,emoji:'✨',store:'Amazon',link:'https://www.amazon.fr/s?k=veilleuse+musicale+bebe'},
    {id:'thermometre',name:'Thermomètre de chambre',desc:'Thermomètre digital avec hygromètre.',price:15,emoji:'🌡️',store:'Amazon',link:'https://www.amazon.fr/s?k=thermometre+chambre+bebe'},
  ]},
  { id:'alimentation', name:'Alimentation', icon:'🍼', items:[
    {id:'biberons',name:'Set biberons anti-coliques',desc:'Lot de 4 biberons Philips Avent.',price:45,emoji:'🍼',store:'Philips Avent',link:'https://www.philips.fr/a-p/avent'},
    {id:'sterilisateur',name:'Stérilisateur vapeur',desc:'Stérilisation en 6 minutes, compatible lave-vaisselle.',price:55,emoji:'⚡',store:'Philips Avent',link:'https://www.philips.fr/a-p/avent'},
    {id:'chauffe-biberon',name:'Chauffe-biberon',desc:'Réchauffeur rapide avec arrêt automatique.',price:35,emoji:'♨️',store:'Amazon',link:'https://www.amazon.fr/s?k=chauffe+biberon'},
    {id:'transat',name:'Transat ergonomique',desc:'Transat inclinable avec arche de jeux.',price:89,emoji:'🪑',store:'Babymoov',link:'https://www.babymoov.com/'},
    {id:'chaise-haute',name:'Chaise haute évolutive',desc:"Chaise haute jusqu'à 10 ans.",price:159,emoji:'🪑',store:'Stokke',link:'https://www.stokke.com/'},
    {id:'babycook',name:'Mixeur / Babycook',desc:'Robot cuiseur vapeur pour purées maison.',price:89,emoji:'🍳',store:'Béaba',link:'https://www.beaba.com/'},
  ]},
  { id:'bain', name:'Bain & Soins', icon:'🛁', items:[
    {id:'baignoire',name:'Baignoire ergonomique',desc:'Baignoire avec thermomètre intégré.',price:49,emoji:'🛁',store:'Amazon',link:'https://www.amazon.fr/s?k=baignoire+bebe'},
    {id:'toilette',name:'Set de toilette bébé',desc:'Thermomètre, coupe-ongles, brosse douce.',price:25,emoji:'🧴',store:'Mustela',link:'https://www.mustela.fr/'},
    {id:'couches',name:'Couches naissance (Lot)',desc:'Lot de couches taille naissance.',price:30,emoji:'👶',store:'Pampers',link:'https://www.pampers.fr/'},
    {id:'tapis-change',name:'Tapis de change',desc:'Tapis pliable avec poche de rangement, lavable.',price:20,emoji:'🟦',store:'Amazon',link:'https://www.amazon.fr/s?k=tapis+de+change'},
    {id:'cosmetiques',name:'Set cosmétiques bio',desc:'Crème change, lait corps, shampooing doux bio.',price:35,emoji:'💆',store:'Mustela',link:'https://www.mustela.fr/'},
  ]},
  { id:'sorties', name:'Sorties & Transport', icon:'🚗', items:[
    {id:'poussette',name:'Poussette compacte',desc:'Poussette légère pliante, homologuée avion.',price:299,emoji:'🚼',store:'Bugaboo',link:'https://www.bugaboo.com/'},
    {id:'coque-auto',name:'Coque auto 0-13kg',desc:'Siège auto dos à la route avec isofix.',price:199,emoji:'🚗',store:'Cybex',link:'https://www.cybex-online.com/'},
    {id:'base-isofix',name:'Base isofix',desc:'Base fixe pour coque auto.',price:129,emoji:'🔧',store:'Cybex',link:'https://www.cybex-online.com/'},
    {id:'porte-bebe',name:'Porte-bébé physiologique',desc:'Porte-bébé ergonomique dès la naissance.',price:89,emoji:'🤱',store:'Ergobaby',link:'https://ergobaby.fr/'},
    {id:'sac-couches',name:'Sac à couches',desc:'Sac à dos isotherme avec compartiments.',price:45,emoji:'🎒',store:'Amazon',link:'https://www.amazon.fr/s?k=sac+a+couches'},
  ]},
  { id:'vetements', name:'Vêtements', icon:'👶', items:[
    {id:'grenouilleres',name:'Grenouillères naissance (x3)',desc:'Lot de 3 grenouillères coton bio.',price:45,emoji:'🧸',store:'Vertbaudet',link:'https://www.vertbaudet.fr/Fr/grenouillere-bebe.htm'},
    {id:'bodies',name:'Bodies naissance (x5)',desc:'Lot de 5 bodies col rond, coton doux.',price:35,emoji:'👕',store:'Vertbaudet',link:'https://www.vertbaudet.fr/Fr/body-bebe.htm'},
    {id:'pyjamas',name:'Pyjamas (x2)',desc:'Lot de 2 pyjamas pieds intégrés.',price:25,emoji:'😴',store:'Vertbaudet',link:'https://www.vertbaudet.fr/Fr/pyjama-bebe.htm'},
    {id:'bonnets',name:'Bonnets naissance (x3)',desc:'Lot de 3 bonnets coton.',price:18,emoji:'🎩',store:'Amazon',link:'https://www.amazon.fr/s?k=bonnet+naissance+bebe'},
    {id:'chaussettes',name:'Chaussettes (x6 paires)',desc:'Lot de 6 paires anti-glisse.',price:15,emoji:'🧦',store:'Amazon',link:'https://www.amazon.fr/s?k=chaussettes+bebe+lot'},
  ]},
  { id:'jeux', name:'Jeux & Éveil', icon:'🎨', items:[
    {id:'hochets',name:'Set hochets & doudous',desc:'Lot de hochets sonores et doudous doux.',price:35,emoji:'🪀',store:'Sophie la Girafe',link:'https://www.sophielagirafe.fr/'},
    {id:'livres-tissu',name:'Livres en tissu',desc:'Livre sensoriel avec pages crinkle.',price:20,emoji:'📚',store:'Lamaze',link:'https://www.lamaze.com/'},
    {id:'mobile',name:'Mobile de lit musical',desc:'Mobile musical avec personnages doux.',price:45,emoji:'🎠',store:'Tiny Love',link:'https://www.tinylove.com/'},
    {id:'jouets-bois',name:'Set jouets en bois',desc:'Anneaux de dentition et hochets naturels.',price:30,emoji:'🪵',store:'Janod',link:'https://www.janod.com/'},
  ]},
  { id:'chambre', name:'Chambre & Déco', icon:'🏠', items:[
    {id:'commode',name:'Commode avec tiroirs',desc:'Meuble de rangement solide.',price:199,emoji:'🗄️',store:'IKEA',link:'https://www.ikea.com/fr/fr/cat/commodes-20694/'},
    {id:'veilleuse-led',name:'Veilleuse LED rechargeable',desc:'Projecteur ciel étoilé, rechargeable USB.',price:25,emoji:'🌟',store:'Amazon',link:'https://www.amazon.fr/s?k=veilleuse+led+etoile'},
    {id:'parure-lit',name:'Parure de lit 60x120',desc:'Housse de couette + drap housse coton bio.',price:55,emoji:'🛏️',store:'Vertbaudet',link:'https://www.vertbaudet.fr/Fr/parure-lit-bebe.htm'},
    {id:'tapis-puzzle',name:'Tapis en mousse puzzle',desc:"Tapis d'éveil doux et épais, 12 pièces.",price:30,emoji:'🧩',store:'Amazon',link:'https://www.amazon.fr/s?k=tapis+mousse+puzzle+bebe'},
  ]},
]};

let currentCategory = 'all';
let reservations = {};
let GUESTBOOK = JSON.parse(localStorage.getItem('ln_guestbook') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  loadReservations();
  renderCountdown();
  renderFilterTabs();
  renderGiftList();
  setupGuestbook();
  setupModal();
  document.querySelector('.hero-scroll')?.addEventListener('click', () =>
    document.getElementById('message').scrollIntoView({ behavior: 'smooth' }));
  setupGSAP();
  setInterval(loadReservations, CONFIG.POLL_INTERVAL);
});

function setupGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-content > *', { y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' });
  gsap.from('.hero-float', { y: -80, opacity: 0, duration: 1.5, stagger: 0.3, ease: 'power2.out', delay: 0.4 });
  gsap.from('.message-card', { scrollTrigger: { trigger: '.message', start: 'top 80%' }, y: 50, opacity: 0, duration: 0.8 });
  gsap.from('.guestbook-form', { scrollTrigger: { trigger: '.guestbook', start: 'top 80%' }, y: 30, opacity: 0, duration: 0.8 });
  gsap.from('.countdown-item', { scrollTrigger: { trigger: '.countdown-section', start: 'top 80%' }, scale: 0.5, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' });
}

function renderCountdown() {
  const due = new Date('2026-08-07T00:00:00');
  function tick() {
    const d = due - new Date();
    if (d <= 0) return;
    document.getElementById('days').textContent = Math.floor(d / 86400000);
    document.getElementById('hours').textContent = Math.floor((d % 86400000) / 3600000);
    document.getElementById('minutes').textContent = Math.floor((d % 3600000) / 60000);
    document.getElementById('seconds').textContent = Math.floor((d % 60000) / 1000);
  }
  tick(); setInterval(tick, 1000);
}

function renderFilterTabs() {
  const tabs = document.getElementById('filter-tabs');
  GIFT_DATA.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-tab'; btn.dataset.category = cat.id;
    btn.textContent = cat.icon + ' ' + cat.name; tabs.appendChild(btn);
  });
  tabs.addEventListener('click', e => {
    if (!e.target.classList.contains('filter-tab')) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderGiftList();
  });
}

function renderGiftList() {
  const grid = document.getElementById('gifts-grid');
  let items = currentCategory === 'all'
    ? GIFT_DATA.categories.flatMap(c => c.items)
    : (GIFT_DATA.categories.find(c => c.id === currentCategory)?.items || []);
  grid.innerHTML = items.map(renderCard).join('');
  updateProgress();
  if (typeof gsap !== 'undefined') {
    gsap.utils.toArray('.gift-card').forEach((card, i) =>
      gsap.from(card, { y: 30, opacity: 0, duration: 0.5, delay: i * 0.04, ease: 'power3.out' }));
  }
}

function renderCard(item) {
  const res = reservations[item.id];
  return `<div class="gift-card${res ? ' reserved' : ''}" data-id="${item.id}">
    <div class="gift-image"><div class="gift-emoji">${item.emoji}</div></div>
    <div class="gift-info">
      <h3 class="gift-name">${item.name}</h3>
      <p class="gift-desc">${item.desc}</p>
      <div class="gift-meta">
        <span class="gift-price">${item.price}€</span>
        <a class="gift-store" href="${item.link}" target="_blank" rel="noopener">${item.store} ↗</a>
      </div>
      ${res ? `<p class="gift-reserved-by">✅ Réservé par ${esc(res.name)}</p>` : ''}
    </div>
    <button class="${res ? 'btn-reserved' : 'btn-primary'}" ${res ? 'disabled' : ''} onclick="openModal('${item.id}')">
      ${res ? 'Réservé' : 'Réserver 🎁'}
    </button>
  </div>`;
}

function findItem(id) {
  for (const c of GIFT_DATA.categories) { const i = c.items.find(x => x.id === id); if (i) return i; }
}

async function loadReservations() {
  try {
    const r = await fetch(CONFIG.API_URL);
    if (r.ok) { reservations = (await r.json()).reservations || {}; renderGiftList(); }
  } catch {
    const s = localStorage.getItem('ln_reservations');
    if (s) { reservations = JSON.parse(s); renderGiftList(); }
  }
}

async function reserveItem(itemId, name, message) {
  const item = findItem(itemId); if (!item) return false;
  const payload = { itemId, name, message, price: item.price, itemName: item.name, timestamp: Date.now() };
  try {
    const r = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) { reservations[itemId] = payload; localStorage.setItem('ln_reservations', JSON.stringify(reservations)); renderGiftList(); return true; }
  } catch {}
  reservations[itemId] = payload;
  localStorage.setItem('ln_reservations', JSON.stringify(reservations));
  renderGiftList(); return true;
}

function updateProgress() {
  const total = Object.values(reservations).reduce((s, r) => s + (r.price || 0), 0);
  document.getElementById('progress-fill').style.width = Math.min((total / 2000) * 100, 100) + '%';
  document.getElementById('progress-text').textContent = total + '€ collectés';
}

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('success-close').onclick = closeModal;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('reservation-form').addEventListener('submit', async e => {
    e.preventDefault();
    const itemId = e.target.dataset.itemId;
    if (await reserveItem(itemId, document.getElementById('reserver-name').value, document.getElementById('reserver-message').value)) {
      document.getElementById('reservation-modal').classList.remove('active');
      document.getElementById('success-modal').classList.add('active');
      setTimeout(closeModal, 3000);
    }
  });
}

function openModal(itemId) {
  if (reservations[itemId]) return;
  const item = findItem(itemId); if (!item) return;
  document.getElementById('modal-item-name').textContent = item.name;
  document.getElementById('reservation-form').dataset.itemId = itemId;
  document.getElementById('reservation-form').reset();
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('reservation-modal').classList.add('active');
  document.getElementById('success-modal').classList.remove('active');
}

function closeModal() {
  ['modal-overlay','reservation-modal','success-modal'].forEach(id => document.getElementById(id).classList.remove('active'));
}

function setupGuestbook() {
  document.getElementById('guestbook-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('guest-name').value.trim();
    const message = document.getElementById('guest-message').value.trim();
    if (!name || !message) return;
    GUESTBOOK.unshift({ id: Date.now(), name, message, date: new Date().toISOString() });
    localStorage.setItem('ln_guestbook', JSON.stringify(GUESTBOOK));
    renderGuestbook(); e.target.reset(); showToast('Message ajouté ! 💌');
  });
  renderGuestbook();
}

function renderGuestbook() {
  const el = document.getElementById('guestbook-messages');
  if (!GUESTBOOK.length) { el.innerHTML = '<p class="no-messages">Soyez le premier à laisser un message !</p>'; return; }
  el.innerHTML = GUESTBOOK.map(m => `<div class="guestbook-message">
    <div class="message-header"><span class="message-name">${esc(m.name)}</span><span class="message-date">${new Date(m.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</span></div>
    <p class="message-content">${esc(m.message)}</p>
  </div>`).join('');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.querySelector('.toast-message').textContent = msg;
  t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000);
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
