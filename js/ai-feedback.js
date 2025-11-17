// AI评价功能
class AIFeedback {
    constructor() {
        this.currentFile = null;
        this.currentAnalysis = null;
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

        // 保存评价
        saveBtn.addEventListener('click', () => this.saveFeedback());

        // 分享结果
        shareBtn.addEventListener('click', () => this.shareFeedback());

        // 重新分析
        resetBtn.addEventListener('click', () => this.resetAnalysis());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('请选择有效的图片文件（JPG、PNG、GIF）', 'error');
            return;
        }

        this.currentFile = file;
        this.showPreview(file);
    }

    showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('aiPreviewImg').src = e.target.result;
            document.getElementById('aiImagePreview').style.display = 'block';
            document.querySelector('.file-upload-label').style.display = 'none';
            document.getElementById('analyzeBtn').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.currentFile = null;
        document.getElementById('aiPhotoFile').value = '';
        document.getElementById('aiImagePreview').style.display = 'none';
        document.querySelector('.file-upload-label').style.display = 'block';
        document.getElementById('aiPreviewImg').src = '';
        document.getElementById('analyzeBtn').style.display = 'none';
        this.resetAnalysis();
    }

    async startAnalysis() {
        if (!this.currentFile) {
            showNotification('请先选择要分析的照片', 'error');
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

            // 模拟AI分析过程
            const analysis = await this.simulateAIAnalysis();
            
            // 保存分析结果
            this.currentAnalysis = analysis;

            // 显示结果
            setTimeout(() => {
                this.displayResults(analysis);
                resultLoading.style.display = 'none';
                resultContent.style.display = 'block';
            }, 2000);

        } catch (error) {
            console.error('分析失败:', error);
            showNotification('分析失败，请重试', 'error');
            aiResults.style.display = 'none';
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '开始分析';
        }
    }

    async simulateAIAnalysis() {
        // 这里模拟AI分析，实际应用中应该调用真实的AI服务
        // 例如 OpenAI Vision API、Google Cloud Vision API 等
        
        return new Promise((resolve) => {
            // 模拟不同的分析结果
            const analyses = [
                {
                    totalScore: 85,
                    composition: { score: 88, analysis: '构图运用了三分法则，主体突出，画面平衡感良好。建议可以尝试更多角度，增强视觉冲击力。' },
                    lighting: { score: 82, analysis: '光线运用合理，明暗对比适中。但部分区域可能略显平淡，可以尝试侧光或逆光效果增强层次感。' },
                    color: { score: 86, analysis: '色彩搭配和谐，色调统一。建议可以适当提高饱和度，让画面更加生动。' },
                    creativity: { score: 84, analysis: '拍摄角度独特，有较强的个人风格。可以尝试更广的镜头或更近的特写来突出主体。' },
                    suggestions: [
                        '尝试使用更长的快门时间创造流动效果',
                        '注意背景的简洁，避免杂乱元素干扰主体',
                        '可以考虑在黄金时刻拍摄，获得更柔和的光线'
                    ]
                },
                {
                    totalScore: 78,
                    composition: { score: 75, analysis: '基本构图正确，但可以进一步优化主体位置。建议应用三分法则，将主体放置在交叉点上。' },
                    lighting: { score: 80, analysis: '光线条件良好，但高光部分可能过曝。建议使用包围曝光或降低曝光补偿。' },
                    color: { score: 77, analysis: '色彩还原准确，但缺乏对比度。可以尝试后期调整增强视觉冲击力。' },
                    creativity: { score: 80, analysis: '拍摄题材有趣，但表现方式较为传统。可以尝试独特的视角或创意构图。' },
                    suggestions: [
                        '使用低角度拍摄增加视觉冲击力',
                        '尝试使用前景元素增加画面层次',
                        '注意寻找引导线来增强画面深度'
                    ]
                }
            ];

            // 随机选择一个分析结果
            const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
            
            setTimeout(() => {
                resolve(randomAnalysis);
            }, 1500);
        });
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