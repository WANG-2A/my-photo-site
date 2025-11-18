// Supabase 配置
const SUPABASE_URL = 'https://umawkuvbaelmfdhyxdrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYXdrdXZiYWVsbWZkaHl4ZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzEzNTIsImV4cCI6MjA3ODk0NzM1Mn0.LryZ7CwRienrl5c5QWJR7AeClEqAbeRQDtT9TlzRrdY';

// 初始化 Supabase 客户端
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AI 分析配置 - Coze API（直接使用官方配置）
const AI_CONFIG = {
    // Coze API 配置
    ENDPOINT: 'https://api.coze.cn/v1/workflow/run',
    API_KEY: 'cztei_hUqrfD57GSookGCso20XsQI8UThFnm637fRiyB3nUOCpzukez8ZN6gpJuCclpvu3W', // 官方文档中的API Key
    WORKFLOW_ID: '7573872754996019236',
    MODEL: '豆包·1.6·视觉理解-250815',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.8,
    
    // 图床配置（临时存储图片）
    IMAGE_HOST: {
        ENDPOINT: 'https://api.freeimage.host/api/1/upload',
        API_KEY: '6d207e0e98b18ae47494dc2dd5b54f89' // 免费图床API
    }
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