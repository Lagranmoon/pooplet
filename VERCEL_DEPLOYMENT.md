# Vercel 部署配置指南

## 环境变量配置

### 问题解决方案

之前的错误 `Environment Variable "VITE_SUPABASE_URL" references Secret "supabase-url", which does not exist.` 是因为：
- `vercel.json` 文件中引用了不存在的 Vercel Secrets
- 需要在 Vercel 项目设置中直接配置环境变量

### 在 Vercel 中配置环境变量

#### 方法 1: 通过 Vercel Dashboard (推荐)

1. **登录 Vercel Dashboard**
   - 访问 [vercel.com](https://vercel.com)
   - 登录你的账户

2. **选择项目**
   - 点击你的 `pooplet` 项目

3. **配置环境变量**
   - 进入 `Settings` > `Environment Variables`
   - 添加以下环境变量：

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | Production, Preview, Development |

#### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### 获取 Supabase 配置信息

1. **登录 [Supabase Dashboard](https://supabase.com/dashboard)**
2. **选择你的项目**
3. **进入 Settings > API**
4. **复制以下信息：**
   - **URL**: `Project URL`
   - **Anon Key**: `anon public` 密钥

### 本地开发环境配置

1. **复制环境变量模板**
   ```bash
   cp .env.example .env
   ```

2. **填入实际的 Supabase 配置**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 验证配置

#### 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 部署前测试
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 常见问题

#### 1. 环境变量未生效
- **检查变量名**: 确保以 `VITE_` 开头
- **重启服务器**: 修改环境变量后重启开发服务器
- **重新部署**: 在 Vercel 中重新部署项目

#### 2. 构建失败
- **检查变量值**: 确保 Supabase URL 和 Key 正确
- **清理缓存**: 删除 `node_modules` 和 `.vite` 重新安装

#### 3. 连接 Supabase 失败
- **验证 URL**: 确保使用正确的 Supabase 项目 URL
- **检查 RLS**: 确认 Row Level Security 策略配置正确
- **查看控制台**: 在浏览器开发者工具中检查网络请求

### 部署检查清单

- [ ] Vercel 项目已连接 GitHub 仓库
- [ ] 环境变量 `VITE_SUPABASE_URL` 已配置
- [ ] 环境变量 `VITE_SUPABASE_ANON_KEY` 已配置
- [ ] 本地构建测试通过 (`npm run build`)
- [ ] Supabase 项目状态正常
- [ ] RLS 策略已配置

### 更新环境变量

如需更新环境变量：

1. **在 Vercel Dashboard 中修改**
2. **重新部署项目**
   - 在 Dashboard 中点击 "Redeploy"
   - 或使用 CLI: `vercel --prod`

### 监控部署

部署完成后：
1. **检查 Vercel Function Logs**
2. **查看浏览器控制台错误**
3. **测试关键功能**（登录、记录创建等）

---

**重要提醒**: 
- 不要在代码中硬编码 Supabase 密钥
- 使用环境变量确保安全性
- 定期更新依赖包保持安全性