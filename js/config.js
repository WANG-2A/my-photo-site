// Supabase 配置 (如果库可用则加载)
let supabase = null;
try {
    if (typeof window.supabase !== 'undefined') {
        const { createClient } = window.supabase;
        const SUPABASE_URL = 'https://umawkuvbaelmfdhyxdrh.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYXdrdXZiYWVsbWZkaHl4ZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzEzNTIsImV4cCI6MjA3ODk0NzM1Mn0.LryZ7CwRienrl5c5QWJR7AeClEqAbeRQDtT9TlzRrdY';
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase 客户端初始化成功');
    } else {
        console.warn('Supabase 库未加载，跳过初始化');
    }
} catch (error) {
    console.warn('Supabase 初始化失败:', error);
}

// AI 分析配置 - Coze 智能体API
const AI_CONFIG = {
    // Coze API 配置
    ENDPOINT: 'https://api.coze.cn/v3/chat',
    UPLOAD_ENDPOINT: 'https://api.coze.cn/v1/files/upload',
    API_KEY: 'pat_XhFmeFHnMu4mKkTQoohcleaFJeg2w8JVz0xdQxyNgkglqUYM5ZQatoytSnevQrk0', // 新的secret token
    BOT_ID: '7574726069233319951', // 智能体ID
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.8
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