# 生产部署指南

本文档介绍如何将 Pooplet 应用部署到生产环境。

## 前置要求

在部署之前，请确保：

- 服务器已安装 Docker 和 Docker Compose
- 域名已配置 SSL 证书
- 环境变量已正确设置

## 快速部署

### 1. 克隆仓库

```bash
git clone <repository-url>
cd pooplet
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置生产环境变量：

```env
# 数据库配置
DB_NAME=pooplet
DB_USER=pooplet
DB_PASSWORD=your_secure_db_password_here

# 应用配置
APP_URL=https://your-domain.com
BETTER_AUTH_SECRET=your_very_long_random_secret_key_here_minimum_32_characters
```

### 3. 创建必要目录

```bash
mkdir -p data/postgres
```

### 4. 部署应用

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 架构说明

生产环境采用简化的微服务架构：

```
┌─────────────┐    ┌─────────────┐
│  Next.js   │───▶│ PostgreSQL │
│   应用      │    │   数据库    │
│  (端口3000) │    │  (端口5432) │
└─────────────┘    └─────────────┘
```

### 服务说明

#### Next.js 应用
- 端口: 3000
- 直接对外提供服务
- 生产环境优化
- 安全配置
- 健康检查

#### PostgreSQL 数据库
- 端口: 5432（仅内部访问）
- 数据持久化
- 自动备份
- 安全配置

## 环境变量详解

### 必需变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `DB_PASSWORD` | 数据库密码 | `your_secure_password` |
| `BETTER_AUTH_SECRET` | 认证密钥 | 至少32字符的随机字符串 |
| `APP_URL` | 应用URL | `https://your-domain.com` |

### 可选变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `DB_NAME` | 数据库名称 | `pooplet` |
| `DB_USER` | 数据库用户 | `pooplet` |
| `DISABLE_REGISTRATION` | 禁用注册 | `false` |
| `REGISTRY` | Docker 镜像仓库 | `ghcr.io` |
| `IMAGE_NAME` | 镜像名称 | `your-org/pooplet` |
| `TAG` | 镜像标签 | `latest` |

## 数据库管理

### 备份

```bash
# 创建备份
docker exec pooplet-postgres pg_dump -U pooplet pooplet > backup_$(date +%Y%m%d_%H%M%S).sql

# 自动备份（添加到 crontab）
# 每天2点自动备份
0 2 * * * cd /path/to/project && ./scripts/backup.sh
```

### 恢复

```bash
# 恢复数据库
docker exec -i pooplet-postgres psql -U pooplet pooplet < backup_file.sql
```

### 监控

```bash
# 查看数据库状态
docker exec pooplet-postgres pg_isready -U pooplet

# 查看数据库连接
docker exec pooplet-postgres psql -U pooplet -c "SELECT count(*) FROM pg_stat_activity;"
```

## 监控和日志

### 查看应用日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app
docker-compose logs postgres

# 实时查看日志
docker-compose logs -f app
```

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:3000/api/health

# 检查数据库连接
docker exec pooplet-postgres pg_isready -U pooplet
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

## 维护操作

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build app

# 重启应用
docker-compose restart app
```

### 数据库迁移

```bash
# 运行迁移
docker exec pooplet-app npm run db:migrate

# 或直接使用 Prisma
docker exec pooplet-app npx prisma migrate deploy
```

### 完全重置

```bash
# 停止所有服务
docker-compose down

# 删除数据卷
docker-compose down -v

# 重新启动
docker-compose up -d
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查数据库状态
docker exec pooplet-postgres pg_isready -U pooplet

# 检查连接字符串
docker exec pooplet-app env | grep DATABASE_URL
```

#### 2. 应用无法启动

```bash
# 检查应用日志
docker-compose logs app

# 检查端口占用
netstat -tlnp | grep :3000

# 重新构建镜像
docker-compose build app
docker-compose up -d
```

#### 3. 内存不足

```bash
# 查看系统资源
free -h
df -h

# 调整容器资源限制
# 编辑 docker-compose.yml 中的 deploy.resources
```

#### 4. 端口冲突

```bash
# 检查端口使用
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 修改端口映射
# 编辑 docker-compose.yml 中的 ports
```

### 调试模式

```bash
# 启用详细日志
export DEBUG=*

# 重启服务
docker-compose restart
```

## 性能优化

### 生产环境建议

1. **启用缓存**
   ```yaml
   # 在 docker-compose.yml 中启用
   environment:
     - NODE_ENV=production
     - NEXT_TELEMETRY_DISABLED=1
   ```

2. **数据库优化**
   ```sql
   -- 添加数据库索引
   CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
   CREATE INDEX IF NOT EXISTS idx_records_occurred_at ON records(occurred_at);
   ```

3. **应用优化**
   ```yaml
   # 在生产环境中启用 Next.js 优化
   environment:
     - NODE_ENV=production
     - NEXT_TELEMETRY_DISABLED=1
   ```

### 监控设置

推荐设置监控来跟踪：

- CPU 和内存使用
- 数据库连接数
- 应用响应时间
- 错误率
- 磁盘空间

## 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   docker-compose pull
   ```

2. **防火墙配置**
   ```bash
   # 只开放必要端口
   sudo ufw allow 3000
   sudo ufw deny 5432
   ```

3. **定期备份**
   ```bash
   # 设置自动备份
   crontab -e
   # 添加: 0 2 * * * /path/to/backup-script.sh
   ```

4. **应用更新**
   ```bash
   # 定期更新镜像
   docker-compose pull
   docker-compose up -d
   ```

## 联系支持

如果遇到部署问题，请检查：

1. 环境变量配置
2. SSL 证书有效性
3. 域名 DNS 配置
4. 服务器资源充足

详细日志文件位于：
- 应用日志: `docker-compose logs`
- 数据库日志: Docker 容器日志