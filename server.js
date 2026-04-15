const express = require("express");
const httpProxy = require("http-proxy");
const compression = require("compression");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const app = express();

/* =========================
   ⚡ PERFORMANCE BOOST
========================= */
app.use(compression());

/* =========================
   🚀 KEEP ALIVE AGENTS
========================= */
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

/* =========================
   🌐 PROXY CORE (FAST MODE)
========================= */
const proxy = httpProxy.createProxyServer({
  xfwd: true,
  changeOrigin: true,
  secure: false,
  timeout: 15000
});

/* =========================
   🧠 ERROR HANDLING (IMPORTANT)
========================= */
proxy.on("error", (err, req, res) => {
  if (!res.headersSent) {
    res.writeHead(500, { "Content-Type": "text/plain" });
  }
  res.end("Proxy error: " + err.message);
});

/* =========================
   🏠 UI
========================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Scarlet Proxy Engine v2</title>

<style>
body {
  margin: 0;
  font-family: Arial;
  background: #0a0a0a;
  color: white;
}

.topbar {
  display: flex;
  gap: 6px;
  padding: 10px;
  background: #120000;
  border-bottom: 2px solid #ff0033;
}

input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #330000;
  background: #1a0000;
  color: white;
}

button {
  padding: 10px;
  background: #1a0000;
  border: 1px solid #330000;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #ff0033;
}

iframe {
  width: 100%;
  height: 92vh;
  border: none;
}
</style>
</head>

<body>

<div class="topbar">
  <button onclick="back()">⬅</button>
  <button onclick="forward()">➡</button>
  <input id="bar" placeholder="Search or URL..." />
  <button onclick="go()">Go</button>
</div>

<iframe id="frame"></iframe>

<script>
let history = [];
let index = -1;

function fix(url){
  if(!url) return "";
  if(url.includes(" ") || !url.includes(".")){
    return "https://www.google.com/search?q=" + encodeURIComponent(url);
  }
  if(!url.startsWith("http")) return "https://" + url;
  return url;
}

function load(url){
  url = fix(url);

  history = history.slice(0,index+1);
  history.push(url);
  index++;

  document.getElementById("frame").src =
    "/proxy?url=" + encodeURIComponent(url);

  document.getElementById("bar").value = url;
}

function go(){
  load(document.getElementById("bar").value);
}

function back(){
  if(index > 0){
    index--;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(history[index]);
  }
}

function forward(){
  if(index < history.length - 1){
    index++;
    document.getElementById("frame").src =
      "/proxy?url=" + encodeURIComponent(history[index]);
  }
}

load("https://google.com");
</script>

</body>
</html>
  `);
});

/* =========================
   🌐 FAST PROXY ROUTE
========================= */
app.get("/proxy", (req, res) => {
  let target = req.query.url;

  if (!target) return res.send("Missing url");

  if (!target.startsWith("http")) {
    target = "https://" + target;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).send("Invalid URL");
  }

  proxy.web(req, res, {
    target: parsed.origin,
    changeOrigin: true,
    secure: false,
    agent: parsed.protocol === "https:" ? httpsAgent : httpAgent
  });
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("⚡ Proxy Engine v2 running on port " + PORT);
});
