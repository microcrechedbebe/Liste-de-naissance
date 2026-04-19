/* ============================================================
   Liste de Naissance — Sofiane & Katia
   JS Principal — Data, Render, Reservation System
   ============================================================ */

// ─── Configuration ───
const CONFIG = {
  API_URL: '/api/reservations',
  USE_API: true, // Will auto-fallback to localStorage
  POLL_INTERVAL: 15000, // Poll every 15s for updates
};

// ─── Gift Data ───
const GIFT_DATA = {
  categories: [
    {
      id: 'sommeil',
      name: 'Sommeil',
      icon: '🌙',
      items: [
        {
          id: 'lit-evolutif',
          name: 'Lit évolutif 60x120',
          desc: 'Lit bébé convertible avec 3 hauteurs de sommier. Grand classique, solide et fonctionnel.',
          price: 149,
          emoji: '🛏️',
          store: 'IKEA',
          link: 'https://www.ikea.com/fr/fr/cat/lits-bebe-24823/',
          search: 'https://www.amazon.fr/s?k=lit+evolutif+bebe+60x120',
        },
        {
          id: 'matelas',
          name: 'Matelas ergonomique 60x120',
          desc: 'Matelas mousse à mémoire de forme, housse lavable et respirante.',
          price: 79,
          emoji: '🧽',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=matelas+bebe+60x120',
          search: 'https://www.amazon.fr/s?k=matelas+bebe+60x120+ergonomique',
        },
        {
          id: 'surmatelas',
          name: 'Surmatelas imperméable',
          desc: 'Protection matelas respirante, lavable en machine. Pack de 2.',
          price: 25,
          emoji: '🛡️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=surmatelas+impermeable+bebe+60x120',
          search: 'https://www.amazon.fr/s?k=surmatelas+impermeable+bebe',
        },
        {
          id: 'gigoteuse',
          name: 'Gigoteuse 2.5 TOG',
          desc: 'Gigoteuse en coton bio, adaptée aux températures de 18-20°C. Idéale toute l\'année.',
          price: 35,
          emoji: '🧸',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/gigoteuse-bebe.htm',
          search: 'https://www.amazon.fr/s?k=gigoteuse+2.5+TOG+bebe',
        },
        {
          id: 'bouillotte',
          name: 'Bouillotte bébé',
          desc: 'Bouillotte douce en laine mérinos pour réchauffer le berceau avant le coucher.',
          price: 20,
          emoji: '🔥',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=bouillotte+bebe+berceau',
          search: 'https://www.amazon.fr/s?k=bouillotte+bebe',
        },
        {
          id: 'musiques',
          name: 'Veilleuse / Doudou musical',
          desc: 'Veilleuse avec mélodies apaisantes et projection étoiles. Rechargeable USB.',
          price: 25,
          emoji: '✨',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=veilleuse+musicale+bebe+projection',
          search: 'https://www.amazon.fr/s?k=veilleuse+musicale+projection',
        },
        {
          id: 'thermometre-chambre',
          name: 'Thermomètre de chambre',
          desc: 'Thermomètre-hygromètre digital pour surveiller la température de la chambre (idéal: 18-20°C).',
          price: 12,
          emoji: '🌡️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=thermometre+chambre+bebe',
          search: 'https://www.amazon.fr/s?k=thermometre+hygrometre+chambre',
        },
      ],
    },
    {
      id: 'alimentation',
      name: 'Alimentation',
      icon: '🍼',
      items: [
        {
          id: 'biberons',
          name: 'Set de biberons anti-coliques',
          desc: 'Pack 3 biberons (150ml + 250ml) avec tétines débit lent/moyen. Système anti-colique intégré.',
          price: 30,
          emoji: '🍼',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=biberon+anti+colique+set',
          search: 'https://www.amazon.fr/s?k=biberon+anti+colique',
        },
        {
          id: 'sterilisateur',
          name: 'Stérilisateur vapeur électrique',
          desc: 'Stérilise jusqu\'à 6 biberons en 8 minutes. Compatible micro-ondes ou électrique.',
          price: 35,
          emoji: '♨️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=sterilisateur+biberon+electrique',
          search: 'https://www.amazon.fr/s?k=sterilisateur+biberon',
        },
        {
          id: 'chauffe-biberon',
          name: 'Chauffe-biberon',
          desc: 'Chauffe biberon et pot de compote rapidement. Maintien au chaud automatique.',
          price: 25,
          emoji: '🌡️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=chauffe+biberon+electrique',
          search: 'https://www.amazon.fr/s?k=chauffe+biberon',
        },
        {
          id: 'coussin-allaitement',
          name: 'Coussin d\'allaitement',
          desc: 'Coussin ergonomique en forme de C, housse lavable. Confort pour allaitement et biberon.',
          price: 30,
          emoji: '🤱',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/coussin-allaitement.htm',
          search: 'https://www.amazon.fr/s?k=coussin+allaitement+ergonomique',
        },
        {
          id: 'transat',
          name: 'Transat / Balance',
          desc: 'Transat vibreur avec 3 positions. Idéal pour poser bébé pendant les repas.',
          price: 60,
          emoji: '🪑',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=transat+bebe',
          search: 'https://www.amazon.fr/s?k=transat+bebe+vibreur',
        },
        {
          id: 'chaise-haute',
          name: 'Chaise haute évolutive',
          desc: 'Chaise haute en bois, évolutive de 6 mois à 10 ans. Plateau amovible et réglable.',
          price: 90,
          emoji: '🪑',
          store: 'IKEA',
          link: 'https://www.ikea.com/fr/fr/cat/chaises-hautes-bebe-24832/',
          search: 'https://www.amazon.fr/s?k=chaise+haute+evolutive+bois',
        },
        {
          id: 'mixeur',
          name: 'Mixeur / Babycook',
          desc: 'Cuiseur vapeur + mixeur 4-en-1 : cuit, mixe, décongèle, réchauffe. Indispensable pour la diversification.',
          price: 85,
          emoji: '🥣',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=babycook+mixeur+bebe',
          search: 'https://www.amazon.fr/s?k=babycook+4en1',
        },
      ],
    },
    {
      id: 'bain',
      name: 'Bain & Soins',
      icon: '🛁',
      items: [
        {
          id: 'baignoire',
          name: 'Baignoire ergonomique',
          desc: 'Baignoire avec support anatomique intégré, évier ou sur pied. Anti-dérapante.',
          price: 30,
          emoji: '🛁',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/baignoire-bebe.htm',
          search: 'https://www.amazon.fr/s?k=baignoire+bebe+ergonomique',
        },
        {
          id: 'textile-bain',
          name: 'Set de toilette bébé',
          desc: '2 serviettes à capuche + 2 gants de toilette en coton bio. Doux et absorbant.',
          price: 25,
          emoji: '🧺',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=serviette+capuche+bebe',
          search: 'https://www.amazon.fr/s?k=serviette+capuche+bebe+coton+bio',
        },
        {
          id: 'couches',
          name: 'Couches naissance (Lot)',
          desc: 'Lot de 100 couches taille 1 (3-5 kg). Hypoallergéniques, sans parfum.',
          price: 25,
          emoji: '👶',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=couches+naissance+taille+1',
          search: 'https://www.amazon.fr/s?k=couches+naissance+100',
        },
        {
          id: 'change',
          name: 'Tapis de change',
          desc: 'Tapis de change pliable avec rembourrage mousse. Housse lavable et imperméable.',
          price: 25,
          emoji: '🛏️',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=tapis+change+bebe',
          search: 'https://www.amazon.fr/s?k=tapis+change+pliable+bebe',
        },
        {
          id: 'cosmetiques',
          name: 'Set cosmétiques bio bébé',
          desc: 'Lait hydratant, liniment, eau nettoyante, crème change. Certifiés bio et hypoallergéniques.',
          price: 40,
          emoji: '🧴',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=set+cosmetiques+bio+bebe',
          search: 'https://www.amazon.fr/s?k=set+soins+bio+naissance',
        },
        {
          id: 'brosse',
          name: 'Brosse & peigne naissance',
          desc: 'Brosse en poils de cabaye ultra-doux + peigne. Pour le crâne fragile du nouveau-né.',
          price: 15,
          emoji: '💇',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=brosse+peigne+naissance+bebe',
          search: 'https://www.amazon.fr/s?k=brosse+naissance+bebe',
        },
      ],
    },
    {
      id: 'sorties',
      name: 'Sorties & Transport',
      icon: '🚗',
      items: [
        {
          id: 'poussette',
          name: 'Poussette compacte',
          desc: 'Poussette légère et pliable une main. Panier rangement XL, capuche XXL avec pare-soleil UV.',
          price: 250,
          emoji: '👶',
          store: 'Babyzen',
          link: 'https://www.babyzen.com/fr/poussettes',
          search: 'https://www.amazon.fr/s?k=poussette+compacte+legere+bebe',
        },
        {
          id: 'coque-auto',
          name: 'Coque auto 0-13kg (Groupe 0+)',
          desc: 'Siège auto homologué i-Size. Compatible base isofix. Système clic-clac rapide.',
          price: 180,
          emoji: '🚗',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=coque+auto+bebe+0+13kg+isize',
          search: 'https://www.amazon.fr/s?k=coque+auto+0+13kg',
        },
        {
          id: 'base-isofix',
          name: 'Base isofix',
          desc: 'Base de fixation isofix pour coque auto. Installation sécurisée en un clic.',
          price: 130,
          emoji: '🔒',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=base+isofix+coque+auto+bebe',
          search: 'https://www.amazon.fr/s?k=base+isofix+bebe',
        },
        {
          id: 'portage',
          name: 'Porte-bébé physiologique',
          desc: 'Porte-bébé ergonomique de la naissance à 15 kg. Position M physiologique. Dosseret réglable.',
          price: 100,
          emoji: '🤱',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=porte+bebe+physiologique+ergonomique',
          search: 'https://www.amazon.fr/s?k=porte+bebe+ergonomique',
        },
        {
          id: 'sac-couches',
          name: 'Sac à couches',
          desc: 'Sac à couches tendance avec tapis de change intégré. Nombreuses poches, porte-biberon.',
          price: 45,
          emoji: '👜',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=sac+couches+bebe',
          search: 'https://www.amazon.fr/s?k=sac+couches+bebe+tendance',
        },
        {
          id: 'rehausseur-auto',
          name: 'Rehausseur auto Groupe 1 (9-18 kg)',
          desc: 'Pour plus tard (à partir de ~9 mois). Avec harnais 5 points. Homologué.',
          price: 80,
          emoji: '🚗',
          store: 'Decathlon',
          link: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-puericulture-et-bebe/_/N-1kxo2vt',
          search: 'https://www.amazon.fr/s?k=rehausseur+auto+groupe+1+bebe',
        },
        {
          id: 'poncho-uv',
          name: 'Poncho anti-UV',
          desc: 'Poncho de plage anti-UV 50+ pour poussette. Léger et respirant. Pour les balades été.',
          price: 20,
          emoji: '☀️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=poncho+anti+uv+poussette+bebe',
          search: 'https://www.amazon.fr/s?k=poncho+uv+poussette',
        },
      ],
    },
    {
      id: 'vetements',
      name: 'Vêtements',
      icon: '👶',
      items: [
        {
          id: 'grenouillere',
          name: 'Grenouillère naissance (Lot x3)',
          desc: '3 grenouillères en coton bio, pieds intégrés. Faciles à enfiler, pressions sur tout le devant.',
          price: 35,
          emoji: '👶',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/grenouillere-bebe.htm',
          search: 'https://www.amazon.fr/s?k=grenouillere+naissance+coton+bio',
        },
        {
          id: 'bodies',
          name: 'Bodies naissance (Lot x5)',
          desc: '5 bodies manches longues en coton bio. Encolure extensible pour passer sur la tête.',
          price: 25,
          emoji: '👕',
          store: 'Kiabi',
          link: 'https://www.kiabi.fr/vetements-bebe-body',
          search: 'https://www.amazon.fr/s?k=bodies+naissance+coton+bio+lot',
        },
        {
          id: 'pyjamas',
          name: 'Pyjamas (Lot x2)',
          desc: '2 pyjamas en coton doux, pieds intégrés. Fermeture à pressions toute la longueur.',
          price: 30,
          emoji: '🌙',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/pyjama-bebe.htm',
          search: 'https://www.amazon.fr/s?k=pyjama+bebe+naissance+pieds',
        },
        {
          id: 'bonnets',
          name: 'Bonnets naissance (Lot x3)',
          desc: '3 bonnets en coton bio, élastiques doux. Indispensables pour la sortie de maternité.',
          price: 15,
          emoji: '🧢',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=bonnet+naissance+bebe+coton+bio',
          search: 'https://www.amazon.fr/s?k=bonnet+naissance+bebe',
        },
        {
          id: 'chaussettes',
          name: 'Chaussettes (Lot x6)',
          desc: '6 paires de chaussettes en coton. Tissu extérieur doux, sans élastique serré.',
          price: 12,
          emoji: '🧦',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=chaussettes+bebe+naissance+coton',
          search: 'https://www.amazon.fr/s?k=chaussettes+naissance+lot',
        },
        {
          id: 'combinaison',
          name: 'Combinaison d\'hiver',
          desc: 'Combinaison chaude et imperméable. Pour les promenades hivernales.',
          price: 45,
          emoji: '🧥',
          store: 'Vertbaudet',
          link: 'https://www.vertbaudet.fr/Fr/combinaison-bebe.htm',
          search: 'https://www.amazon.fr/s?k=combinaison+hiver+bebe',
        },
      ],
    },
    {
      id: 'jeux',
      name: 'Jeux & Éveil',
      icon: '🎨',
      items: [
        {
          id: 'tapis-eveil',
          name: 'Tapis d\'éveil',
          desc: 'Tapis en mousse épaisse avec arches et jouets suspendus. Stimule la vue, le toucher et la motricité.',
          price: 50,
          emoji: '🎯',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=tapis+eveil+bebe',
          search: 'https://www.amazon.fr/s?k=tapis+eveil+bebe+mousse',
        },
        {
          id: 'hochets',
          name: 'Set hochets & doudous',
          desc: 'Kit de 3 hochets en bois/silicone + 1 doudou lapin. Sûrs pour la bouche (dentition).',
          price: 25,
          emoji: '🐰',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=set+hochets+bois+silicone+bebe',
          search: 'https://www.amazon.fr/s?k=hochet+bois+bebe',
        },
        {
          id: 'livres',
          name: 'Livres en tissu',
          desc: 'Lot de 2 livres en tissu sensoriels avec textures, miroirs et bruits. Premiers livres.',
          price: 20,
          emoji: '📚',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=livre+tissu+sensoriel+bebe',
          search: 'https://www.amazon.fr/s?k=livre+tissu+eveil+bebe',
        },
        {
          id: 'mobile',
          name: 'Mobile de lit',
          desc: 'Mobile musical avec 5 peluches. Mélodies douces, rotation automatique. Stimule la vue.',
          price: 35,
          emoji: '🎵',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=mobile+lith+musical+bebe',
          search: 'https://www.amazon.fr/s?k=mobile+lith+musical',
        },
        {
          id: 'jouets-bois',
          name: 'Set jouets en bois',
          desc: 'Anneaux d\'empilement + cubes en bois colorés. Matériaux naturels, peinture non-toxique.',
          price: 30,
          emoji: '🪵',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=jouets+bois+eveil+bebe',
          search: 'https://www.amazon.fr/s?k=jouets+bois+naissance',
        },
      ],
    },
    {
      id: 'chambre',
      name: 'Chambre & Déco',
      icon: '🏠',
      items: [
        {
          id: 'galerie',
          name: 'Galerie / Commode',
          desc: 'Meuble de rangement avec étagères et tiroirs. Idéal pour vêtements, couches et accessoires.',
          price: 120,
          emoji: '🗄️',
          store: 'IKEA',
          link: 'https://www.ikea.com/fr/fr/cat/commodes-20637/',
          search: 'https://www.amazon.fr/s?k=commode+rangement+chambre+bebe',
        },
        {
          id: 'veilleuse-nuit',
          name: 'Veilleuse LED',
          desc: 'Veilleuse douce LED avec détection de cris. Lumière chaude, intensité réglable.',
          price: 18,
          emoji: '💡',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=veilleuse+led+bebe+detection+cris',
          search: 'https://www.amazon.fr/s?k=veilleuse+led+chambre+bebe',
        },
        {
          id: 'draps',
          name: 'Parure de lit 60x120',
          desc: 'Housse de couette + drap housse + taie en coton percale. Motif étoiles.',
          price: 35,
          emoji: '⭐',
          store: 'La Redoute',
          link: 'https://www.laredoute.fr/clk?destination=parure+lit+bebe+60x120',
          search: 'https://www.amazon.fr/s?k=parure+lit+bebe+60x120+coton',
        },
        {
          id: 'deco-murale',
          name: 'Déco murale chambre',
          desc: 'Set de stickers muraux ou cadre personnalisé. Thème étoiles, nuages ou montagnes.',
          price: 25,
          emoji: '🖼️',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=decoration+chambre+bebe+garcon+murale',
          search: 'https://www.amazon.fr/s?k=sticker+chambre+bebe',
        },
        {
          id: 'parquet-mousse',
          name: 'Tapis en mousse puzzle',
          desc: 'Tapis de sol en mousse épaisse (2cm), motifs géométriques. Isolant et doux.',
          price: 25,
          emoji: '🧩',
          store: 'Amazon',
          link: 'https://www.amazon.fr/s?k=tapis+mousse+puzzle+chambre+bebe',
          search: 'https://www.amazon.fr/s?k=tapis+mousse+puzzle+bebe',
        },
      ],
    },
  ],
};

// ─── State ───
let state = {
  activeFilter: 'all',
  reservations: {},
  guestName: localStorage.getItem('ln_guest_name') || '',
  apiAvailable: true,
};

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Load reservations
  loadReservations();

  // Render everything
  renderCountdown();
  renderFilterTabs();
  renderGiftList();
  updateProgress();

  // Event listeners
  setupScrollEffects();
  setupIntersectionObserver();

  // Poll for updates from other guests
  if (CONFIG.USE_API) {
    setInterval(loadReservations, CONFIG.POLL_INTERVAL);
  }
}

// ─── Countdown ───
function renderCountdown() {
  const dueDate = new Date('2026-08-07T00:00:00');
  const container = document.getElementById('countdown');

  function update() {
    const now = new Date();
    const diff = dueDate - now;

    if (diff <= 0) {
      container.innerHTML = '<div class="countdown-item"><span class="number">🎉</span><span class="label">C\'est arrivé !</span></div>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    container.innerHTML = `
      <div class="countdown-item"><span class="number">${days}</span><span class="label">Jours</span></div>
      <div class="countdown-item"><span class="number">${hours}</span><span class="label">Heures</span></div>
      <div class="countdown-item"><span class="number">${minutes}</span><span class="label">Minutes</span></div>
    `;
  }

  update();
  setInterval(update, 60000);
}

// ─── Filter Tabs ───
function renderFilterTabs() {
  const container = document.getElementById('filter-tabs');
  const allCount = getTotalItems();

  let html = `<button class="filter-tab active" data-filter="all">Tous <span class="count">${allCount}</span></button>`;

  GIFT_DATA.categories.forEach(cat => {
    html += `<button class="filter-tab" data-filter="${cat.id}">${cat.icon} ${cat.name} <span class="count">${cat.items.length}</span></button>`;
  });

  container.innerHTML = html;

  // Click handlers
  container.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeFilter = tab.dataset.filter;
      renderGiftList();
    });
  });
}

function getTotalItems() {
  return GIFT_DATA.categories.reduce((sum, cat) => sum + cat.items.length, 0);
}

// ─── Gift List Rendering ───
function renderGiftList() {
  const container = document.getElementById('gift-list');
  const categories = state.activeFilter === 'all'
    ? GIFT_DATA.categories
    : GIFT_DATA.categories.filter(c => c.id === state.activeFilter);

  let html = '';

  categories.forEach(cat => {
    const reservedCount = cat.items.filter(item => state.reservations[item.id]).length;
    html += `
      <div class="category-group fade-in" data-category="${cat.id}">
        <div class="category-header">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${reservedCount}/${cat.items.length} réservés</span>
        </div>
        <div class="gifts-grid">
          ${cat.items.map(item => renderGiftCard(item)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Trigger fade-in
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  });

  // Attach reserve handlers
  container.querySelectorAll('.btn-reserve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.currentTarget.dataset.itemId;
      openReservationModal(itemId);
    });
  });

  // Attach unreserve handlers
  container.querySelectorAll('.btn-unreserve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.currentTarget.dataset.itemId;
      unreserveItem(itemId);
    });
  });
}

function renderGiftCard(item) {
  const isReserved = !!state.reservations[item.id];
  const reservedBy = isReserved ? state.reservations[item.id].name : '';

  const reserveBtn = isReserved
    ? (state.guestName && reservedBy.toLowerCase() === state.guestName.toLowerCase()
      ? `<button class="btn-unreserve" data-item-id="${item.id}" title="Annuler ma réservation">✕ Annuler</button>`
      : `<button class="btn-reserve reserved-btn" disabled>✓ Réservé</button>`)
    : `<button class="btn-reserve" data-item-id="${item.id}">🎁 Je prends !</button>`;

  const reservedInfo = isReserved
    ? `<div class="reserved-info">Réservé par <strong>${escapeHtml(reservedBy)}</strong></div>`
    : '';

  return `
    <div class="gift-card ${isReserved ? 'reserved' : ''}" data-item-id="${item.id}">
      <div class="gift-image">
        <span class="emoji">${item.emoji}</span>
      </div>
      <div class="gift-body">
        <div class="gift-name">${item.name}</div>
        <div class="gift-desc">${item.desc}</div>
        <div class="gift-meta">
          <span class="gift-price">${item.price} €</span>
          <span class="gift-store">${item.store}</span>
        </div>
        <div class="gift-actions">
          <a href="${item.search}" target="_blank" rel="noopener" class="gift-link">🔍 Voir</a>
          ${reserveBtn}
        </div>
        ${reservedInfo}
      </div>
    </div>
  `;
}

// ─── Reservation System ───
async function loadReservations() {
  if (!CONFIG.USE_API || !state.apiAvailable) {
    // Fallback to localStorage
    const stored = localStorage.getItem('ln_reservations');
    if (stored) {
      state.reservations = JSON.parse(stored);
    }
    renderGiftList();
    updateProgress();
    return;
  }

  try {
    const res = await fetch(CONFIG.API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.reservations = data.reservations || {};
    state.apiAvailable = true;
  } catch (err) {
    console.warn('API unavailable, falling back to localStorage:', err.message);
    state.apiAvailable = false;
    const stored = localStorage.getItem('ln_reservations');
    if (stored) state.reservations = JSON.parse(stored);
  }

  renderGiftList();
  updateProgress();
}

async function reserveItem(itemId, guestName) {
  if (CONFIG.USE_API && state.apiAvailable) {
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, guestName }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          showToast(`Déjà réservé par ${data.reservedBy} !`, 'error');
        } else {
          showToast(data.error || 'Erreur', 'error');
        }
        return false;
      }

      state.reservations = data.reservations;
    } catch (err) {
      console.warn('API error, using localStorage:', err.message);
      state.apiAvailable = false;
      state.reservations[itemId] = { name: guestName, at: new Date().toISOString() };
      localStorage.setItem('ln_reservations', JSON.stringify(state.reservations));
    }
  } else {
    state.reservations[itemId] = { name: guestName, at: new Date().toISOString() };
    localStorage.setItem('ln_reservations', JSON.stringify(state.reservations));
  }

  // Save guest name
  state.guestName = guestName;
  localStorage.setItem('ln_guest_name', guestName);

  renderGiftList();
  updateProgress();
  showToast(`${getItemName(itemId)} réservé par ${guestName} !`, 'success');
  return true;
}

async function unreserveItem(itemId) {
  const reservation = state.reservations[itemId];
  if (!reservation) return;

  if (CONFIG.USE_API && state.apiAvailable) {
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, guestName: state.guestName }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Erreur', 'error');
        return;
      }

      const data = await res.json();
      state.reservations = data.reservations;
    } catch (err) {
      delete state.reservations[itemId];
      localStorage.setItem('ln_reservations', JSON.stringify(state.reservations));
    }
  } else {
    delete state.reservations[itemId];
    localStorage.setItem('ln_reservations', JSON.stringify(state.reservations));
  }

  renderGiftList();
  updateProgress();
  showToast('Réservation annulée', 'success');
}

function getItemName(itemId) {
  for (const cat of GIFT_DATA.categories) {
    const item = cat.items.find(i => i.id === itemId);
    if (item) return item.name;
  }
  return itemId;
}

// ─── Modal ───
function openReservationModal(itemId) {
  const modal = document.getElementById('modal-overlay');
  const itemName = getItemName(itemId);
  const input = document.getElementById('guest-name-input');
  const confirmBtn = document.getElementById('confirm-reserve');

  document.getElementById('modal-item-name').textContent = itemName;
  input.value = state.guestName;
  modal.classList.add('active');

  // Focus
  setTimeout(() => input.focus(), 300);

  // Confirm handler
  const handler = async () => {
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = 'var(--rose)';
      return;
    }
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Réservation...';
    await reserveItem(itemId, name);
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirmer';
    closeModal();
  };

  confirmBtn.onclick = handler;
  input.onkeydown = (e) => { if (e.key === 'Enter') handler(); };
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ─── Progress ───
function updateProgress() {
  const total = getTotalItems();
  const reserved = Object.keys(state.reservations).length;
  const pct = total > 0 ? Math.round((reserved / total) * 100) : 0;

  document.querySelector('.progress-bar-fill').style.width = `${pct}%`;
  document.getElementById('progress-text').textContent = `${reserved} / ${total} réservés (${pct}%)`;
}

// ─── Scroll Effects ───
function setupScrollEffects() {
  const filterSection = document.querySelector('.filter-section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      filterSection.classList.add('scrolled');
    } else {
      filterSection.classList.remove('scrolled');
    }
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ─── Toast ───
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Helpers ───
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
