// AI 分析配置 - Coze 智能体API (简化版本)
const AI_CONFIG = {
    // Coze API 配置
    ENDPOINT: 'https://api.coze.cn/v3/chat',
    UPLOAD_ENDPOINT: 'https://api.coze.cn/v1/files/upload',
    API_KEY: 'pat_XhFmeFHnMu4mKkTQoohcleaFJeg2w8JVz0xdQxyNgkglqUYM5ZQatoytSnevQrk0', // secret token
    BOT_ID: '7574726069233319951', // 智能体ID
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.8
};

// 导出配置 (直接导出，避免依赖问题)
window.APP_CONFIG = {
    AI_CONFIG
};

console.log('简化配置已加载:', window.APP_CONFIG);