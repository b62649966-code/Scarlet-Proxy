const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use("/proxy", (req, res) => {
  const target = req.query.url;

  if (!target) return res.send("Missing ?url=");

  proxy.web(req, res, {
    target,
    changeOrigin: true,
    secure: false,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});
