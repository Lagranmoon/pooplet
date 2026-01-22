-- 拉屎记录应用数据库模式
-- 创建排便记录表和相关约束、索引

-- 排便记录表 (bowel_movements)
CREATE TABLE bowel_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    occurred_at TIMESTAMPTZ NOT NULL,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 7),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加约束确保 occurred_at 不能是未来时间
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_occurred_at_not_future 
CHECK (occurred_at <= NOW());

-- 添加约束限制备注长度
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_notes_length 
CHECK (LENGTH(notes) <= 500);

-- 创建索引优化查询性能
CREATE INDEX idx_bowel_movements_user_id ON bowel_movements(user_id);
CREATE INDEX idx_bowel_movements_occurred_at ON bowel_movements(occurred_at);
CREATE INDEX idx_bowel_movements_user_occurred ON bowel_movements(user_id, occurred_at);

-- 创建复合索引用于统计查询
CREATE INDEX idx_bowel_movements_user_date_quality ON bowel_movements(user_id, DATE(occurred_at), quality_rating);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器自动更新 updated_at 字段
CREATE TRIGGER update_bowel_movements_updated_at 
    BEFORE UPDATE ON bowel_movements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();