// 照片上传功能
class PhotoUploader {
    constructor() {
        this.currentFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('photoFile');
        const fileUpload = document.getElementById('fileUpload');
        const removeBtn = document.getElementById('removeImage');
        const form = document.getElementById('uploadForm');

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

        // 表单提交
        form.addEventListener('submit', (e) => this.handleSubmit(e));
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

        // 验证文件大小
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            showNotification('文件大小不能超过 10MB', 'error');
            return;
        }

        this.currentFile = file;
        this.showPreview(file);
    }

    showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.querySelector('.file-upload-label').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.currentFile = null;
        document.getElementById('photoFile').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.querySelector('.file-upload-label').style.display = 'block';
        document.getElementById('previewImg').src = '';
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.currentFile) {
            showNotification('请选择要上传的照片', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        try {
            // 显示加载状态
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';

            // 上传文件到 Supabase Storage
            const fileUrl = await this.uploadFile(this.currentFile);
            
            // 收集表单数据
            const formData = this.collectFormData();
            formData.image_url = fileUrl;

            // 保存到数据库
            await this.saveToDatabase(formData);

            showNotification('照片上传成功！', 'success');
            
            // 重置表单
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('上传失败:', error);
            showNotification('上传失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    async uploadFile(file) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `photos/${fileName}`;
        const BUCKET_NAME = 'photos';

        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw new Error(`上传文件失败: ${error.message}`);
            }

            // 获取公共 URL
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return publicUrl;

        } catch (error) {
            console.error('文件上传错误:', error);
            throw error;
        }
    }

    collectFormData() {
        const form = document.getElementById('uploadForm');
        const formData = new FormData(form);
        
        // 基本字段
        const data = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description') || null,
            location: formData.get('location') || null,
            created_at: new Date().toISOString()
        };

        // 相机参数
        const cameraInfo = {
            camera: formData.get('camera') || null,
            lens: formData.get('lens') || null,
            focal: formData.get('focal') || null,
            aperture: formData.get('aperture') || null,
            shutter: formData.get('shutter') || null,
            iso: formData.get('iso') || null
        };

        // 只保存非空的参数
        const nonEmptyCameraInfo = Object.fromEntries(
            Object.entries(cameraInfo).filter(([key, value]) => value && value.trim())
        );

        if (Object.keys(nonEmptyCameraInfo).length > 0) {
            data.camera_info = JSON.stringify(nonEmptyCameraInfo);
        }

        return data;
    }

    async saveToDatabase(data) {
        try {
            const { error } = await supabase
                .from(TABLES.PHOTOS)
                .insert([data]);

            if (error) {
                throw new Error(`保存数据失败: ${error.message}`);
            }

        } catch (error) {
            console.error('数据库保存错误:', error);
            throw error;
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
    new PhotoUploader();
});