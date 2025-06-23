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
  1: "★", 2: "✶", 3: "✺", 4: "❒", 5: "⬟",
  6: "✧", 7: "⬢", 8: "✹", 9: "◆", 10: "✿",
  11: "⬣", 12: "✪", 13: "✤", 14: "✦", 15: "❖"
};

/* -------------- image‐rows definitions ----------------------- */
const IMAGE_ROWS = [
  { episode: 1, images: ["imgs/row1_img1.png", "imgs/row1_img2.gif", "imgs/row1_img3.png", "imgs/row1_img4.png"] },
  { episode: 2, images: ["imgs/row2_img1.gif", "imgs/row2_img2.gif", "imgs/row2_img3.gif", "imgs/row2_img4.gif"] },
  { episode: 3, images: ["imgs/row3_img1.gif", "imgs/row3_img2.png", "imgs/row3_img3.png", "imgs/row3_img4.png"] },
  { episode: 4, images: ["imgs/row4_img1.png", "imgs/row4_img2.png", "imgs/row4_img3.png", "imgs/row4_img4.png"] },
  { episode: 5, images: ["imgs/row5_img1.png", "imgs/row5_img2.png", "imgs/row5_img3.png", "imgs/row5_img4.gif"] },
  { episode: 6, images: ["imgs/row6_img1.png", "imgs/row6_img2.png", "imgs/row6_img3.gif", "imgs/row6_img4.png"] },
  { episode: 6, images: ["imgs/row7_img1.png", "imgs/row7_img2.png", "imgs/row7_img3.gif", "imgs/row7_img4.png"] }
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

  MENU.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    filterByChar(e.target.dataset.char);
    MENU.classList.add('hidden');
  });

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
      alert("Azione speciale di Corte Marziale!");
    }
  });

  TOGGLE.addEventListener('click', () => MENU.classList.toggle('hidden'));
}

function buildMenu(chars) {
  MENU.innerHTML = `<button data-char="all">Tutti i personaggi</button>`
    + chars.map(c => {
      const id = slug(c);
      return `<button data-char="${id}">${c}</button>`;
    }).join('');
}

function filterByChar(id) {
  document.querySelectorAll('.post, .image-row').forEach(el => {
    if (el.classList.contains('post')) {
      const authors = JSON.parse(el.dataset.chars || '[]')
        .map(a => slug(a));
      el.style.display = (id === 'all' || authors.includes(id))
        ? 'grid' : 'none';
    } else {
      el.style.display = (id === 'all') ? 'flex' : 'none';
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
  const ct = document.createElement('div');
  ct.className = 'images-container';
  row.images.forEach(src => {
    const i = document.createElement('img');
    i.src = src;
    ct.appendChild(i);
  });
  w.appendChild(ct);
  return w;
}


function postNode(p, characters, idx) {
  const authors = p.authors.map(clean);
  const icon = EP_ICON[p.episode] || "●";
  const relHTML = (p.relations || []).map(r => {
    const ico = r.icon ? `${r.icon} ` : "";
    const id = slug(r.char);
    return `<a href="#char-${id}-0"
               class="rel-link"
               data-char="${id}">${ico}${r.char}</a>`;
  }).join("");

  const isCorte = p.id === "ep12-corte";
  const specialBtn = isCorte
    ? `<button class="special-btn">Uccidi</button>`
    : "";

  const tpl = document.createElement("article");
  tpl.className = "post";
  tpl.dataset.chars = JSON.stringify(authors);
  tpl.id = `ep-${p.id}`;
  if (authors.length > 1) tpl.classList.add('collab-post');
  if (isCorte) tpl.classList.add('special-post');

  tpl.innerHTML = `
    <div class="header-bar">${icon} ${authors.join(" × ")}</div>
    <div class="content-row">
      <img class="avatar"
           src="${p.image || characters[authors[0]].image || ''}"
           alt="">
      <p class="story">${p.story}</p>
    </div>
    ${isCorte ? "" :   /* se è Corte, salto tutta la bottom-row */
      `<div class="bottom-row">
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
    ${specialBtn}
  `;
  return tpl;
}
