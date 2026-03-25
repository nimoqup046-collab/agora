const http = require("http");

const port = Number(process.env.PORT || 3000);
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AGORA 控制台（MVP）</title>
  <style>
    :root {
      --bg: #0b1220;
      --panel: #101a2b;
      --line: #2a3a55;
      --text: #dbe7ff;
      --muted: #8ea4c7;
      --brand: #3aa8ff;
      --ok: #2dd4bf;
      --warn: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: radial-gradient(circle at 0% 0%, #16253e, var(--bg));
      color: var(--text);
    }
    .wrap { max-width: 1100px; margin: 26px auto; padding: 0 16px; }
    .head { margin-bottom: 14px; }
    h1 { margin: 0 0 8px 0; font-size: 28px; }
    .sub { color: var(--muted); font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .card {
      background: linear-gradient(180deg, #13233b, var(--panel));
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
    }
    .card h2 { margin: 0 0 12px 0; font-size: 16px; }
    label { display: block; margin: 10px 0 5px; font-size: 12px; color: var(--muted); }
    input, textarea, select {
      width: 100%;
      border: 1px solid #385277;
      background: #0f1b2e;
      color: var(--text);
      border-radius: 8px;
      padding: 10px;
      font-size: 14px;
    }
    textarea { min-height: 82px; resize: vertical; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    button {
      border: 1px solid #3d5b87;
      background: #17345e;
      color: #dff1ff;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { background: #1b4279; }
    button.secondary { background: #1f2937; }
    button.ok { background: #0f766e; border-color: #14b8a6; }
    button.warn { background: #7c3f00; border-color: #f59e0b; }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid #2b4e77;
      font-size: 12px;
      color: #b9d9ff;
      margin-right: 8px;
    }
    .out {
      margin-top: 14px;
      padding: 12px;
      background: #091425;
      border: 1px solid #2b405f;
      border-radius: 10px;
      min-height: 220px;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.45;
      overflow: auto;
    }
    .full { grid-column: 1 / -1; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>AGORA 控制台（Sprint 1）</h1>
      <div class="sub">已接入真实 API：<code>${apiBase}</code></div>
      <div class="row" style="margin-top:10px;">
        <span class="badge">Postgres: workspaces/sessions/tasks/events</span>
        <span class="badge">Redis: task status cache</span>
        <span class="badge">API Version 0.2.0</span>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>1) 创建 Workspace</h2>
        <label>名称</label>
        <input id="ws-name" value="AGORA Demo Workspace" />
        <label>目标</label>
        <textarea id="ws-objective">验证多智能体协作 coding 与 PR 闭环。</textarea>
        <label>仓库 URL（可选）</label>
        <input id="ws-repo" placeholder="https://github.com/xxx/yyy" />
        <div class="row" style="margin-top:10px;">
          <button onclick="createWorkspace()">创建 Workspace</button>
          <button class="secondary" onclick="listWorkspaces()">列出 Workspaces</button>
        </div>
      </div>

      <div class="card">
        <h2>2) 创建 Session</h2>
        <label>Workspace ID</label>
        <input id="session-workspace-id" placeholder="自动回填" />
        <label>模式</label>
        <select id="session-mode">
          <option value="engineering">engineering</option>
          <option value="research">research</option>
        </select>
        <div class="row" style="margin-top:10px;">
          <button onclick="createSession()">创建 Session</button>
          <button class="secondary" onclick="listSessions()">列出 Sessions</button>
        </div>
      </div>

      <div class="card full">
        <h2>3) 创建/管理 Task</h2>
        <div class="row">
          <div style="flex:1; min-width:220px;">
            <label>Session ID</label>
            <input id="task-session-id" placeholder="自动回填" />
          </div>
          <div style="flex:1; min-width:220px;">
            <label>任务标题</label>
            <input id="task-title" value="实现 API 健康检查增强" />
          </div>
        </div>
        <label>任务说明</label>
        <textarea id="task-prompt">为 /health 增加 postgres 和 redis 的可用性检查字段。</textarea>
        <div class="row">
          <div style="flex:1; min-width:220px;">
            <label>Agents（逗号分隔）</label>
            <input id="task-agents" value="claude,codex" />
          </div>
          <div style="min-width:220px;">
            <label>需要审批</label>
            <select id="task-requires-approval">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
        </div>
        <div class="row" style="margin-top:10px;">
          <button onclick="createTask()">创建 Task</button>
          <button class="secondary" onclick="listTasks()">列出 Tasks</button>
        </div>

        <div class="row" style="margin-top:14px;">
          <div style="flex:1; min-width:240px;">
            <label>Task ID</label>
            <input id="action-task-id" placeholder="自动回填" />
          </div>
          <div style="flex:1; min-width:240px;">
            <label>备注</label>
            <input id="action-reason" value="人工审批通过" />
          </div>
        </div>
        <div class="row" style="margin-top:10px;">
          <button class="ok" onclick="approveTask(true)">审批通过</button>
          <button class="warn" onclick="approveTask(false)">审批拒绝</button>
          <button class="secondary" onclick="getTask()">查询 Task</button>
          <button class="secondary" onclick="appendTaskEvent()">追加事件</button>
          <button class="secondary" onclick="checkHealth()">健康检查</button>
        </div>
      </div>

      <div class="card full">
        <h2>输出</h2>
        <div id="out" class="out"></div>
      </div>
    </div>
  </div>

  <script>
    const apiBase = ${JSON.stringify(apiBase)};
    const state = { workspaceId: "", sessionId: "", taskId: "" };

    function pretty(data) {
      return JSON.stringify(data, null, 2);
    }

    function show(title, data) {
      const out = document.getElementById("out");
      out.textContent =
        "[" + new Date().toLocaleString() + "] " + title + "\\n\\n" +
        (typeof data === "string" ? data : pretty(data));
    }

    async function api(path, options = {}) {
      const resp = await fetch(apiBase + path, {
        method: options.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const text = await resp.text();
      const data = text ? JSON.parse(text) : {};
      if (!resp.ok) {
        throw new Error(resp.status + " " + resp.statusText + ": " + pretty(data));
      }
      return data;
    }

    function syncIds() {
      document.getElementById("session-workspace-id").value = state.workspaceId;
      document.getElementById("task-session-id").value = state.sessionId;
      document.getElementById("action-task-id").value = state.taskId;
    }

    async function createWorkspace() {
      try {
        const payload = {
          name: document.getElementById("ws-name").value,
          objective: document.getElementById("ws-objective").value,
          repo_url: document.getElementById("ws-repo").value || null,
        };
        const data = await api("/v1/workspaces", { method: "POST", body: payload });
        state.workspaceId = data.workspace_id;
        syncIds();
        show("Workspace Created", data);
      } catch (e) {
        show("Workspace Create Failed", String(e));
      }
    }

    async function listWorkspaces() {
      try {
        const data = await api("/v1/workspaces");
        if (data[0] && data[0].workspace_id) {
          state.workspaceId = data[0].workspace_id;
          syncIds();
        }
        show("Workspaces", data);
      } catch (e) {
        show("List Workspaces Failed", String(e));
      }
    }

    async function createSession() {
      try {
        const payload = {
          workspace_id: document.getElementById("session-workspace-id").value,
          mode: document.getElementById("session-mode").value,
        };
        const data = await api("/v1/sessions", { method: "POST", body: payload });
        state.sessionId = data.session_id;
        syncIds();
        show("Session Created", data);
      } catch (e) {
        show("Session Create Failed", String(e));
      }
    }

    async function listSessions() {
      try {
        const workspaceId = document.getElementById("session-workspace-id").value;
        const query = workspaceId ? ("?workspace_id=" + encodeURIComponent(workspaceId)) : "";
        const data = await api("/v1/sessions" + query);
        if (data[0] && data[0].session_id) {
          state.sessionId = data[0].session_id;
          syncIds();
        }
        show("Sessions", data);
      } catch (e) {
        show("List Sessions Failed", String(e));
      }
    }

    async function createTask() {
      try {
        const payload = {
          session_id: document.getElementById("task-session-id").value,
          title: document.getElementById("task-title").value,
          prompt: document.getElementById("task-prompt").value,
          agents: document.getElementById("task-agents").value.split(",").map(s => s.trim()).filter(Boolean),
          requires_approval: document.getElementById("task-requires-approval").value === "true",
        };
        const data = await api("/v1/tasks", { method: "POST", body: payload });
        state.taskId = data.task_id;
        syncIds();
        show("Task Created", data);
      } catch (e) {
        show("Task Create Failed", String(e));
      }
    }

    async function listTasks() {
      try {
        const sessionId = document.getElementById("task-session-id").value;
        const query = sessionId ? ("?session_id=" + encodeURIComponent(sessionId)) : "";
        const data = await api("/v1/tasks" + query);
        if (data[0] && data[0].task_id) {
          state.taskId = data[0].task_id;
          syncIds();
        }
        show("Tasks", data);
      } catch (e) {
        show("List Tasks Failed", String(e));
      }
    }

    async function getTask() {
      try {
        const taskId = document.getElementById("action-task-id").value;
        const data = await api("/v1/tasks/" + encodeURIComponent(taskId));
        show("Task Detail", data);
      } catch (e) {
        show("Get Task Failed", String(e));
      }
    }

    async function approveTask(approved) {
      try {
        const taskId = document.getElementById("action-task-id").value;
        const reason = document.getElementById("action-reason").value;
        const data = await api("/v1/tasks/" + encodeURIComponent(taskId) + "/approve", {
          method: "POST",
          body: { approved, reason },
        });
        show("Task Approval Updated", data);
      } catch (e) {
        show("Approve Task Failed", String(e));
      }
    }

    async function appendTaskEvent() {
      try {
        const taskId = document.getElementById("action-task-id").value;
        const reason = document.getElementById("action-reason").value;
        const data = await api("/v1/tasks/" + encodeURIComponent(taskId) + "/events", {
          method: "POST",
          body: { message: reason || "manual event" },
        });
        show("Task Event Appended", data);
      } catch (e) {
        show("Append Event Failed", String(e));
      }
    }

    async function checkHealth() {
      try {
        const data = await api("/health");
        show("Health", data);
      } catch (e) {
        show("Health Check Failed", String(e));
      }
    }

    checkHealth();
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", service: "agora-web", version: "0.2.0" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(port, () => {
  console.log(`agora-web listening on :${port}, api=${apiBase}`);
});
