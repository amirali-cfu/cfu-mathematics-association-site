const app = document.getElementById("app");
const tabsEl = document.getElementById("tabs");
document.getElementById("contact").href = LINKS.contact;

let timer = null;

const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const byId = id => ITEMS.find(i => i.id === id);
const catOf = id => CATEGORIES.find(c => c.id === id);

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(https?:\/\/[^\s<]+)/g, '<a class="l" target="_blank" rel="noopener" href="$1">$1</a>')
    .replace(/(^|\s)@([A-Za-z0-9_]+)/g, '$1<a class="l" target="_blank" rel="noopener" href="https://t.me/$2">@$2</a>');
}

function render(text) {
  let out = "", list = false;
  const close = () => { if (list) { out += "</ul>"; list = false; } };
  for (const raw of text.trim().split("\n")) {
    const l = raw.trim();
    if (!l) { close(); continue; }
    if (l.startsWith("- ")) {
      if (!list) { out += "<ul>"; list = true; }
      out += `<li>${inline(l.slice(2))}</li>`;
      continue;
    }
    close();
    if (l === "---") out += "<hr>";
    else if (l.startsWith("# ")) out += `<h3>${inline(l.slice(2))}</h3>`;
    else out += `<p>${inline(l)}</p>`;
  }
  close();
  return out;
}

function buildTabs(route) {
  const t = [
    ...CATEGORIES.map(c => ({ h: `#/cat/${c.id}`, t: c.title, i: c.icon, k: c.id })),
    { h: "#/members", t: "اعضای انجمن", i: "fa-users", k: "members" }
  ];
  tabsEl.innerHTML =
    `<a class="logo" href="#/" title="صفحهٔ اصلی"><img src="img/logo.png" alt="لوگو"></a>` +
    t.map(x => `<a href="${x.h}" class="${route === x.k ? "on" : ""}"><i class="fa-solid ${x.i}"></i>${x.t}</a>`).join("");
}

function card(it) {
  return `<article class="card">
    <a class="ph" href="#/post/${it.id}"><img src="${it.poster}" alt="${it.title}" loading="lazy"></a>
    <div class="bd"><h3>${it.title}</h3><p>${it.summary}</p>
    <a class="btn" href="#/post/${it.id}">(ادامه مطلب) <i class="fa-solid fa-arrow-left"></i></a></div>
  </article>`;
}

function startSlider() {
  const el = document.querySelector(".slider");
  const slides = [...el.querySelectorAll(".slide")];
  const dots = [...el.querySelectorAll(".dots i")];
  let cur = 0;
  const go = n => {
    if (n === cur) return;
    const old = slides[cur], nw = slides[n];
    // جدید از چپ وارد می‌شود و فعلی به راست می‌رود
    nw.classList.add("reset"); nw.classList.remove("out", "on");
    void nw.offsetWidth;
    nw.classList.remove("reset");
    old.classList.remove("on"); old.classList.add("out");
    nw.classList.add("on");
    dots[cur].classList.remove("on"); dots[n].classList.add("on");
    cur = n;
  };
  const loop = () => { clearInterval(timer); timer = setInterval(() => go((cur + 1) % slides.length), 4500); };
  dots.forEach((d, i) => d.onclick = () => { go(i); loop(); });
  loop();
}

function home() {
  const items = homeOrder.map(byId);
  app.innerHTML = `
    <div class="slider">
      ${items.map((it, i) => `<a class="slide ${i ? "" : "on"}" href="#/post/${it.id}"><img src="${it.poster}" alt="${it.title}"><div class="cap">${it.title}</div></a>`).join("")}
      <div class="dots">${items.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
    </div>
    <h2 class="sec"><i class="fa-solid fa-layer-group"></i> بخش‌های سایت</h2>
    <div class="cats">
      ${CATEGORIES.map(c => `<a class="cat" href="#/cat/${c.id}"><i class="fa-solid ${c.icon}"></i><b>${c.title}</b><small>${c.desc}</small></a>`).join("")}
      <a class="cat" href="#/members"><i class="fa-solid fa-users"></i><b>اعضای انجمن</b><small>آشنایی با اعضای انجمن</small></a>
    </div>
    <h2 class="sec"><i class="fa-solid fa-newspaper"></i> تازه‌ترین مطالب</h2>
    <div class="grid">${ITEMS.slice().reverse().slice(0, 3).map(card).join("")}</div>`;
  startSlider();
}

function category(id) {
  const c = catOf(id);
  if (!c) return home();
  app.innerHTML = `<h1 class="pt"><i class="fa-solid ${c.icon}"></i>${c.title}</h1><p class="sub">${c.desc}</p>
    <div class="grid">${ITEMS.filter(i => i.cat === id).map(card).join("")}</div>`;
}

function post(id) {
  const it = byId(id);
  if (!it) return home();
  const c = catOf(it.cat);
  app.innerHTML = `<a class="back" href="#/cat/${c.id}"><i class="fa-solid fa-arrow-right"></i> بازگشت به ${c.title}</a>
    <article class="art"><img class="hero" src="${it.poster}" alt="${it.title}"><h1>${it.title}</h1>${render(it.body)}
    ${it.answer ? `<details><summary><i class="fa-solid fa-lightbulb"></i> ${it.answerTitle || "پاسخ"} (برای دیدن پاسخ کلیک کنید)</summary>${render(it.answer)}</details>` : ""}</article>`;
}

function about() {
  app.innerHTML = `<h1 class="pt"><i class="fa-solid fa-circle-info"></i>درباره ما</h1><article class="art">${render(ABOUT)}</article>`;
}

function members() {
  const hues = [220, 260, 160, 30, 340, 190, 280];
  app.innerHTML = `<h1 class="pt"><i class="fa-solid fa-users"></i>اعضای انجمن</h1><p class="sub">اعضای انجمن علمی ریاضی</p>
    <div class="mem">${MEMBERS.map((n, i) => `<div class="m"><div class="av" style="background:linear-gradient(135deg,hsl(${hues[i % 7]} 70% 45%),hsl(${(hues[i % 7] + 50) % 360} 70% 55%))">${MEMBER_PHOTOS[n] ? `<img src="${MEMBER_PHOTOS[n]}" alt="${n}" loading="lazy">` : n[0]}</div><b>${n}</b><span><i class="fa-solid fa-infinity"></i> عضو انجمن ریاضی</span></div>`).join("")}</div>`;
}

function route() {
  clearInterval(timer);
  const [, kind, arg] = location.hash.split("/");
  const key = kind === "cat" ? arg : kind === "post" ? (byId(arg) || {}).cat : kind || "";
  buildTabs(key);
  if (kind === "cat") category(arg);
  else if (kind === "post") post(arg);
  else if (kind === "about") about();
  else if (kind === "members") members();
  else home();
  window.scrollTo(0, 0);
}

addEventListener("hashchange", route);
route();
