#!/bin/bash

# Pooplet Development Environment Setup Script

echo "=== Pooplet 开发环境设置 ==="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
  echo "错误: 请先安装 Docker"
  exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
  echo "错误: 请先安装 Docker Compose"
  exit 1
fi

# 创建必要的目录
echo "创建必要目录..."
mkdir -p prisma/migrations
mkdir -p public

# 生成 Better Auth 密钥
echo "生成 Better Auth 密钥..."
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
echo "BETTER_AUTH_SECRET: $BETTER_AUTH_SECRET"

# 更新 .env.local
echo "更新 .env.local..."
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://pooplet:pooplet_password@localhost:5432/pooplet"

# Better Auth
BETTER_AUTH_SECRET='$BETTER_AUTH_SECRET'
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (for future use)
# SMTP_HOST="smtp.example.com"
# SMTP_PORT="587"
# SMTP_USER="noreply@pooplet.com"
# SMTP_PASSWORD="your-smtp-password"

# Node Environment
NODE_ENV="development"
EOF

echo "✅ .env.local 已创建"
echo ""

# 启动服务
echo "=== 启动 Docker 服务 ==="
docker-compose up -d

# 等待数据库就绪
echo "等待数据库就绪..."
for i in {1..30}; do
  if docker exec pooplet-postgres pg_isready -U pooplet &> /dev/null; then
    echo "✅ 数据库已就绪"
    break
  fi
  echo "等待中 ($i/30)..."
  sleep 1
done

echo ""
echo "=== 服务启动完成 ==="
echo ""
echo "访问地址："
echo "  - 前端: http://localhost:3000"
echo "  - 数据库: localhost:5432"
echo ""
echo "停止服务："
echo "  docker-compose down"
