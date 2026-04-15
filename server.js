const express = require("express");
const httpProxy = require("http-proxy");
const { URL } = require("url");
const compression = require("compression");

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use(compression());

/* =========================
   ⚡ SIMPLE MEMORY CACHE
========================= */
const cache = new Map();

/* =========================
   🏠 MAIN BROWSER UI
========================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Scarlet Next Browser</title>

<style>
body {
  margin: 0;
  font-family: Arial;
  background: #0f0f0f;
  color: white;
}

/* TAB BAR */
#tabs {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: #1c1c1c;
  overflow-x: auto;
}

.tab {
  padding: 6px 12px;
  background: #333;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.tab.active {
  background: #555;
}

/* TOP BAR */
.topbar {
  display: flex;
  gap: 6px;
  padding: 10px;
  background: #222;
}

input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
}

button {
  padding: 10px;
  cursor: pointer;
}

/* FRAME */
iframe {
  width: 100%;
  height: 88vh;
  border: none;
}
</style>

</head>
<body>

<div id="tabs"></div>

<div class="topbar">
  <button onclick="newTab()">+ Tab</button>
  <button onclick="back()">⬅</button>
  <button onclick="forward()">➡</button>

  <input id="bar" placeholder="Search or URL..." />
  <button onclick="go()">Go</button>
</div>

<iframe id="frame"></iframe>

<script>

/* =========================
   🧠 PERSISTENT STORAGE
========================= */
let tabs = JSON.parse(localStorage.getItem("tabs") || "[]");
let active = Number(localStorage.getItem("active") || 0);

if (tabs.length === 0) {
  tabs.push({
    url: "https://google.com",
    history: [],
    index: -1
  });
}

/* =========================
   💾 SAVE STATE
========================= */
function save() {
  localStorage.setItem("tabs", JSON.stringify(tabs));
  localStorage.setItem("active", active);
}

/* =========================
   🌐 NORMALIZE INPUT
========================= */
function normalize(url) {
  if (!url) return "";

  if (url.includes(" ") || !url.includes(".")) {
    return "https://www.google.com/search?q=" + encodeURIComponent(url);
  }

  if (!url.startsWith("http")) return "https://" + url;

  return url;
}

/* =========================
   📑 TAB SYSTEM
========================= */
function newTab() {
  tabs.push({
    url: "https://google.com",
    history: [],
    index: -1
  });

  active = tabs.length - 1;
  renderTabs();
  load("https://google.com");
  save();
}

function renderTabs() {
  const el = document.getElementById("tabs");
  el.innerHTML = "";

  tabs.forEach((t, i) => {
    const d = document.createElement("div");
    d.className = "tab" + (i === active ? " active" : "");
    d.innerText = "Tab " + (i + 1);

    d.onclick = () => {
      active = i;
      load(tabs[i].url);
      save();
    };

    el.appendChild(d);
  });
}

/* =========================
   🌐 LOAD PAGE
========================= */
function load(url) {
  url = normalize(url);

  let t = tabs[active];

  t.history = t.history.slice(0, t.index + 1);
  t.history.push(url);
  t.index++;
  t.url = url;

  document.getElementById("frame").src =
    "/proxy?url=" + encodeURIComponent(url);

  document.getElementById("bar").value = url;

  renderTabs();
  save();
}

/* =========================
   🔍 GO BUTTON
========================= */
function go() {
  load(document.getElementById("bar").value);
}

/* =========================
   ⬅ BACK / FORWARD
========================= */
function back() {
  let t = tabs[active];
  if (t.index > 0) {
    t.index--;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(t.history[t.index]);
  }
}

function forward() {
  let t = tabs[active];
  if (t.index < t.history.length - 1) {
    t.index++;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(t.history[t.index]);
  }
}

/* INIT */
renderTabs();
load(tabs[active].url);

</script>

</body>
</html>
  `);
});

/* =========================
   🌐 FAST PROXY ENGINE
========================= */
app.use("/proxy", (req, res) => {
  let target = req.query.url;

  if (!target) return res.send("Missing ?url=");

  if (!target.startsWith("http")) {
    target = "https://" + target;
  }

  try {
    const parsed = new URL(target);

    // ⚡ CACHE CHECK
    if (cache.has(target)) {
      return proxy.web(req, res, {
        target: parsed.origin,
        changeOrigin: true,
        secure: false,
        xfwd: true,
      });
    }

    cache.set(target, true);

    proxy.web(req, res, {
      target: parsed.origin,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    });

  } catch {
    res.send("Invalid URL");
  }
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Next-Level Proxy running on " + PORT);
});
