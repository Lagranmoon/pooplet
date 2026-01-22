-- 行级安全策略 (RLS) 配置
-- 确保用户只能访问自己的排便记录

-- 启用 RLS
ALTER TABLE bowel_movements ENABLE ROW LEVEL SECURITY;

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