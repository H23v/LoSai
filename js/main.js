/* -------------- utility ------------------------------------ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* simbolo per episodio -------------------------------------- */
const EP_ICON = {
  1: "★",  2: "✶",  3: "✺",  4: "❒",  5: "⬟",
  6: "✧",  7: "⬢",  8: "✹",  9: "◆", 10: "✿",
 11: "⬣", 12: "✪", 13: "✤", 14: "✦", 15: "❖"
};

/* -------------- fetch + render ------------------------------ */
const FEED   = document.getElementById('feed');
const MENU   = document.getElementById('charMenu');
const TOGGLE = document.getElementById('toggleMenu');

fetch('data/characters_posts.json')
  .then(r => r.json())
  .then(init)
  .catch(err => FEED.textContent = 'Errore nel caricamento dati 😢');

function init(data) {
  const { characters, posts } = data;

  // costruisci menu personaggi
  buildMenu(Object.keys(characters));

  // mescola ordine dei post
  shuffle(posts);

  // rendi i post
  posts.forEach((p, idx) => {
    FEED.appendChild(postNode(p, characters, idx));
  });

  // gestisci filtro da menu
  MENU.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    filterByChar(e.target.dataset.char);
    MENU.classList.add('hidden');
  });

  // click sui link relazioni
  FEED.addEventListener('click', e => {
    const link = e.target.closest('a.rel-link');
    if (!link) return;
    e.preventDefault();
    const char = link.dataset.char;
    filterByChar(char);
    document.getElementById(`char-${char}-0`)
            ?.scrollIntoView({ behavior: 'smooth' });
  });

  // toggle del menu via icona
  TOGGLE.addEventListener('click', () => {
    MENU.classList.toggle('hidden');
  });
}

/* -------------- componenti ausiliarie ----------------------- */
function buildMenu(chars) {
  MENU.innerHTML = `<button data-char="all">Tutti i personaggi</button>`
    + chars.map(c => `<button data-char="${c}">${c}</button>`).join('');
}

function filterByChar(char) {
  document.querySelectorAll('.post').forEach(p => {
    p.style.display = (char === 'all' || p.dataset.char === char)
                     ? 'grid' : 'none';
  });
}

/* -------------- POST NODE ---------------------------------- */
function postNode(p, characters, idxSameChar) {
  const mainChar = p.authors[0];
  const c        = characters[mainChar] || {};
  const avatar   = c.image || "";
  const bio      = c.bio   || {};
  const icon     = EP_ICON[p.episode] || "●";

  // genera HTML relazioni: icona + nome
  const relHTML = (p.relations || []).map(obj => {
    const ico = obj.icon ? `${obj.icon} ` : "";
    return `<a href="#char-${obj.char}-0"
               class="rel-link"
               data-char="${obj.char}"
               title="${obj.char}">${ico}${obj.char}</a>`;
  }).join("");

  // crea l'articolo
  const tpl = document.createElement("article");
  tpl.className    = "post";
  tpl.dataset.char = mainChar;
  tpl.id           = `char-${mainChar}-${idxSameChar}`;

  tpl.innerHTML = `
    <!-- header -->
    <div class="header-bar">${icon} ${mainChar}</div>

    <!-- riga 1: avatar + storia -->
    <div class="content-row">
      <img class="avatar" src="${p.image || avatar}" alt="${mainChar}">
      <p class="story">${p.story}</p>
    </div>

    <!-- riga 2: bio + relazioni -->
    <div class="bottom-row">
      <div class="bio-box">
        <b>Carattere</b> ${bio.carattere || ""}
        <b>Hobby</b> ${bio.hobby || ""}
        <b>Lavoro</b> ${bio.lavoro || ""}
      </div>
      <div class="relations">
        <span class="rel-tag">Relazioni</span>
        <div class="rel-links">${relHTML}</div>
      </div>
    </div>
  `;
  return tpl;
}
