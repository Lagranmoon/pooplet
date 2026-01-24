#!/bin/bash

# Pooplet Development Environment Setup Script

echo "=== Pooplet 开发环境设置 ==="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
  echo "错误: 请先安装 Docker"
  exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
  echo "错误: 请先安装 Node.js"
  exit 1
fi

# 创建必要的目录
echo "创建必要目录..."
mkdir -p prisma/migrations
mkdir -p public

# 检查是否已存在.env文件
if [ ! -f .env ]; then
  echo "创建 .env 文件..."
  cp .env.example .env

  # 生成 Better Auth 密钥
  echo "生成 Better Auth 密钥..."
  BETTER_AUTH_SECRET=$(openssl rand -base64 32)

  # 更新 .env 文件
  cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://pooplet:devpassword@localhost:5432/pooplet_dev"

# Auth Configuration
BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DISABLE_REGISTRATION=false

# Development
NODE_ENV=development
EOF

  echo "✅ .env 文件已创建"
else
  echo "✅ .env 文件已存在"
fi

echo ""

# 停止并删除现有的开发数据库容器（如果存在）
if docker ps -a --format 'table {{.Names}}' | grep -q "pooplet-postgres-dev"; then
  echo "停止现有的数据库容器..."
  docker stop pooplet-postgres-dev 2>/dev/null || true
  docker rm pooplet-postgres-dev 2>/dev/null || true
fi

# 启动数据库
echo "=== 启动 PostgreSQL 数据库 ==="
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine

if [ $? -eq 0 ]; then
  echo "✅ 数据库容器已启动"
else
  echo "❌ 数据库启动失败"
  exit 1
fi

# 等待数据库就绪
echo "等待数据库就绪..."
for i in {1..30}; do
  if docker exec pooplet-postgres-dev pg_isready -U pooplet &> /dev/null; then
    echo "✅ 数据库已就绪"
    break
  fi
  echo "等待中 ($i/30)..."
  sleep 1
done

echo ""

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
  echo "=== 安装依赖 ==="
  npm install
fi

# 初始化数据库
echo "=== 初始化数据库 ==="
npm run db:generate
npm run db:push

echo ""
echo "=== 开发环境设置完成 ==="
echo ""
echo "访问地址："
echo "  - 前端: http://localhost:3000"
echo "  - 数据库: localhost:5432"
echo ""
echo "启动开发服务器："
echo "  npm run dev"
echo ""
echo "停止数据库："
echo "  docker stop pooplet-postgres-dev"
echo ""
echo "完整重置数据库："
echo "  ./setup-dev.sh"