// Supabase 配置
const SUPABASE_URL = 'https://umawkuvbaelmfdhyxdrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYXdrdXZiYWVsbWZkaHl4ZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzEzNTIsImV4cCI6MjA3ODk0NzM1Mn0.LryZ7CwRienrl5c5QWJR7AeClEqAbeRQDtT9TlzRrdY';

// 初始化 Supabase 客户端
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AI 分析配置
const AI_CONFIG = {
    // 这里可以配置 AI 服务的 API 端点
    // 例如使用 OpenAI、Claude 或其他 AI 服务
    ANALYSIS_ENDPOINT: 'YOUR_AI_ANALYSIS_ENDPOINT',
    API_KEY: 'YOUR_AI_API_KEY'
};

// 文件上传配置
const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    BUCKET_NAME: 'photos'
};

// 数据表配置
const TABLES = {
    PHOTOS: 'photos',
    USERS: 'users',
    AI_ANALYSES: 'ai_analyses',
    COMMENTS: 'comments'
};

// 导出配置
window.APP_CONFIG = {
    supabase,
    AI_CONFIG,
    UPLOAD_CONFIG,
    TABLES
};