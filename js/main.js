/* -------------- utility ------------------------------------ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function clean(str) {
  return str.replace(/\u200B/g, '').trim();
}
function slug(str) {
  return str
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
    .trim()
    .toLowerCase();
}

/* -------------- episode icons -------------------------------- */
const EP_ICON = {
  1: "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ", 2: "*•.¸♡ 𝐥𝐨𝐯𝐞 𝐮 𝐝𝐞𝐚𝐫 ♡¸.•* ", 3: "(っ◔◡◔)っ 🍔", 4: "☆.。.:・°☆.。.:・°", 5: "(_　_|||)",
  6: "(ﾉ>ω<)ﾉ :｡･:*:･ﾟ’★", 7: "ᕙ(⇀‸↼‵‵)ᕗ", 8: "(◞ ‸ ◟ㆀ)", 9: "/ᐠ. ｡.ᐟ\\ᵐᵉᵒʷˎˊ˗", 10: "(ᗒᗣᗕ)՞",
  11: "╥﹏╥", 12: "ʕ•̫͡•ʕ•̫͡•ʔ•̫͡•ʔ•̫͡•ʕ•̫͡•", 13: "(⸝⸝⸝>﹏<⸝⸝⸝)", 14: ":｡･:*:･ﾟ’★,｡･:*:･ﾟ’", 15: "˚₊‧꒰ა ₍ᐢ.  ̫.ᐢ₎ ໒꒱ ‧₊˚"
};

/* -------------- image‐rows definitions ----------------------- */
const IMAGE_ROWS = [
  { episode: 1, images: ["imgs/row1_img1.png", "imgs/row1_img2.gif", "imgs/row1_img3.png", "imgs/row1_img4.png"] },
  { episode: 2, images: ["imgs/1.gif", "imgs/2.gif", "imgs/3.gif", "imgs/4.gif"] },
  { episode: 3, images: ["imgs/row3_img1.gif", "imgs/row3_img2.png", "imgs/row3_img3.png", "imgs/row3_img4.png"] },
  { episode: 4, images: ["imgs/row4_img1.png", "imgs/row4_img2.png", "imgs/row4_img3.png", "imgs/row4_img4.png"] },
  { episode: 5, images: ["imgs/row5_img1.png", "imgs/row5_img2.png", "imgs/row5_img3.png", "imgs/row5_img4.gif"] },
  { episode: 6, images: ["imgs/row6_img1.png", "imgs/row6_img2.png", "imgs/row6_img3.gif", "imgs/row6_img4.png"] },
  { episode: 7, images: ["imgs/5.gif", "imgs/6.gif", "imgs/7.gif", "imgs/8.gif"] },
  { episode: 8, images: ["imgs/9.gif", "imgs/10.gif", "imgs/12.gif", "imgs/13.gif"] },
  { episode: 9, images: ["imgs/14.gif", "imgs/15.gif", "imgs/16.gif", "imgs/17.gif"] },
  { episode: 10, images: ["imgs/18.gif", "imgs/19.gif", "imgs/20.gif", "imgs/21.gif"] },
  { episode: 11, images: ["imgs/22.gif", "imgs/23.gif", "imgs/24.gif", "imgs/25.gif"] },
];


/* -------------- DOM elems ----------------------------------- */
const FEED = document.getElementById('feed');
const MENU = document.getElementById('charMenu');
const TOGGLE = document.getElementById('toggleMenu');

/* -------------- fetch + render ------------------------------ */
fetch('data/characters_posts.json')
  .then(r => r.json())
  .then(raw => {
    const characters = {};
    Object.entries(raw.characters).forEach(([k, v]) => {
      characters[clean(k)] = v;
    });
    const posts = raw.posts.map(p => ({
      ...p,
      authors: p.authors.map(clean),
      relations: (p.relations || []).map(r => ({
        char: clean(r.char),
        icon: r.icon
      }))
    }));
    init({ characters, posts });
  })
  .catch(err => {
    console.error(err);
    FEED.textContent = 'Errore nel caricamento dati 😢';
  });

function init({ characters, posts }) {
  // ——— POPUP SETUP ———
  const overlay = document.getElementById('popupOverlay');
  const popupText = document.getElementById('popupText');
  const closeBtn = document.getElementById('popupClose');

  function showPopup(html) {
    if (!overlay || !popupText) return;
    popupText.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
  }

  // ——— BUILD FEED ———
  shuffle(posts);
  buildMenu(Object.keys(characters));
  const positions = selectNonAdjacentPositions(posts.length, IMAGE_ROWS.length);
  let rowIdx = 0;
  posts.forEach((p, i) => {
    FEED.appendChild(postNode(p, characters, i));
    if (positions.includes(i + 1) && rowIdx < IMAGE_ROWS.length) {
      FEED.appendChild(imageRowNode(IMAGE_ROWS[rowIdx]));
      rowIdx++;
    }
  });

  // ——— MENU FILTER ———
  MENU.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    filterByChar(e.target.dataset.char);
    MENU.classList.add('hidden');
  });

  // ——— FEED CLICKS ———
  FEED.addEventListener('click', e => {
    const link = e.target.closest('a.rel-link');
    if (link) {
      e.preventDefault();
      filterByChar(link.dataset.char);
      document.getElementById(`char-${link.dataset.char}-0`)
        ?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (e.target.matches('button.special-btn')) {
      showPopup(
        "<strong>Corte Marziale dice:</strong><br>" +
        "⚠️ Non c’è appello. Non c’è ritorno."
      );
    }
  });

  // ——— TOGGLE MENU ———
  TOGGLE.addEventListener('click', () => MENU.classList.toggle('hidden'));
}

function buildMenu(chars) {
  MENU.innerHTML = `<button data-char="all">Tutti i personaggi</button>`
    + chars.map(c => `<button data-char="${slug(c)}">${c}</button>`).join('');
}

function filterByChar(id) {
  document.querySelectorAll('.post, .image-row').forEach(el => {
    if (el.classList.contains('post')) {
      const authors = JSON.parse(el.dataset.chars || '[]').map(a => slug(a));
      el.style.display = (id === 'all' || authors.includes(id)) ? 'grid' : 'none';
    } else {
      el.style.display = id === 'all' ? 'flex' : 'none';
    }
  });
}

function selectNonAdjacentPositions(n, m) {
  const slots = Array.from({ length: n - 1 }, (_, i) => i + 1);
  shuffle(slots);
  const sel = [];
  for (let s of slots) {
    if (sel.length >= m) break;
    if (!sel.some(x => Math.abs(x - s) <= 1)) sel.push(s);
  }
  return sel.sort((a, b) => a - b);
}

function imageRowNode(row) {
  const w = document.createElement('div');
  w.className = `image-row episode-${row.episode}`;
  const c = document.createElement('span');
  c.className = 'ep-circle';
  c.textContent = EP_ICON[row.episode] || '●';
  w.appendChild(c);
  const ct = document.createElement('div'); ct.className = 'images-container';
  row.images.forEach(src => {
    const i = document.createElement('img');
    i.src = src;
    ct.appendChild(i);
  });
  w.appendChild(ct);
  return w;
}

function postNode(p, characters, idx) {
  const authors = p.authors;
  const icon = EP_ICON[p.episode] || "●";
  const relHTML = (p.relations || []).map(r => {
    const ico = r.icon ? `${r.icon} ` : "";
    const id = slug(r.char);
    return `<a href="#char-${id}-0" class="rel-link" data-char="${id}">${ico}${r.char}</a>`;
  }).join("");
  const isCorte = p.id === "ep12-corte";
  const btn = isCorte ? `<button class="special-btn">Condanna</button>` : "";

  const tpl = document.createElement("article");
  tpl.className = "post";
  tpl.dataset.chars = JSON.stringify(authors);
  tpl.id = `ep-${p.id}`;
  if (authors.length > 1) tpl.classList.add('collab-post');
  if (isCorte) tpl.classList.add('special-post');

  tpl.innerHTML = `
    <div class="header-bar">${icon} ${authors.join(" × ")}</div>
    <div class="content-row">
      <img class="avatar" src="${p.image || characters[authors[0]].image || ''}" alt="">
      <p class="story">${p.story}</p>
    </div>
    ${isCorte ? "" : `
      <div class="bottom-row">
        <div class="bio-box">
          <b>Carattere</b> ${characters[authors[0]].bio.carattere || ''}
          <b>Hobby</b>     ${characters[authors[0]].bio.hobby || ''}
          <b>Lavoro</b>    ${characters[authors[0]].bio.lavoro || ''}
        </div>
        <div class="relations">
          <span class="rel-tag">Relazioni</span>
          <div class="rel-links">${relHTML}</div>
        </div>
      </div>`}
    ${btn}
  `;
  return tpl;
}
