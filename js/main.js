/* -------------- utility ------------------------------------ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* simbolo per episodio -------------------------------------- */
const EP_ICON = {
  1: "★", 2: "✶", 3: "✺", 4: "❒", 5: "⬟",
  6: "✧", 7: "⬢", 8: "✹", 9: "◆", 10: "✿",
  11: "⬣", 12: "✪", 13: "✤", 14: "✦", 15: "❖"
};


/* -------------- fetch + render ------------------------------ */
const FEED = document.getElementById('feed');
const MENU = document.getElementById('charMenu');
const TOGGLE = document.getElementById('toggleMenu');

fetch('data/characters_posts.json')
  .then(r => r.json())
  .then(init)
  .catch(err => FEED.textContent = 'Errore nel caricamento dati 😢');

function init(data) {
  const { characters, posts } = data;

  /* menu ---------------------------------------------------------------- */
  const uniqueChars = Object.keys(characters);
  buildMenu(uniqueChars);

  /* ordine casuale ------------------------------------------------------ */
  shuffle(posts);

  /* render -------------------------------------------------------------- */
  posts.forEach((p, idx) => FEED.appendChild(postNode(p, characters, idx)));

  /* eventi -------------------------------------------------------------- */
  MENU.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    const char = e.target.dataset.char;
    filterByChar(char);
    MENU.classList.add('hidden');
  });

  FEED.addEventListener('click', e => {
    const link = e.target.closest('a.rel-link');
    if (!link) return;
    e.preventDefault();
    const char = link.dataset.char;
    filterByChar(char);
    document.getElementById(`char-${char}-0`)?.scrollIntoView({ behavior: 'smooth' });
  });

  TOGGLE.addEventListener('click', () => MENU.classList.toggle('hidden'));
}

/* -------------- components ---------------------------------- */
function buildMenu(chars) {
  MENU.innerHTML = `<button data-char=\"all\">Tutti i personaggi</button>` +
    chars.map(c => `<button data-char=\"${c}\">${c}</button>`).join('');
}

function filterByChar(char) {
  document.querySelectorAll('.post').forEach(p => {
    p.style.display = (char === 'all' || p.dataset.char === char) ? 'grid' : 'none';
  });
}
/* -------- POST NODE ---------------------- */
function postNode(p, characters, idxSameChar) {
  const c = characters[p.authors[0]] || {};
  const avatar = c.image || "";
  const bio = c.bio || {};
  const icon = EP_ICON[p.episode] || "●";

const relHTML = (p.relations || []).map(obj => {
  const ico = obj.icon ? `${obj.icon} ` : "";
  return `<a href="#char-${obj.char}-0"
             class="rel-link"
             data-char="${obj.char}"
             title="${obj.char}">` +
             /*** ▼▼  QUI MOSTRO ICONA + NOME  ▼▼ ***/
             `${ico}${obj.char}` +
             /*** ▲▲                               ▲▲ ***/
         `</a>`;
}).join("");


  const tpl = document.createElement("article");
  tpl.className = "post";
  tpl.dataset.char = p.authors[0];
  tpl.id = `char-${p.authors[0]}-${idxSameChar}`;

  tpl.innerHTML = `
    <!-- header con icona episodio + nome -->
    <div class="header-bar">${icon} ${p.authors[0]}</div>

    <!-- foto (sovrapposta) + bio -->
    <div class="content-row">
      <img class="avatar" src="${p.image || avatar}" alt="${p.authors[0]}">
      <div class="bio-box">
        <b>Carattere</b> ${bio.carattere || ""}
        <b>Hobby</b> ${bio.hobby || ""}
        <b>Lavoro</b> ${bio.lavoro || ""}
      </div>
    </div>

    <!-- relazioni a sinistra, storia a destra -->
    <div class="bottom-row">
      ${relHTML ? `
        <div class="relations">
          <span class="rel-tag">Relazioni</span>
          <div class="rel-links">${relHTML}</div>
        </div>` : ""
    }
      <p class="story">${p.story}</p>
    </div>
  `;
  return tpl;
}


