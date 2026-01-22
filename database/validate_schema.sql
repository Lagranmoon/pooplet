-- 数据库模式验证脚本
-- 用于验证表结构、约束、索引和 RLS 策略是否正确设置

-- =============================================================================
-- 1. 验证表存在
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bowel_movements') THEN
        RAISE NOTICE '✓ bowel_movements 表存在';
    ELSE
        RAISE EXCEPTION '✗ bowel_movements 表不存在';
    END IF;
END $$;

-- =============================================================================
-- 2. 验证表结构
-- =============================================================================

DO $$
DECLARE
    expected_columns TEXT[] := ARRAY['id', 'user_id', 'recorded_at', 'occurred_at', 'quality_rating', 'notes', 'created_at', 'updated_at'];
    actual_columns TEXT[];
    missing_columns TEXT[];
    col TEXT;
BEGIN
    -- 获取实际列名
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'bowel_movements';
    
    -- 检查缺失的列
    SELECT ARRAY_AGG(col)
    INTO missing_columns
    FROM UNNEST(expected_columns) AS col
    WHERE col NOT IN (SELECT UNNEST(actual_columns));
    
    IF missing_columns IS NULL THEN
        RAISE NOTICE '✓ 所有必需的列都存在';
    ELSE
        RAISE EXCEPTION '✗ 缺失列: %', array_to_string(missing_columns, ', ');
    END IF;
END $$;

-- =============================================================================
-- 3. 验证约束
-- =============================================================================

DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- 检查质量评级约束
    SELECT COUNT(*)
    INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'bowel_movements' 
    AND cc.check_clause LIKE '%quality_rating%';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✓ 质量评级约束存在';
    ELSE
        RAISE EXCEPTION '✗ 质量评级约束不存在';
    END IF;
    
    -- 检查时间约束
    SELECT COUNT(*)
    INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'bowel_movements' 
    AND cc.check_clause LIKE '%occurred_at%';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✓ 时间约束存在';
    ELSE
        RAISE NOTICE '⚠ 时间约束可能不存在（这可能是正常的）';
    END IF;
END $$;

-- =============================================================================
-- 4. 验证索引
-- =============================================================================

DO $$
DECLARE
    expected_indexes TEXT[] := ARRAY[
        'idx_bowel_movements_user_id',
        'idx_bowel_movements_occurred_at',
        'idx_bowel_movements_user_occurred'
    ];
    actual_indexes TEXT[];
    missing_indexes TEXT[];
BEGIN
    -- 获取实际索引
    SELECT ARRAY_AGG(indexname)
    INTO actual_indexes
    FROM pg_indexes
    WHERE tablename = 'bowel_movements'
    AND indexname LIKE 'idx_%';
    
    -- 检查缺失的索引
    SELECT ARRAY_AGG(idx)
    INTO missing_indexes
    FROM UNNEST(expected_indexes) AS idx
    WHERE idx NOT IN (SELECT UNNEST(COALESCE(actual_indexes, ARRAY[]::TEXT[])));
    
    IF missing_indexes IS NULL OR array_length(missing_indexes, 1) = 0 THEN
        RAISE NOTICE '✓ 所有必需的索引都存在';
    ELSE
        RAISE EXCEPTION '✗ 缺失索引: %', array_to_string(missing_indexes, ', ');
    END IF;
END $$;

-- =============================================================================
-- 5. 验证 RLS 策略
-- =============================================================================

DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- 检查 RLS 是否启用
    SELECT relrowsecurity
    INTO rls_enabled
    FROM pg_class
    WHERE relname = 'bowel_movements';
    
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS 已启用';
    ELSE
        RAISE EXCEPTION '✗ RLS 未启用';
    END IF;
    
    -- 检查策略数量
    SELECT COUNT(*)
    INTO policy_count
    FROM pg_policies
    WHERE tablename = 'bowel_movements';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✓ RLS 策略已设置 (% 个策略)', policy_count;
    ELSE
        RAISE EXCEPTION '✗ RLS 策略不完整 (只有 % 个策略)', policy_count;
    END IF;
END $$;

-- =============================================================================
-- 6. 验证触发器
-- =============================================================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table = 'bowel_movements'
    AND trigger_name = 'update_bowel_movements_updated_at';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✓ 更新时间触发器存在';
    ELSE
        RAISE EXCEPTION '✗ 更新时间触发器不存在';
    END IF;
END $$;

-- =============================================================================
-- 7. 验证视图
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'user_bowel_movement_stats') THEN
        RAISE NOTICE '✓ 统计视图存在';
    ELSE
        RAISE NOTICE '⚠ 统计视图不存在（可选功能）';
    END IF;
END $$;

-- =============================================================================
-- 8. 数据类型验证
-- =============================================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'bowel_movements'
        ORDER BY ordinal_position
    LOOP
        CASE rec.column_name
            WHEN 'id' THEN
                IF rec.data_type = 'uuid' AND rec.is_nullable = 'NO' THEN
                    RAISE NOTICE '✓ id 列类型正确 (UUID, NOT NULL)';
                ELSE
                    RAISE EXCEPTION '✗ id 列类型错误: % %', rec.data_type, rec.is_nullable;
                END IF;
            WHEN 'user_id' THEN
                IF rec.data_type = 'uuid' AND rec.is_nullable = 'YES' THEN
                    RAISE NOTICE '✓ user_id 列类型正确 (UUID)';
                ELSE
                    RAISE EXCEPTION '✗ user_id 列类型错误: % %', rec.data_type, rec.is_nullable;
                END IF;
            WHEN 'quality_rating' THEN
                IF rec.data_type = 'integer' THEN
                    RAISE NOTICE '✓ quality_rating 列类型正确 (INTEGER)';
                ELSE
                    RAISE EXCEPTION '✗ quality_rating 列类型错误: %', rec.data_type;
                END IF;
            WHEN 'occurred_at', 'recorded_at', 'created_at', 'updated_at' THEN
                IF rec.data_type = 'timestamp with time zone' THEN
                    RAISE NOTICE '✓ % 列类型正确 (TIMESTAMPTZ)', rec.column_name;
                ELSE
                    RAISE EXCEPTION '✗ % 列类型错误: %', rec.column_name, rec.data_type;
                END IF;
            WHEN 'notes' THEN
                IF rec.data_type = 'text' THEN
                    RAISE NOTICE '✓ notes 列类型正确 (TEXT)';
                ELSE
                    RAISE EXCEPTION '✗ notes 列类型错误: %', rec.data_type;
                END IF;
        END CASE;
    END LOOP;
END $$;

-- =============================================================================
-- 验证完成
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 数据库模式验证完成！';
    RAISE NOTICE '所有必需的组件都已正确设置。';
END $$;