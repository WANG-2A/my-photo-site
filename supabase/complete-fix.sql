-- 彻底修复权限问题的 SQL 脚本

-- 1. 确保照片表完全允许匿名访问
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- 2. 确保 AI 分析表允许匿名访问
ALTER TABLE ai_analyses DISABLE ROW LEVEL SECURITY;

-- 3. 设置 Storage 权限（如果还没有的话）
-- 删除可能存在的限制性策略
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- 创建完全开放的策略
CREATE POLICY "Allow all access to photos bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

-- 4. 确保其他相关表也允许访问（可选，为将来功能准备）
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE photography_tips DISABLE ROW LEVEL SECURITY;

-- 5. 验证权限设置
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('photos', 'ai_analyses', 'comments', 'likes', 'photography_tips');