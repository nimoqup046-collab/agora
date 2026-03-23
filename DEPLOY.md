# AGORA 部署手册

免费方案：**Render（计算）+ Neon（PostgreSQL）+ Upstash（Redis）**

---

## 第一步：Neon — 创建 PostgreSQL 数据库

1. 打开 https://neon.tech，注册账号（无需信用卡）
2. 点击 **Create Project**，项目名填 `agora`，Region 选 `Asia Pacific (Singapore)`
3. 创建完成后，进入项目 → **Dashboard** → 找到 **Connection string**
4. 复制完整连接串，格式如下：
   ```
   postgresql://alex:AbC123dEf@ep-cool-darkness-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **保存备用**，后续填入 Render 环境变量 `DATABASE_URL`

---

## 第二步：Upstash — 创建 Redis

1. 打开 https://upstash.com，注册账号（无需信用卡）
2. 点击 **Create Database**
   - Name: `agora-redis`
   - Type: `Regional`
   - Region: `ap-southeast-1`（新加坡）
   - 勾选 **TLS** ✅
3. 创建完成后，进入数据库详情 → 找到 **Redis URL**
4. 复制连接串，格式如下：
   ```
   rediss://default:AbC123dEf@apn1-charmed-xxx-123.upstash.io:6379
   ```
5. **保存备用**，后续填入 Render 环境变量 `REDIS_URL`

---

## 第三步：Render — 部署应用

### 3.1 连接 GitHub 仓库

1. 打开 https://render.com，注册账号（需要信用卡验证身份，但**免费套餐不扣费**）
2. 点击右上角 **New** → **Blueprint**
3. 选择 GitHub 仓库 `agora`，分支选 `main`
4. Render 会自动读取仓库根目录的 `render.yaml`，显示将创建 2 个服务：
   - `agora-api`
   - `agora-web`
5. 点击 **Apply** 开始创建

### 3.2 获取 AI API Key（二选一）

**国内用户 → DeepSeek（推荐）**
1. 打开 https://platform.deepseek.com，注册账号（国内可访问，注册送免费额度）
2. 进入 **API Keys** → 创建新 Key，格式：`sk-xxxxxxxx`
3. 保存备用

**海外用户 → Anthropic + OpenAI**
- Anthropic Key：https://console.anthropic.com
- OpenAI Key：https://platform.openai.com

---

### 3.3 配置 agora-api 环境变量

进入 `agora-api` 服务 → **Environment** 选项卡，填入以下变量：

**国内用户（DeepSeek）：**

| 变量名 | 值 |
|---|---|
| `DEEPSEEK_API_KEY` | 上面拿到的 DeepSeek Key（必填） |
| `DEFAULT_MODEL_CLAUDE` | `deepseek-chat` |
| `DEFAULT_MODEL_CODEX` | `deepseek-chat` |
| `DEFAULT_MODEL_META` | `deepseek-chat` |
| `DATABASE_URL` | 第一步从 Neon 复制的连接串（必填） |
| `REDIS_URL` | 第二步从 Upstash 复制的连接串（必填） |
| `API_CORS_ORIGINS` | 暂时填 `http://localhost:3000`，等 agora-web 部署后更新 |

**海外用户（Anthropic + OpenAI）：**

| 变量名 | 值 |
|---|---|
| `ANTHROPIC_API_KEY` | 你的 Anthropic API Key（必填） |
| `OPENAI_API_KEY` | 你的 OpenAI API Key（必填） |
| `DATABASE_URL` | 第一步从 Neon 复制的连接串（必填） |
| `REDIS_URL` | 第二步从 Upstash 复制的连接串（必填） |
| `API_CORS_ORIGINS` | 暂时填 `http://localhost:3000`，等 agora-web 部署后更新 |

（GitHub 相关变量可选，用于 PR 自动化功能）

填完后点击 **Save Changes**，服务会自动重新部署。

### 3.3 等待 agora-api 部署完成

- 构建时间约 3-5 分钟（首次构建 Docker 镜像）
- 部署完成后会得到一个域名，格式：`https://agora-api-xxxx.onrender.com`
- 访问 `https://agora-api-xxxx.onrender.com/health`，返回 `{"status":"ok"}` 说明部署成功

### 3.4 配置 agora-web 环境变量

进入 `agora-web` 服务 → **Environment** 选项卡，填入：

| 变量名 | 值 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 上一步得到的 agora-api 域名，例如 `https://agora-api-xxxx.onrender.com` |

填完后点击 **Save Changes**。

### 3.5 更新 API_CORS_ORIGINS

等 `agora-web` 也部署完成后，得到它的域名（格式：`https://agora-web-xxxx.onrender.com`）。

回到 `agora-api` → **Environment**，把 `API_CORS_ORIGINS` 改为：
```
https://agora-web-xxxx.onrender.com
```

---

## 部署完成验证

| 检查点 | 预期结果 |
|---|---|
| `https://agora-api-xxxx.onrender.com/health` | `{"status":"ok","agents":3}` |
| `https://agora-api-xxxx.onrender.com/docs` | FastAPI 自动文档页面 |
| `https://agora-web-xxxx.onrender.com` | AGORA 前端页面正常显示 |

---

## 注意事项

- **冷启动**：Render 免费服务 15 分钟无请求后会休眠，下次访问需等待约 20 秒唤醒
- **数据库迁移**：API 启动时会自动执行 `packages/orchestrator/migrations/` 下的 SQL 文件
- **日志查看**：Render Dashboard → 服务 → **Logs** 选项卡
