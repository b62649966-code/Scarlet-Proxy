const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/proxy", (req, res, next) => {
  const target = req.query.url;

  if (!target) return res.send("Missing ?url=");

  createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: false,
    pathRewrite: () => "", 
  })(req, res, next);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Proxy running on http://localhost:" + PORT);
});