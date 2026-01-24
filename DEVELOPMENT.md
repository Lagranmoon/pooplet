# 本地开发指南

本文档介绍如何在本地设置和运行拉屎记录应用的开发环境。

## 前置要求

在开始之前，请确保你的系统已安装以下软件：

- **Node.js** (推荐 v20 或更高版本)
- **npm** (随 Node.js 安装)
- **Docker** (用于 PostgreSQL 数据库)
- **Docker Compose** (用于管理 Docker 容器)

### 验证安装

```bash
node --version
npm --version
docker --version
docker-compose --version
```

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd pooplet
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

`.env` 文件应该包含以下内容：

```env
DATABASE_URL="postgresql://pooplet:pooplet_password@localhost:5432/pooplet"
```

### 4. 启动 PostgreSQL 数据库

使用 Docker Compose 启动开发环境数据库：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

这个命令会：
- 启动 PostgreSQL 数据库容器
- 启动 pgAdmin（可选，用于数据库管理，访问 http://localhost:5050）
- 数据库会在 `localhost:5432` 上运行

### 5. 初始化数据库

运行数据库迁移以创建表结构：

```bash
npm run db:generate
npm run db:push
```

如果你想添加一些测试数据，可以运行：

```bash
npm run db:seed
```

### 6. 启动开发服务器

```bash
npm run dev
```

现在你可以在浏览器中访问 http://localhost:3000

## 开发命令

### 数据库命令

```bash
# 生成 Prisma Client
npm run db:generate

# 应用数据库迁移
npm run db:push

# 创建新的迁移
npm run db:migrate

# 打开 Prisma Studio（数据库可视化界面）
npm run db:studio

# 填充测试数据
npm run db:seed
```

### Docker 命令

```bash
# 启动开发环境数据库
docker-compose -f docker-compose.dev.yml up -d

# 停止开发环境数据库
docker-compose -f docker-compose.dev.yml down

# 查看数据库日志
docker-compose -f docker-compose.dev.yml logs -f postgres

# 重启数据库容器
docker-compose -f docker-compose.dev.yml restart

# 删除数据库容器和数据（谨慎使用）
docker-compose -f docker-compose.dev.yml down -v
```

### 开发服务器命令

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 运行代码检查
npm run lint
```

## 数据库管理

### 使用 Prisma Studio

Prisma Studio 是一个可视化的数据库管理工具：

```bash
npm run db:studio
```

然后在浏览器中访问 http://localhost:5555

### 使用 pgAdmin

如果你想使用 pgAdmin 管理数据库：

1. 启动开发环境数据库（已包含 pgAdmin 容器）
2. 访问 http://localhost:5050
3. 使用以下凭据登录：
   - Email: `admin@pooplet.dev`
   - Password: `admin`
4. 添加新的服务器连接：
   - Host: `postgres`
   - Port: `5432`
   - Username: `pooplet`
   - Password: `pooplet_password`
   - Database: `pooplet`

## 故障排除

### 数据库连接失败

如果无法连接到数据库，请检查：

1. Docker 容器是否正在运行：
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. 数据库是否健康：
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

3. `.env` 文件中的 `DATABASE_URL` 是否正确

### 端口被占用

如果默认端口被占用，你可以修改 `docker-compose.dev.yml` 中的端口映射：

```yaml
ports:
  - "5433:5432"  # 使用 5433 端口
```

然后更新 `.env` 文件：

```env
DATABASE_URL="postgresql://pooplet:pooplet_password@localhost:5433/pooplet"
```

### 依赖安装失败

如果 `npm install` 失败，尝试：

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Prisma 相关问题

如果 Prisma 命令失败，尝试：

```bash
# 重新生成 Prisma Client
npx prisma generate

# 重置数据库（开发环境）
npx prisma migrate reset

# 重新推送数据库架构
npx prisma db push --force-reset
```

## 项目结构

```
pooplet/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
├── lib/                    # 工具函数和库
│   ├── auth.ts            # better-auth 配置
│   ├── db.ts              # Prisma 客户端
│   └── utils.ts           # 通用工具函数
├── prisma/                # Prisma 数据库相关
│   ├── schema.prisma      # 数据库模型定义
│   └── migrations/        # 数据库迁移文件
├── types/                 # TypeScript 类型定义
├── public/                # 静态资源
├── docker-compose.dev.yml # 开发环境 Docker 配置
├── docker-compose.yml     # 生产环境 Docker 配置
├── .env.example           # 环境变量示例
└── package.json           # 项目依赖
```

## 开发工作流

1. **开始开发**：
   ```bash
   # 终端 1：启动数据库
   docker-compose -f docker-compose.dev.yml up -d

   # 终端 2：启动开发服务器
   npm run dev
   ```

2. **开发过程**：
   - 修改代码会自动热重载
   - 修改 `prisma/schema.prisma` 后运行 `npm run db:push` 应用更改
   - 使用 `npm run db:studio` 查看和编辑数据

3. **代码质量**：
   ```bash
   # 运行代码检查
   npm run lint
   ```

4. **提交代码前**：
   - 确保所有测试通过
   - 运行 `npm run lint` 检查代码风格
   - 检查是否需要创建数据库迁移

## 生产部署

本项目包含生产环境的 Docker 配置（`docker-compose.yml`），可以一键部署整个应用栈。

更多信息请参考 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 获取帮助

如果遇到问题：
- 检查 [AGENTS.md](./AGENTS.md) 了解开发规范
- 查看 [database/README.md](./database/README.md) 了解数据库架构
- 查看 GitHub Issues 查找类似问题
