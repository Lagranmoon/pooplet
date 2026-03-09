#!/bin/bash

# 设置数据目录权限脚本
# Setup data directory permissions script
#
# 为 Docker 非 root 用户 (UID 1001) 设置数据目录权限
# Set permissions for Docker non-root user (UID 1001)

set -e

DATA_DIR="${1:-./data}"
USER_ID=1001
GROUP_ID=1001

echo "🔧 Setting up permissions for data directory..."
echo "   Directory: $DATA_DIR"
echo "   User/Group: $USER_ID:$GROUP_ID"

# 创建数据目录（如果不存在）
# Create data directory if not exists
mkdir -p "$DATA_DIR"

# 设置目录权限
# Set directory permissions
# 注意：在 macOS 上，chown 可能需要 sudo
# Note: On macOS, chown may require sudo
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "⚠️  macOS detected. You may need to run with sudo for chown."
    echo "   sudo chown -R $USER_ID:$GROUP_ID $DATA_DIR"
    # 在 macOS 上，我们可以使用当前用户权限
    chmod -R 755 "$DATA_DIR"
else
    # Linux 系统
    chown -R "$USER_ID:$GROUP_ID" "$DATA_DIR"
    chmod -R 755 "$DATA_DIR"
fi

echo "✅ Permissions set successfully!"
echo ""
echo "To start the application:"
echo "  Production: docker-compose up -d"
echo "  Development: docker-compose -f docker-compose.dev.yml up -d"
