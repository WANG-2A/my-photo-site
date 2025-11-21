// AI评价功能
class AIFeedback {
    constructor() {
        this.currentFile = null;
        this.currentAnalysis = null;
        this.conversationHistory = []; // 存储对话历史
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPhotographyTips();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('aiPhotoFile');
        const fileUpload = document.getElementById('aiFileUpload');
        const removeBtn = document.getElementById('aiRemoveImage');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const saveBtn = document.getElementById('saveFeedback');
        const shareBtn = document.getElementById('shareFeedback');
        const resetBtn = document.getElementById('resetAnalysis');

        // 文件选择事件
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽事件
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('drag-over');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('drag-over');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // 移除图片
        removeBtn.addEventListener('click', () => this.removeImage());

        // 开始分析
        analyzeBtn.addEventListener('click', () => this.startAnalysis());
        
        // 打开AI助手界面
        const openBotBtn = document.getElementById('openBotBtn');
        if (openBotBtn) {
            openBotBtn.addEventListener('click', () => this.toggleBotInterface());
        }

        // 保存评价
        saveBtn.addEventListener('click', () => this.saveFeedback());

        // 分享结果
        shareBtn.addEventListener('click', () => this.shareFeedback());

        // 重新分析
        resetBtn.addEventListener('click', () => this.resetAnalysis());
        
        // 聊天功能
        const chatInput = document.getElementById('chatInput');
        const sendChatBtn = document.getElementById('sendChatBtn');
        
        if (chatInput && sendChatBtn) {
            sendChatBtn.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        // 验证文件类型 - 支持常见图片格式和RAW格式
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            // RAW 格式
            'image/x-canon-cr2', 'image/x-canon-cr3',
            'image/x-nikon-nef', 'image/x-sony-arw',
            'image/x-fuji-raf', 'image/x-panasonic-rw2',
            'image/x-raw', 'image/x-adobe-dng'
        ];
        
        // 支持的文件扩展名（因为某些RAW文件的MIME类型可能不正确）
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', 
                                  '.cr2', '.cr3', '.nef', '.arw', '.raf', 
                                  '.rw2', '.raw', '.dng'];
        
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        const hasValidType = allowedTypes.includes(file.type);
        
        if (!hasValidType && !hasValidExtension) {
            showNotification('请选择有效的图片文件（JPG、PNG、GIF、RAW格式）', 'error');
            return;
        }

        this.currentFile = file;
        this.showPreview(file);
    }

    showPreview(file) {
        const fileName = file.name.toLowerCase();
        const isRawFile = fileName.endsWith('.cr3') || fileName.endsWith('.cr2') || 
                          fileName.endsWith('.nef') || fileName.endsWith('.arw') ||
                          fileName.endsWith('.raf') || fileName.endsWith('.rw2') ||
                          fileName.endsWith('.raw') || fileName.endsWith('.dng');
        
        if (isRawFile) {
            // RAW文件不显示预览，只显示文件名
            document.getElementById('aiImagePreview').style.display = 'none';
            document.querySelector('.file-upload-label').style.display = 'none';
            
            // 创建RAW文件信息显示
            const fileInfo = document.createElement('div');
            fileInfo.id = 'rawFileInfo';
            fileInfo.innerHTML = `
                <div style="padding: 20px; border: 2px dashed #3b82f6; border-radius: 8px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
                    <div style="font-weight: bold; color: #3b82f6;">${file.name}</div>
                    <div style="color: #666; font-size: 14px; margin-top: 5px;">
                        RAW格式文件 • ${(file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                </div>
            `;
            
            // 移除旧的RAW文件信息
            const oldInfo = document.getElementById('rawFileInfo');
            if (oldInfo) oldInfo.remove();
            
            // 插入新信息
            document.querySelector('.upload-section').appendChild(fileInfo);
            document.getElementById('analyzeBtn').style.display = 'inline-block';
            document.getElementById('userQuestionContainer').style.display = 'block';
        } else {
            // 普通图片文件正常预览
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('aiPreviewImg').src = e.target.result;
                document.getElementById('aiImagePreview').style.display = 'block';
                document.querySelector('.file-upload-label').style.display = 'none';
                document.getElementById('analyzeBtn').style.display = 'inline-block';
                document.getElementById('userQuestionContainer').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.currentFile = null;
        document.getElementById('aiPhotoFile').value = '';
        document.getElementById('aiImagePreview').style.display = 'none';
        document.querySelector('.file-upload-label').style.display = 'block';
        document.getElementById('aiPreviewImg').src = '';
        document.getElementById('analyzeBtn').style.display = 'none';
        document.getElementById('userQuestionContainer').style.display = 'none';
        document.getElementById('userQuestion').value = '';
        this.resetAnalysis();
    }

    async startAnalysis() {
        if (!this.currentFile) {
            showNotification('请先选择要分析的照片', 'error');
            return;
        }

        // 检查用户是否输入了图片描述
        const userQuestion = document.getElementById('userQuestion').value.trim();
        if (!userQuestion) {
            showNotification('请先描述你的照片内容，这能帮助AI更准确地分析', 'error');
            document.getElementById('userQuestion').focus();
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const aiResults = document.getElementById('aiResults');
        const resultLoading = document.getElementById('resultLoading');
        const resultContent = document.getElementById('resultContent');

        try {
            // 显示加载状态
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = '分析中...';
            aiResults.style.display = 'block';
            resultLoading.style.display = 'block';
            resultContent.style.display = 'none';

            // 调试：显示配置信息
            console.log('使用的API Token:', window.APP_CONFIG.AI_CONFIG.API_KEY);
            console.log('使用的智能体ID:', window.APP_CONFIG.AI_CONFIG.BOT_ID);

            // 使用 Coze 智能体进行AI分析
            const analysis = await this.analyzeWithCoze();
            
            // 保存分析结果
            this.currentAnalysis = analysis;

            // 显示结果
            setTimeout(() => {
                this.displayResults(analysis);
                resultLoading.style.display = 'none';
                resultContent.style.display = 'block';
            }, 500);

        } catch (error) {
            console.error('分析失败:', error);
            showNotification('分析失败，请重试', 'error');
            aiResults.style.display = 'none';
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '开始分析';
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result;
                const base64 = result.split(',')[1]; // 移除 data:image/jpeg;base64, 前缀
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    async analyzeWithDeepSeek() {
        try {
            // 将图片转换为 base64
            const base64Image = await this.fileToBase64(this.currentFile);
            
            // 构建分析提示词
            const analysisPrompt = `请作为一名专业摄影师，分析这张摄影作品。请从以下四个维度进行详细分析和评分（0-100分）：

1. 构图（Composition）：画面的布局、主体位置、线条运用等
2. 光线（Lighting）：光线的方向、强度、氛围营造等  
3. 色彩（Color）：色彩搭配、色调、饱和度等
4. 创意（Creativity）：独特性、创意表现、视觉冲击力等

请以JSON格式返回分析结果，格式如下：
{
    "totalScore": 总分（四个维度平均分），
    "composition": {"score": 构图分数, "analysis": "构图分析详情和改进建议"},
    "lighting": {"score": 光线分数, "analysis": "光线分析详情和改进建议"},
    "color": {"score": 色彩分数, "analysis": "色彩分析详情和改进建议"},
    "creativity": {"score": 创意分数, "analysis": "创意分析详情和改进建议"},
    "suggestions": ["具体的改进建议1", "具体的改进建议2", "具体的改进建议3"]
}

请确保分析专业、详细，建议实用可行。`;

            // 调用 DeepSeek API
            const response = await fetch(window.APP_CONFIG.AI_CONFIG.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.APP_CONFIG.AI_CONFIG.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: window.APP_CONFIG.AI_CONFIG.MODEL,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: analysisPrompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: window.APP_CONFIG.AI_CONFIG.MAX_TOKENS,
                    temperature: window.APP_CONFIG.AI_CONFIG.TEMPERATURE
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`DeepSeek API 错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API 响应格式错误');
            }

            const analysisText = data.choices[0].message.content;
            
            // 尝试解析 JSON 结果
            let analysis;
            try {
                // 提取 JSON 部分（防止周围有其他文字）
                const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                } else {
                    analysis = JSON.parse(analysisText);
                }
            } catch (parseError) {
                console.error('JSON 解析失败:', parseError);
                console.log('原始分析文本:', analysisText);
                
                // 如果解析失败，创建一个基本的结构
                analysis = {
                    totalScore: 75,
                    composition: { score: 75, analysis: "AI分析遇到了技术问题，请稍后重试。" },
                    lighting: { score: 75, analysis: "AI分析遇到了技术问题，请稍后重试。" },
                    color: { score: 75, analysis: "AI分析遇到了技术问题，请稍后重试。" },
                    creativity: { score: 75, analysis: "AI分析遇到了技术问题，请稍后重试。" },
                    suggestions: ["请稍后重试分析", "检查网络连接", "确保图片格式正确"]
                };
            }

            return analysis;

        } catch (error) {
            console.error('DeepSeek API 调用失败:', error);
            throw new Error(`AI分析失败: ${error.message}`);
        }
    }

    displayResults(analysis) {
        // 更新总分
        document.getElementById('totalScore').textContent = analysis.totalScore;

        // 更新各维度分数
        this.updateScore('composition', analysis.composition.score);
        this.updateScore('lighting', analysis.lighting.score);
        this.updateScore('color', analysis.color.score);
        this.updateScore('creativity', analysis.creativity.score);

        // 更新分析文本
        document.getElementById('compositionAnalysis').textContent = analysis.composition.analysis;
        document.getElementById('lightingAnalysis').textContent = analysis.lighting.analysis;
        document.getElementById('colorAnalysis').textContent = analysis.color.analysis;
        document.getElementById('creativityAnalysis').textContent = analysis.creativity.analysis;

        // 更新建议列表
        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = analysis.suggestions
            .map(suggestion => `<li>${suggestion}</li>`)
            .join('');
    }

    updateScore(type, score) {
        document.getElementById(`${type}Score`).style.width = `${score}%`;
        document.getElementById(`${type}Value`).textContent = score;
    }

    async saveFeedback() {
        if (!this.currentAnalysis) {
            showNotification('没有可保存的评价结果', 'error');
            return;
        }

        try {
            const feedbackData = {
                analysis_data: JSON.stringify(this.currentAnalysis),
                image_data: document.getElementById('aiPreviewImg').src,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from(TABLES.AI_ANALYSES)
                .insert([feedbackData]);

            if (error) {
                throw new Error(`保存失败: ${error.message}`);
            }

            showNotification('评价结果已保存', 'success');

        } catch (error) {
            console.error('保存评价失败:', error);
            showNotification('保存失败，请重试', 'error');
        }
    }

    shareFeedback() {
        if (!this.currentAnalysis) {
            showNotification('没有可分享的评价结果', 'error');
            return;
        }

        // 生成分享文本
        const shareText = `我的摄影作品获得了 ${this.currentAnalysis.totalScore} 分的AI评价！
` +
            `构图: ${this.currentAnalysis.composition.score}分
` +
            `光线: ${this.currentAnalysis.lighting.score}分
` +
            `色彩: ${this.currentAnalysis.color.score}分
` +
            `创意: ${this.currentAnalysis.creativity.score}分

` +
            `来自光影分享 - 让每个瞬间都值得记录`;

        // 尝试使用 Web Share API
        if (navigator.share) {
            navigator.share({
                title: '摄影作品AI评价',
                text: shareText
            }).catch(error => {
                console.log('分享失败:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showNotification('评价结果已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            showNotification('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textarea);
    }

    resetAnalysis() {
        const aiResults = document.getElementById('aiResults');
        const resultContent = document.getElementById('resultContent');
        
        aiResults.style.display = 'none';
        resultContent.style.display = 'none';
        this.currentAnalysis = null;
    }

    loadPhotographyTips() {
        // 这里可以从数据库或API加载更多技巧，目前使用静态内容
        const tips = [
            {
                title: '📐 三分法则',
                content: '将画面分成九宫格，把主体放在交叉点上，创造更平衡的构图。'
            },
            {
                title: '🌅 黄金时刻',
                content: '日出后和日落前的一小时，光线柔和温暖，最适合拍摄人像和风光。'
            },
            {
                title: '📷 快门速度',
                content: '用1/1000s以上凝固运动瞬间，用1/15s以下创造动态模糊效果。'
            },
            {
                title: '🎯 引导线',
                content: '利用道路、河流、建筑线条等引导观众视线，增强画面深度。'
            },
            {
                title: '🎨 色彩理论',
                content: '理解互补色、类似色和三角色搭配，创造更有冲击力的视觉效果。'
            },
            {
                title: '💡 光线方向',
                content: '掌握顺光、侧光、逆光的特点，根据拍摄意图选择合适的光线方向。'
            }
        ];

        // 随机选择4个技巧显示
        const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 4);
        const tipsGrid = document.getElementById('tipsGrid');
        
        tipsGrid.innerHTML = randomTips.map(tip => `
            <div class="tip-card">
                <h4>${tip.title}</h4>
                <p>${tip.content}</p>
            </div>
        `).join('');
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || !this.currentAnalysis) {
            showNotification('请先进行照片分析', 'warning');
            return;
        }
        
        // 显示用户消息
        this.addChatMessage(message, 'user');
        chatInput.value = '';
        
        // 禁用输入和发送按钮
        chatInput.disabled = true;
        const sendBtn = document.getElementById('sendChatBtn');
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';
        
        try {
            // 获取 AI 回复
            const aiResponse = await this.getChatResponse(message);
            
            // 显示 AI 回复
            this.addChatMessage(aiResponse, 'ai');
            
        } catch (error) {
            console.error('聊天错误:', error);
            this.addChatMessage('抱歉，我现在无法回应。请稍后再试。', 'ai');
        } finally {
            // 恢复输入和发送按钮
            chatInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
    }
    
    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const time = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${this.escapeHtml(message)}
            </div>
            <span class="message-time">${time}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存到对话历史
        this.conversationHistory.push({
            sender,
            message,
            time: new Date().toISOString()
        });
    }
    
    async getChatResponse(userMessage) {
        try {
            // 构建对话提示词，包含之前分析和对话历史
            const conversationContext = this.conversationHistory
                .slice(-6) // 只保留最近3轮对话
                .map(item => `${item.sender}: ${item.message}`)
                .join('');
            
            const analysisContext = `
当前照片分析结果：
总分: ${this.currentAnalysis.totalScore}分
构图: ${this.currentAnalysis.composition.score}分 - ${this.currentAnalysis.composition.analysis}
光线: ${this.currentAnalysis.lighting.score}分 - ${this.currentAnalysis.lighting.analysis}
色彩: ${this.currentAnalysis.color.score}分 - ${this.currentAnalysis.color.analysis}
创意: ${this.currentAnalysis.creativity.score}分 - ${this.currentAnalysis.creativity.analysis}
建议: ${this.currentAnalysis.suggestions.join(', ')}
            `;
            
            const prompt = `你是一位专业的摄影导师，正在帮助用户分析一张摄影作品。

${analysisContext}

之前的对话：
${conversationContext}

用户的新问题：${userMessage}

请以专业、友善的语气回答用户的问题，提供具体、实用的摄影建议。回答要简洁明了，避免过于技术化的术语。`;

            const response = await fetch(window.APP_CONFIG.AI_CONFIG.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.APP_CONFIG.AI_CONFIG.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: window.APP_CONFIG.AI_CONFIG.MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "你是一位经验丰富的专业摄影师和摄影导师，擅长分析摄影作品并提供实用的改进建议。"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API 错误: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
                throw new Error('API 响应格式错误');
            }

            return data.choices[0].message.content.trim();

        } catch (error) {
            console.error('获取 AI 回复失败:', error);
            throw error;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleBotInterface() {
        const botContainer = document.getElementById('botContainer');
        const openBotBtn = document.getElementById('openBotBtn');
        const botFrame = document.getElementById('botFrame');
        const botLoading = document.getElementById('botLoading');
        const aiResults = document.getElementById('aiResults');
        
        if (botContainer.style.display === 'none' || botContainer.style.display === '') {
            // 打开智能体界面
            botContainer.style.display = 'block';
            openBotBtn.style.display = 'none';
            
            // 显示加载状态
            botLoading.style.display = 'block';
            
            // iframe 加载完成后隐藏loading
            if (botFrame) {
                botFrame.onload = () => {
                    botLoading.style.display = 'none';
                };
            }
            
            // 隐藏AI分析结果
            if (aiResults) {
                aiResults.style.display = 'none';
            }
        } else {
            // 关闭智能体界面
            botContainer.style.display = 'none';
            openBotBtn.style.display = 'block';
            
            // 显示AI分析结果（如果有的话）
            if (aiResults && this.currentAnalysis) {
                aiResults.style.display = 'block';
            }
        }
    }

    async uploadToImageHost(file) {
        // 直接返回 base64，跳过图床
        console.log('直接使用base64方案');
        return await this.fileToBase64(file);
    }

    async analyzeWithCoze() {
        try {
            // 1. 获取用户的图片描述
            const userQuestion = document.getElementById('userQuestion').value.trim();
            if (!this.currentFile) {
                throw new Error('请先选择要分析的照片');
            }

            console.log('开始智能体分析...');
            console.log('使用智能体ID:', window.APP_CONFIG.AI_CONFIG.BOT_ID);

            // 2. 上传图片到Coze获取image_id
            const imageId = await this.uploadImageToBot();
            if (!imageId) {
                throw new Error('图片上传失败');
            }

            console.log('图片上传成功，image_id:', imageId);

            // 3. 调用智能体API（流式处理 SSE 响应）
            console.log('开始调用智能体API...');
            
            const response = await fetch(window.APP_CONFIG.AI_CONFIG.ENDPOINT, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${window.APP_CONFIG.AI_CONFIG.API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bot_id: window.APP_CONFIG.AI_CONFIG.BOT_ID,
                    user_id: `user_${Date.now()}`, // 动态生成用户 ID，避免冲突
                    stream: true,
                    auto_save_history: false,
                    messages: [ // 注意：这里用 messages 而非 additional_messages（Coze 标准参数）
                        {
                            role: "user",
                            content: [
                                { type: "text", text: userQuestion || "分析这张摄影作品的构图、光线、色彩、主体，并给出3条改进建议" },
                                { 
                                    type: "image", 
                                    image_info: { 
                                        image_id: imageId,
                                        image_type: "photo"
                                    } 
                                }
                            ]
                        }
                    ],
                    // 额外配置：强制智能体按提示词格式输出
                    response_format: {
                        type: "json_object" // 告知智能体输出 JSON 格式
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('智能体API 错误响应:', errorText);
                throw new Error(`智能体API 错误: ${response.status} - ${errorText}`);
            }

            // 4. 处理流式响应 - 修改为直接解析完整 JSON
            return new Promise((resolve, reject) => {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullJsonStr = ""; // 拼接完整的 JSON 字符串
                let errorMsg = "";

                reader.read().then(function processChunk({ done, value }) {
                    if (done) {
                        if (errorMsg) {
                            reject(new Error(errorMsg));
                        } else {
                            try {
                                // 解析完整 JSON 字符串
                                const result = JSON.parse(fullJsonStr);
                                console.log('智能体完整JSON结果:', result);
                                
                                // 构造标准响应数据结构
                                const data = {
                                    data: {
                                        answer: result
                                    }
                                };
                                resolve(data);
                            } catch (e) {
                                reject(new Error(`JSON 解析失败: ${e.message}`));
                            }
                        }
                        return;
                    }

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n").filter(line => line.trim() !== "");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const dataStr = line.slice(6);
                            if (dataStr === "[DONE]") continue;

                            try {
                                const data = JSON.parse(dataStr);
                                // Coze 智能体流式响应的核心内容在 data.choices[0].delta.content
                                if (data.choices && data.choices[0].delta.content) {
                                    fullJsonStr += data.choices[0].delta.content;
                                    console.log('添加流式内容:', data.choices[0].delta.content);
                                }
                            } catch (e) {
                                console.warn("单块数据解析警告:", e);
                            }
                        } else if (line.startsWith("event: error")) {
                            errorMsg = `API 错误: ${line.slice(13)}`;
                        }
                    }

                    return reader.read().then(processChunk);
                }).catch(err => {
                    reject(new Error(`流式读取失败: ${err.message}`));
                });
            });
            
            // 添加响应结构调试
            if (typeof window.debugResponse === 'function') {
                window.debugResponse(data);
            }

            // 4. 解析智能体返回的分析结果
            let analysisText = '';
            
            console.log('完整的智能体响应:', data);
            
            // 尝试多种可能的响应格式
            if (data.data) {
                // 格式1: data.data.answer
                if (data.data.answer) {
                    analysisText = data.data.answer;
                }
                // 格式2: data.data.messages[0].content
                else if (data.data.messages && data.data.messages.length > 0 && data.data.messages[0].content) {
                    analysisText = data.data.messages[0].content;
                }
                // 格式3: data.data.messages[0].content.text
                else if (data.data.messages && data.data.messages.length > 0 && data.data.messages[0].content && data.data.messages[0].content.text) {
                    analysisText = data.data.messages[0].content.text;
                }
                // 格式4: data.data.messages[0].text
                else if (data.data.messages && data.data.messages.length > 0 && data.data.messages[0].text) {
                    analysisText = data.data.messages[0].text;
                }
                // 格式5: 整个data对象转换为字符串
                else {
                    analysisText = JSON.stringify(data.data);
                    console.warn('使用备用格式解析响应');
                }
            } else {
                analysisText = JSON.stringify(data);
                console.warn('使用完整响应作为分析文本');
            }
            
            if (!analysisText) {
                throw new Error('无法解析智能体响应');
            }

            console.log('智能体分析结果:', analysisText);

            // 5. 解析为标准分析格式
            const analysis = this.parseAnalysisResult(analysisText);
            return analysis;

        } catch (error) {
            console.error('智能体API 调用失败:', error);
            throw new Error(`AI分析失败: ${error.message}`);
        }
    }



    parseAnalysisResult(analysisText) {
        // 尝试从智能体分析文本中提取结构化信息
        try {
            // 尝试从分析文本中提取评分信息
            let totalScore = 80;
            let composition = { score: 80, analysis: "" };
            let lighting = { score: 80, analysis: "" };
            let color = { score: 80, analysis: "" };
            let creativity = { score: 80, analysis: "" };
            let suggestions = [];

            // 使用正则表达式提取分数
            const scoreMatches = analysisText.match(/(\d+)[分分]/g);
            if (scoreMatches && scoreMatches.length > 0) {
                totalScore = Math.min(100, Math.max(60, parseInt(scoreMatches[0])));
            }

            // 按行分割分析文本
            const lines = analysisText.split('').filter(line => line.trim());
            
            // 分类提取分析内容
            lines.forEach(line => {
                if (line.includes('构图') || line.includes('布局')) {
                    composition.analysis += line + " ";
                } else if (line.includes('光线') || line.includes('曝光') || line.includes('光')) {
                    lighting.analysis += line + " ";
                } else if (line.includes('色彩') || line.includes('颜色') || line.includes('色调')) {
                    color.analysis += line + " ";
                } else if (line.includes('创意') || line.includes('独特') || line.includes('视角')) {
                    creativity.analysis += line + " ";
                } else if (line.includes('建议') || line.includes('可以') || line.includes('应该')) {
                    suggestions.push(line.trim());
                }
            });

            // 如果某个分类没有分析内容，使用默认值
            if (!composition.analysis) composition.analysis = "构图布局基本合理，主体突出。";
            if (!lighting.analysis) lighting.analysis = "光线运用得当，曝光基本准确。";
            if (!color.analysis) color.analysis = "色彩搭配和谐，色调统一。";
            if (!creativity.analysis) creativity.analysis = "创意表现良好，有一定视角特色。";
            if (suggestions.length === 0) {
                suggestions = ["可以尝试不同的拍摄角度", "注意光线的选择和运用", "加强构图的设计感"];
            }

            return {
                totalScore,
                composition: { ...composition, score: totalScore },
                lighting: { ...lighting, score: totalScore },
                color: { ...color, score: totalScore },
                creativity: { ...creativity, score: totalScore },
                suggestions: suggestions.slice(0, 5) // 最多5个建议
            };

        } catch (error) {
            console.error('解析分析结果失败:', error);
            
            // 返回默认分析结果
            return {
                totalScore: 80,
                composition: { score: 80, analysis: "智能体分析完成。构图布局合理，主体突出。" },
                lighting: { score: 80, analysis: "光线运用得当，曝光准确。" },
                color: { score: 80, analysis: "色彩搭配和谐，色调统一。" },
                creativity: { score: 80, analysis: "创意表现良好，有独特视角。" },
                suggestions: ["可以尝试不同的拍摄角度", "注意光线的选择和运用", "加强构图的设计感"]
            };
        }
    }

    async uploadImageToBot() {
        try {
            // 上传图片到Coze获取file_id
            const formData = new FormData();
            formData.append('file', this.currentFile);
            
            const uploadResponse = await fetch(window.APP_CONFIG.AI_CONFIG.UPLOAD_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.APP_CONFIG.AI_CONFIG.API_KEY}`
                    // 不设置Content-Type，让浏览器自动设置multipart/form-data
                },
                body: formData
            });
            
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('文件上传失败:', uploadResponse.status, errorText);
                return null;
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('文件上传成功:', uploadResult);
            
            if (uploadResult.data && uploadResult.data.id) {
                return uploadResult.data.id;
            } else {
                console.error('文件上传响应格式错误:', uploadResult);
                return null;
            }
            
        } catch (error) {
            console.error('上传图片到Coze失败:', error);
            return null;
        }
    }
}

// 添加缺失的工具函数
window.showNotification = (message, type = 'info') => {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // 根据类型设置背景色
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new AIFeedback();
});