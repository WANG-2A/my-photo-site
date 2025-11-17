-- 光影分享摄影网站数据库结构
-- 使用 Supabase PostgreSQL 数据库

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('landscape', 'portrait', 'street', 'macro', 'wildlife', 'architecture')),
    location VARCHAR(200),
    camera_info JSONB,
    exif_data JSONB,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 分析表
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    image_data TEXT, -- Base64 编码的图片数据
    analysis_data JSONB NOT NULL,
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    feedback_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, photo_id),
    UNIQUE(user_id, comment_id)
);

-- 摄影技巧表
CREATE TABLE IF NOT EXISTS photography_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('composition', 'lighting', 'color', 'technique', 'equipment', 'postprocessing')),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    author_id UUID REFERENCES users(id),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户关注表
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'ai_analysis')),
    related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_public ON photos(is_public);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_photo_id ON likes(photo_id);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_photo_id ON ai_analyses(photo_id);

CREATE INDEX IF NOT EXISTS idx_tips_category ON photography_tips(category);
CREATE INDEX IF NOT EXISTS idx_tips_published ON photography_tips(is_published);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON photography_tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photography_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户表安全策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 照片表安全策略
CREATE POLICY "Anyone can view public photos" ON photos
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own photos" ON photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
    FOR DELETE USING (auth.uid() = user_id);

-- AI分析表安全策略
CREATE POLICY "Users can view own AI analyses" ON ai_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI analyses" ON ai_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 评论表安全策略
CREATE POLICY "Anyone can view comments" ON comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 点赞表安全策略
CREATE POLICY "Anyone can view likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);

-- 摄影技巧表安全策略
CREATE POLICY "Anyone can view published tips" ON photography_tips
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can insert own tips" ON photography_tips
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own tips" ON photography_tips
    FOR UPDATE USING (auth.uid() = author_id);

-- 关注表安全策略
CREATE POLICY "Users can view follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

-- 通知表安全策略
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 插入一些示例数据（可选）
-- 示例摄影技巧
INSERT INTO photography_tips (title, content, category, difficulty_level) VALUES
('三分法则', '将画面分成九宫格，把主体放在交叉点上，创造更平衡的构图。这是最基本也是最重要的构图法则。', 'composition', 1),
('黄金时刻拍摄', '日出后和日落前的一小时，光线柔和温暖，最适合拍摄人像和风光。此时光线方向性强，色彩饱和度高。', 'lighting', 2),
('快门速度控制', '用1/1000s以上凝固运动瞬间，用1/15s以下创造动态模糊效果。根据拍摄对象选择合适的快门速度。', 'technique', 2),
('引导线构图', '利用道路、河流、建筑线条等引导观众视线，增强画面深度和方向感。引导线可以是直线也可以是曲线。', 'composition', 2),
('色彩搭配原理', '理解互补色、类似色和三角色搭配，创造更有冲击力的视觉效果。色彩可以影响照片的情感表达。', 'color', 3),
('景深控制技巧', '使用大光圈获得浅景深突出主体，使用小光圈获得大景深展现全貌。景深是控制画面层次的重要手段。', 'technique', 2);