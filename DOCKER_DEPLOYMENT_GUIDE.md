# 🐳 Docker 部署指南 - Pooplet

本指南涵盖了Pooplet健康追踪应用的完整Docker容器化部署方案，包括开发、测试和生产环境。

## 📋 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [生产环境](#生产环境)
- [监控和日志](#监控和日志)
- [安全配置](#安全配置)
- [故障排除](#故障排除)

## 🏗️ 架构概览

### 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Pooplet       │    │   PostgreSQL    │
│  (Reverse Proxy)│────│   (Node.js)     │────│   (Database)    │
│   Port 80/443   │    │   Port 3000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Cache/Session)│
                       │   Port 6379     │
                       └─────────────────┘
```

### 容器化组件

- **Pooplet App**: Next.js应用程序容器
- **PostgreSQL**: 主数据库容器
- **Redis**: 缓存和会话存储容器
- **Nginx**: 反向代理和负载均衡器
- **Prometheus**: 监控数据收集（可选）
- **Grafana**: 监控仪表板（可选）

## 🚀 快速开始

### 前提条件

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 最小化启动

```bash
# 1. 克隆项目
git clone <your-repo>
cd pooplet

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量

# 3. 启动开发环境
./deploy.sh dev
```

## 💻 开发环境

### 开发配置

```bash
# 启动开发环境
./deploy.sh dev

# 或手动启动
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine

# 查看日志
docker logs -f pooplet-postgres-dev
```

### 开发环境特性

- 🔄 热重载
- 🐛 详细错误信息
- 🔍 调试工具
- ⚡ 快速启动

### 访问地址

- **应用**: http://localhost:3000
- **数据库**: localhost:5432
- **Redis**: localhost:6379

## 🚀 生产环境

### 生产部署

```bash
# 1. 配置生产环境变量
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 2. 创建SSL证书目录
mkdir -p ssl
# 将SSL证书放入ssl/目录：
# - ssl/cert.pem (SSL证书)
# - ssl/key.pem (SSL私钥)

# 3. 创建数据目录
mkdir -p data/postgres data/redis logs backups

# 4. 部署生产环境
./deploy.sh production
```

### 生产环境特性

- 🔒 SSL/TLS加密
- 🛡️ 安全加固
- 📊 监控集成
- 💾 数据持久化
- 🔄 自动重启
- 🏥 健康检查

### 环境变量配置

```bash
# 核心配置
DB_PASSWORD=your_secure_db_password
REDIS_PASSWORD=your_secure_redis_password
BETTER_AUTH_SECRET=your_very_long_random_secret_key_minimum_32_characters
APP_URL=https://your-domain.com

# 安全配置
DISABLE_REGISTRATION=false
BETTER_AUTH_SECURE=true
ENABLE_RATE_LIMITING=true

# 监控配置
GRAFANA_ADMIN_PASSWORD=your_secure_grafana_password
```

## 📊 监控和日志

### 健康检查

```bash
# 检查所有服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查特定服务
docker-compose -f docker-compose.prod.yml ps app

# 查看健康状态
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### 日志管理

```bash
# 查看所有日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f nginx

# 查看最近100行日志
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### 监控服务

启动监控服务（可选）：

```bash
# 启动监控栈
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# 访问Grafana仪表板
# http://localhost:3001 (如果启用)
```

### 监控配置

- **Prometheus**: 收集指标数据
- **Grafana**: 可视化监控仪表板
- **健康检查**: 容器状态监控
- **日志聚合**: 集中化日志管理

## 🔒 安全配置

### 安全特性

- 🔐 非root用户运行
- 🚫 最小权限原则
- 🛡️ 安全头配置
- 🔒 SSL/TLS加密
- 🚦 速率限制
- 🛡️ 网络隔离

### SSL证书配置

```bash
# 1. 获取SSL证书（使用Let's Encrypt）
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 2. 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# 3. 设置正确权限
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
```

### 安全最佳实践

1. **定期更新**
   ```bash
   # 更新Docker镜像
   docker-compose -f docker-compose.prod.yml pull
   
   # 更新依赖
   npm audit
   npm update
   ```

2. **监控安全**
   ```bash
   # 扫描镜像漏洞
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     -v $(pwd):/root/.cache/ \
     aquasec/trivy fs /root/.cache
   
   # 检查容器安全
   docker run --rm -it --privileged --rm \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v $(pwd):/root/.cache/ \
     sysdig/docker-bench-security
   ```

## 🛠️ 维护操作

### 备份和恢复

```bash
# 备份数据库
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U pooplet pooplet > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U pooplet pooplet < backup_20240124_120000.sql

# 备份Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
docker cp pooplet-redis:/data/dump.rdb ./backups/redis_backup_$(date +%Y%m%d).rdb
```

### 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建新镜像
docker-compose -f docker-compose.prod.yml build app

# 3. 零停机更新
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# 4. 清理旧镜像
docker image prune -f
```

### 扩展和优化

```bash
# 水平扩展应用实例
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# 优化资源限制
# 编辑 docker-compose.prod.yml 中的 deploy.resources 部分
```

## 🐛 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 检查容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看容器日志
docker-compose -f docker-compose.prod.yml logs service_name

# 进入容器调试
docker-compose -f docker-compose.prod.yml exec app sh
```

#### 2. 数据库连接失败

```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U pooplet

# 检查连接字符串
docker-compose -f docker-compose.prod.yml exec app env | grep DATABASE_URL
```

#### 3. SSL证书问题

```bash
# 检查证书文件
ls -la ssl/
openssl x509 -in ssl/cert.pem -text -noout

# 检查Nginx配置
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

#### 4. 内存不足

```bash
# 检查容器资源使用
docker stats

# 调整内存限制
# 编辑 docker-compose.prod.yml 中的内存限制
```

### 调试工具

```bash
# 网络连接测试
docker-compose -f docker-compose.prod.yml exec app ping postgres
docker-compose -f docker-compose.prod.yml exec app nc -zv postgres 5432

# DNS解析测试
docker-compose -f docker-compose.prod.yml exec app nslookup postgres

# 数据库连接测试
docker-compose -f docker-compose.prod.yml exec app psql $DATABASE_URL -c "SELECT version();"
```

## 📝 维护清单

### 日常检查

- [ ] 容器状态正常
- [ ] 应用响应正常
- [ ] 数据库连接正常
- [ ] 磁盘空间充足
- [ ] 日志无异常

### 定期维护

- [ ] 更新Docker镜像
- [ ] 备份数据库
- [ ] 检查安全更新
- [ ] 监控资源使用
- [ ] 更新SSL证书

### 紧急响应

1. **服务中断**
   ```bash
   # 快速重启
   docker-compose -f docker-compose.prod.yml restart
   
   # 检查服务状态
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **数据库问题**
   ```bash
   # 检查数据库日志
   docker-compose -f docker-compose.prod.yml logs postgres
   
   # 重启数据库
   docker-compose -f docker-compose.prod.yml restart postgres
   ```

## 📞 支持

### 获取帮助

- 📧 技术支持: support@pooplet.app
- 🐛 问题报告: GitHub Issues
- 📖 文档: [项目Wiki](https://github.com/your-org/pooplet/wiki)

### 日志收集

遇到问题时，请提供以下信息：

```bash
# 系统信息
uname -a
docker --version
docker-compose --version

# 容器状态
docker-compose -f docker-compose.prod.yml ps

# 错误日志
docker-compose -f docker-compose.prod.yml logs > app_logs.txt

# 资源使用
docker stats --no-stream > resource_usage.txt
```

---

**🎉 恭喜！您已成功配置Pooplet的完整Docker部署环境！**

如有问题，请参考故障排除部分或联系技术支持团队。