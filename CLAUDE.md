# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供该代码库的指引。

## 项目概述

Pooplet 是一个基于 Next.js 15 和 SQLite 的便便记录 Web 应用，使用布里斯托大便分类法（1-7 型）进行健康追踪。

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 localhost:3000
npm run build        # 构建生产包
npm start            # 启动生产服务器
npm run lint         # 运行 ESLint

# 数据库
npm run db:init      # 创建 data 目录和 .gitkeep 文件

# Docker
docker-compose up -d # 构建并启动容器
docker-compose down  # 停止容器
```

## 开发工作流程

实现新功能时遵循以下步骤：

1. **规划阶段**
   - 创建功能分支: `git checkout -b feature/xxx`
   - 分析需求，确定涉及的文件和组件
   - 规划数据库变更（如需要）

2. **实现阶段**
   - 逐步实现功能，保持提交粒度合理
   - 优先实现后端 API，再实现前端界面
   - 使用 TypeScript 类型确保类型安全

3. **代码检查**
   - 使用 `skill: "vercel-react-best-practices"` 检查 React/Next.js 最佳实践
   - 运行 `npm run build` 确保构建成功
   - 检查是否有类型错误

4. **功能验证**
   - 使用 `skill: "agent-browser"` 在浏览器中验证功能
   - 测试主要用户流程是否正常工作
   - 验证响应式布局

5. **提交记录**
   - 使用中文提交信息，描述清楚变更内容
   - 提交前检查: `git status`
   - 提交: `git add -A && git commit -m "feat: xxx"`

## 架构

### 技术栈
- **框架**: Next.js 15 + App Router
- **运行时**: Node.js 20
- **数据库**: SQLite (better-sqlite3，文件存储)
- **样式**: Tailwind CSS 3 + shadcn/ui 风格组件
- **图表**: Recharts
- **日期处理**: date-fns

### 数据库

SQLite 文件位于 `data/poop.db`，表结构：

```sql
CREATE TABLE poop_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,        -- ISO 8601: YYYY-MM-DD
  time TEXT,                 -- HH:mm 格式
  type INTEGER CHECK(type >= 1 AND type <= 7),  -- 布里斯托类型
  notes TEXT,                -- 备注
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

所有数据库操作在 `lib/db.ts` 中，使用预编译语句。

### API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/records` | 获取/创建记录 |
| GET/PUT/DELETE | `/api/records/[id]` | 单条记录操作 |
| GET | `/api/stats?period=week\|month\|year` | 聚合统计 |

### 关键组件

- `PoopCalendar` (`components/poop-calendar.tsx`): 月视图，带记录标记
- `PoopTypeSelector` (`components/poop-type-selector.tsx`): 布里斯托类型可视化选择器（1-7 型）
- `RecordForm` (`components/record-form.tsx`): 添加/编辑记录表单
- `StatsCharts` (`components/stats-charts.tsx`): 饼图（类型分布）+ 柱状图（每日次数）

### 颜色编码

布里斯托类型使用统一颜色标识：
- **绿色** (类型 3-5): 正常/理想
- **黄色** (类型 2, 6): 轻微异常
- **红色** (类型 1, 7): 需要关注

### 部署

配置为 Docker standalone 输出：
- `Dockerfile`: 多阶段构建，使用 Alpine Linux
- `docker-compose.yml`: 挂载 `./data` 卷用于 SQLite 持久化
- Next.js `output: 'standalone'` 生产模式

### 重要说明

- 数据库在首次运行时自动初始化
- SQLite 启用 WAL 模式 (journal_mode = WAL)
- `next.config.ts` 中需配置 `serverExternalPackages: ['better-sqlite3']`
- data 目录必须存在且可写；通过 `.gitkeep` 提交到 git
