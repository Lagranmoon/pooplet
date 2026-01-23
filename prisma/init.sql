-- 初始化脚本
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 UUIDv7 扩展（PostgreSQL 13+）
SELECT uuidv7() AS uuidv7;

-- 创建数据库函数
CREATE OR REPLACE FUNCTION gen_uuidv7()
RETURNS TEXT AS $$
SELECT uuidv7();
$$ LANGUAGE plpgsql IMMUTABLE;

-- 创建视图
CREATE OR REPLACE VIEW pooplet_daily_stats AS
SELECT
    user_id,
    DATE(occurred_at) as date,
    COUNT(*) as daily_count,
    AVG(quality_rating) as avg_quality,
    MIN(quality_rating) as min_quality,
    MAX(quality_rating) as max_quality
FROM pooplet_record
GROUP BY user_id, DATE(occurred_at);

-- 授权（后续添加）
-- GRANT ALL PRIVILEGES ON pooplet_user TO pooplet;
-- GRANT ALL PRIVILEGES ON pooplet_record TO pooplet;
