# Pooplet - 家庭排便记录助手

[![Backend Coverage](https://img.shields.io/badge/backend-84.4%25-brightgreen?logo=go)](https://github.com/Lagranmoon/pooplet)
[![Frontend Coverage](https://img.shields.io/badge/frontend-1.75%25-yellow?logo=react)](https://github.com/Lagranmoon/pooplet)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个可爱风格的排便记录Web应用，帮助个人追踪排便情况。

## 测试覆盖率

### 后端 (Go)
| 模块 | 覆盖率 |
|------|--------|
| config | 100.0% |
| handlers | 93.3% |
| middleware | 93.6% |
| models | 95.8% |
| services | 45.9% |
| **总体** | **84.4%** |

### 前端 (React + TypeScript)
| 模块 | 覆盖率 |
|------|--------|
| types | 100% |
| utils | 100% |
| useLocalStorage hook | 92.3% |
| **总体** | **1.75%** |

运行测试：
```bash
# 后端测试
make test-backend

# 前端测试
make test-frontend
```

## 技术栈

### 前端
- React 19 + TypeScript + Vite
- shadcn/ui + Tailwind CSS v4
- Framer Motion 动画
- date-fns 日期处理
- Lucide React 图标

### 后端
- Go 1.23 + Gin
- GORM + PostgreSQL
- JWT 认证
- RESTful API
- Module: `github.com/Lagranmoon/pooplet`

## 功能特性

### 首页
- 今日排便统计（次数、分布）
- 本周排便趋势
- 连续记录天数（打卡 streak）
- 排便提醒开关

### 记录功能
- 快速添加排便记录
- 选择时间、难度（顺畅/正常/困难/艰辛）
- 添加备注
- 历史记录查看

### 统计功能
- 连续记录天数
- 本月记录天数
- 总记录数
- 难度分布统计
- 日历视图

## 快速开始

### 使用 Docker（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务将运行在：
- 前端: http://localhost:3000
- 后端API: http://localhost:8080/api/v1
- PostgreSQL: localhost:5432

### 手动运行

#### 后端
```bash
cd backend
go mod tidy
go run ./cmd/main.go
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

## API 端点

### 认证
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录

### 受保护端点
- `GET /api/v1/profile` - 获取用户信息
- `GET /api/v1/logs` - 获取记录列表
- `POST /api/v1/logs` - 创建记录
- `GET /api/v1/logs/:id` - 获取单条记录
- `PUT /api/v1/logs/:id` - 更新记录
- `DELETE /api/v1/logs/:id` - 删除记录
- `GET /api/v1/stats` - 获取统计数据

## 项目结构

```
pooplet/
├── backend/
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repository/
│   │   └── services/
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 环境变量

### 后端
- `SERVER_PORT` - 服务端口（默认8080）
- `DATABASE_URL` - PostgreSQL连接字符串
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRES_AT` - JWT过期时间（小时，默认168=7天）
- `ENVIRONMENT` - 运行环境（development/production）

## 难度等级

| 等级 | Emoji | 说明 |
|------|-------|------|
| 顺畅 | 💩 | 轻松顺利 |
| 正常 | 😐 | 正常情况 |
| 困难 | 😣 | 有些困难 |
| 艰辛 | 😫 | 非常困难 |

## License

MIT
