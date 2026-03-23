const http = require("http");

const port = Number(process.env.PORT || 3000);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AGORA Web</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    .wrap { max-width: 900px; margin: 48px auto; padding: 0 20px; }
    .card { background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 24px; }
    h1 { margin-top: 0; }
    code { background: #1f2937; padding: 2px 6px; border-radius: 6px; }
    a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>AGORA Web (MVP Skeleton)</h1>
      <p>多智能体协作终端前端骨架已启动。</p>
      <p>后端健康检查：<a href="http://localhost:8000/health">http://localhost:8000/health</a></p>
      <p>下一步：将本页面替换为 Next.js 多面板界面（任务 / 会话 / 审查 / 记忆）。</p>
    </div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", service: "agora-web", version: "0.1.0" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(port, () => {
  console.log(`agora-web listening on :${port}`);
});
