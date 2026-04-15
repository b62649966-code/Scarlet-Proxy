const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer({});

/* =========================
   🌐 HOME PAGE (BROWSER UI)
========================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Scarlet Proxy Browser</title>
  <style>
    body {
      margin: 0;
      font-family: Arial;
      background: #111;
      color: white;
    }

    /* TOP BAR */
    .topbar {
      display: flex;
      gap: 8px;
      padding: 10px;
      background: #1c1c1c;
      align-items: center;
    }

    input {
      flex: 1;
      padding: 8px;
      border-radius: 5px;
      border: none;
    }

    button {
      padding: 8px 12px;
      cursor: pointer;
    }

    /* BOOKMARK BAR */
    .bookmarks {
      background: #222;
      padding: 8px;
      display: flex;
      gap: 15px;
    }

    .bookmarks a {
      color: cyan;
      text-decoration: none;
      cursor: pointer;
    }

    iframe {
      width: 100%;
      height: 90vh;
      border: none;
    }
  </style>
</head>
<body>

<!-- BOOKMARK BAR -->
<div class="bookmarks">
  <a onclick="goSite('https://google.com')">Google</a>
  <a onclick="goSite('https://youtube.com')">YouTube</a>
  <a onclick="goSite('https://wikipedia.org')">Wikipedia</a>
</div>

<!-- TOP CONTROLS -->
<div class="topbar">
  <button onclick="back()">⬅</button>
  <button onclick="forward()">➡</button>
  <button onclick="undo()">↩ Undo</button>

  <input id="url" placeholder="Enter website (https://...)" />
  <button onclick="go()">Go</button>
</div>

<iframe id="frame"></iframe>

<script>
let history = [];
let index = -1;

function load(url) {
  if (!url) return;

  history = history.slice(0, index + 1);
  history.push(url);
  index++;

  document.getElementById("frame").src =
    "/proxy?url=" + encodeURIComponent(url);

  document.getElementById("url").value = url;
}

function go() {
  load(document.getElementById("url").value);
}

function goSite(url) {
  load(url);
}

function back() {
  if (index > 0) {
    index--;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(history[index]);
  }
}

function forward() {
  if (index < history.length - 1) {
    index++;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(history[index]);
  }
}

function undo() {
  if (index > 0) {
    index--;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(history[index]);
  }
}
</script>

</body>
</html>
  `);
});

/* =========================
   🔁 PROXY ROUTE
========================= */
app.use("/proxy", (req, res) => {
  const target = req.query.url;

  if (!target) return res.send("Missing ?url=");

  proxy.web(req, res, {
    target,
    changeOrigin: true,
    secure: false,
  });
});

/* =========================
   🚀 RENDER PORT FIX
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});
