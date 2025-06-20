/*  ——  DATI episodio (solo due personaggi per la prova)  ——  */
const episode = {
  posts: [
    {
      id: "kia1",
      authorId: "kia",
      authorName: "🐾 Kia Rosellina🌹",
      avatar: "imgs/kia.png",           // metti un PNG/JPG qualsiasi
      relations: "Relazioni: 🫂🏠 Bellavìn  +  🫂💖🔐 Mia Manina  +  🫂💖 Solegirò Giragirò",
      traits:    "Carattere: 😊🌸🫣(😇/😤)",
      hobby:     "Hobby: (🐴💘💉) 🎀🌈 (😴)",
      job:       "Lavoro: (💐👩‍🌾📄)😕➡️ (✨💼💭🚀)",
      filastrocca: `Col pelo 💗 e gli occhi 🫧,
viveva tra sogni, biscotti e scarabocchi 🖍️.
Aveva una voce gentile e precisa,
una 🐱 che sapeva cos’è una cosa condivisa.
Con Mia giocava da sempre, 🎠 dopo 🎠,
ma un giorno disse: “Così non si fa,” e il gioco finì a metà.`
    },
    {
      id: "mia1",
      authorId: "mia",
      authorName: "🐇 Mia Manina✋",
      avatar: "imgs/mia.png",
      relations: "Relazioni: 🫂💖🔐 Mia Manina  +  🫂💖 Solegirò Giragirò",
      traits:    "Carattere: 👧💖➡️⚡😠🔥(😡🧍‍♀️/🧍‍♀️🙂)",
      hobby:     "Hobby: 💅✨💎 🛍️👗 | 🚬🍷",
      job:       "Lavoro: (🖇️🖥️🏢🌍) | 💼➡️(💍💰)",
      filastrocca: `Con le zampe a forma di ✋ e i pensieri a matassa,
non capiva perché Kia avesse quella faccia.
Aveva solo detto qualcosa a 🌞 Solegirò,
ma poi la stanza si fece silenzio e gelo ❄️.
Da allora guardò Kia con occhi diversi 🪞,
come si guarda un abbraccio che non torna più versi.`
    }
  ]
};

/*  ——  RENDER ——  */
const container    = document.getElementById("posts");
const filterSelect = document.getElementById("authorFilter");

// costruisce un <article> per ogni post
function postCard(p) {
  const article = document.createElement("article");
  article.className     = "post";
  article.dataset.author = p.authorId;
  article.innerHTML = `
    <img class="avatar" src="${p.avatar}" alt="">
    <div class="content">
      <h2 class="author">${p.authorName}</h2>
      <p class="relations">${p.relations}</p>
      <p class="traits">${p.traits}</p>
      <p class="hobby">${p.hobby}</p>
      <p class="job">${p.job}</p>
      <p class="rhymes">${p.filastrocca}</p>
    </div>
  `;
  return article;
}

// ri-disegna i post in base al filtro
function render() {
  const chosen = filterSelect.value;           // "all" oppure id autore
  container.innerHTML = "";
  episode.posts
    .filter(p => chosen === "all" || p.authorId === chosen)
    .forEach(p => container.appendChild(postCard(p)));
}

/*  ——  POPOLA la tendina personaggi ——  */
const authors = [...new Set(episode.posts.map(p => ({
  id: p.authorId, name: p.authorName
})))];

authors.forEach(a => {
  const opt = document.createElement("option");
  opt.value = a.id;
  opt.textContent = a.name;
  filterSelect.appendChild(opt);
});

filterSelect.addEventListener("change", render);
render();   // primo draw
