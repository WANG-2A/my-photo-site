-- 修复匿名用户访问权限的 SQL 脚本

-- 删除现有的照片表策略
DROP POLICY IF EXISTS "Anyone can view public photos" ON photos;
DROP POLICY IF EXISTS "Users can view own photos" ON photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

-- 创建新的更宽松的策略（允许匿名访问）
CREATE POLICY "Enable anonymous access for photos" ON photos
  FOR ALL USING (true) WITH CHECK (true);

-- 删除现有的 AI 分析表策略
DROP POLICY IF EXISTS "Users can view own AI analyses" ON ai_analyses;
DROP POLICY IF EXISTS "Users can insert own AI analyses" ON ai_analyses;

-- 创建新的 AI 分析表策略
CREATE POLICY "Enable anonymous access for AI analyses" ON ai_analyses
  FOR ALL USING (true) WITH CHECK (true);

-- 删除现有的 Storage 策略
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- 创建新的 Storage 策略
CREATE POLICY "Allow all access to photos bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

-- 或者，如果你想要更严格但仍然允许上传的策略，可以使用：
-- CREATE POLICY "Allow insert for photos bucket" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'photos');
-- 
-- CREATE POLICY "Allow select for photos bucket" ON storage.objects
--   FOR SELECT USING (bucket_id = 'photos');