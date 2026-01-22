-- 拉屎记录应用完整数据库设置脚本
-- 包含表创建、约束、索引、触发器和 RLS 策略

-- =============================================================================
-- 1. 创建表结构
-- =============================================================================

-- 排便记录表 (bowel_movements)
CREATE TABLE IF NOT EXISTS bowel_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    occurred_at TIMESTAMPTZ NOT NULL,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 7),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. 添加数据约束
-- =============================================================================

-- 确保 occurred_at 不能是未来时间
ALTER TABLE bowel_movements 
ADD CONSTRAINT IF NOT EXISTS check_occurred_at_not_future 
CHECK (occurred_at <= NOW());

-- 限制备注长度
ALTER TABLE bowel_movements 
ADD CONSTRAINT IF NOT EXISTS check_notes_length 
CHECK (notes IS NULL OR LENGTH(notes) <= 500);

-- 确保 quality_rating 不为空
ALTER TABLE bowel_movements 
ADD CONSTRAINT IF NOT EXISTS check_quality_rating_not_null 
CHECK (quality_rating IS NOT NULL);

-- 确保 user_id 不为空
ALTER TABLE bowel_movements 
ADD CONSTRAINT IF NOT EXISTS check_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- =============================================================================
-- 3. 创建索引
-- =============================================================================

-- 基础索引
CREATE INDEX IF NOT EXISTS idx_bowel_movements_user_id ON bowel_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_bowel_movements_occurred_at ON bowel_movements(occurred_at);

-- 复合索引用于常见查询
CREATE INDEX IF NOT EXISTS idx_bowel_movements_user_occurred ON bowel_movements(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_bowel_movements_user_date_quality ON bowel_movements(user_id, DATE(occurred_at), quality_rating);

-- 用于统计查询的索引
CREATE INDEX IF NOT EXISTS idx_bowel_movements_user_created ON bowel_movements(user_id, created_at);

-- =============================================================================
-- 4. 创建触发器函数
-- =============================================================================

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_bowel_movements_updated_at ON bowel_movements;
CREATE TRIGGER update_bowel_movements_updated_at 
    BEFORE UPDATE ON bowel_movements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. 启用行级安全策略 (RLS)
-- =============================================================================

-- 启用 RLS
ALTER TABLE bowel_movements ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own records" ON bowel_movements;
DROP POLICY IF EXISTS "Users can create own records" ON bowel_movements;
DROP POLICY IF EXISTS "Users can update own records" ON bowel_movements;
DROP POLICY IF EXISTS "Users can delete own records" ON bowel_movements;

-- 用户只能查看自己的记录
CREATE POLICY "Users can view own records" ON bowel_movements
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 用户只能创建自己的记录
CREATE POLICY "Users can create own records" ON bowel_movements
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的记录
CREATE POLICY "Users can update own records" ON bowel_movements
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的记录
CREATE POLICY "Users can delete own records" ON bowel_movements
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- =============================================================================
-- 6. 创建有用的视图（可选）
-- =============================================================================

-- 创建一个视图用于统计查询
CREATE OR REPLACE VIEW user_bowel_movement_stats AS
SELECT 
    user_id,
    DATE(occurred_at) as date,
    COUNT(*) as daily_count,
    AVG(quality_rating) as avg_quality,
    MIN(quality_rating) as min_quality,
    MAX(quality_rating) as max_quality
FROM bowel_movements
GROUP BY user_id, DATE(occurred_at);

-- 为视图启用 RLS
ALTER VIEW user_bowel_movement_stats SET (security_invoker = true);

-- =============================================================================
-- 完成设置
-- =============================================================================

-- 显示设置完成信息
DO $$
BEGIN
    RAISE NOTICE '数据库设置完成！';
    RAISE NOTICE '- bowel_movements 表已创建';
    RAISE NOTICE '- 所有约束和索引已添加';
    RAISE NOTICE '- RLS 策略已启用';
    RAISE NOTICE '- 触发器已创建';
    RAISE NOTICE '- 统计视图已创建';
END $$;