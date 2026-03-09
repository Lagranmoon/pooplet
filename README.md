# PoopTracker - 便便记录应用

简单易用的便便记录 Web 应用，帮助追踪日常排便情况，基于布里斯托大便分类法进行健康分析。

## 功能特性

- 📅 **日历视图** - 直观查看每日记录，颜色标记不同类型的便便
- 📊 **统计分析** - 排便频率、类型分布、理想比例等统计
- 🔥 **连续记录** - 追踪连续记录天数，养成记录习惯
- 💩 **布里斯托分类** - 使用国际标准的布里斯托大便分类法
- 📱 **响应式设计** - 支持桌面和移动端访问
- 🐳 **Docker 部署** - 单命令启动，数据持久化

## 技术栈

- Next.js 15 + App Router
- React 19 + TypeScript
- Tailwind CSS
- better-sqlite3 (SQLite)
- date-fns (日期处理)
- recharts (统计图表)

## 快速开始

### 方式一：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 方式二：Docker 部署（推荐）

```bash
# 使用 Docker Compose
docker-compose up -d

# 访问 http://localhost:3000
```

数据会持久化在 `./data` 目录中的 `poop.db` 文件中。

## 项目结构

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── records/       # 记录 CRUD API
│   │   └── stats/         # 统计数据 API
│   ├── page.tsx           # 首页（日历视图）
   ├── stats/              # 统计页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # UI 组件 (Button, Card, Dialog 等)
│   ├── poop-calendar.tsx # 日历组件
│   ├── poop-type-selector.tsx  # 布里斯托类型选择器
│   ├── record-form.tsx   # 记录表单
│   └── stats-charts.tsx  # 统计图表
├── lib/                   # 工具函数和数据库
│   ├── db.ts             # SQLite 数据库操作
│   └── utils.ts          # 工具函数
├── data/                  # 数据目录 (SQLite 文件)
├── public/               # 静态资源
├── Dockerfile            # Docker 镜像配置
└── docker-compose.yml    # Docker Compose 配置
```

## 布里斯托大便分类

| 类型 | 名称 | 描述 | 健康状况 |
|------|------|------|---------|
| 1 | 坚果状 | 严重便秘 | 🔴 需要关注 |
| 2 | 硬块状 | 轻度便秘 | 🟡 轻微异常 |
| 3 | 有裂纹 | 正常 | 🟢 正常 |
| 4 | 香蕉状 | 理想 | 🟢 正常 |
| 5 | 软块状 | 理想 | 🟢 正常 |
| 6 | 边缘毛糙 | 轻度腹泻 | 🟡 轻微异常 |
| 7 | 水样 | 腹泻 | 🔴 需要关注 |

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/records | 获取记录列表 |
| POST | /api/records | 创建记录 |
| GET | /api/records/:id | 获取单条记录 |
| PUT | /api/records/:id | 更新记录 |
| DELETE | /api/records/:id | 删除记录 |
| GET | /api/stats?period=month | 获取统计数据 |

## 数据模型

```sql
CREATE TABLE poop_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,        -- 日期 (YYYY-MM-DD)
  time TEXT,                 -- 时间 (HH:mm)
  type INTEGER CHECK(type >= 1 AND type <= 7),  -- 布里斯托类型
  notes TEXT,                -- 备注
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 开发计划

- [x] 项目初始化和依赖安装
- [x] 数据库设计 (SQLite)
- [x] API 层实现 (CRUD + 统计)
- [x] UI 组件开发
  - [x] 日历视图
  - [x] 记录表单
  - [x] 布里斯托类型选择器
  - [x] 统计图表
- [x] Docker 配置
- [ ] PWA 支持增强
- [ ] 数据导入/导出

## License

MIT
