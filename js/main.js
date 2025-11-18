// 主要功能：首页照片展示
class PhotoGallery {
    constructor() {
        this.photos = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPhotos();
    }

    setupEventListeners() {
        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });
    }

    async loadPhotos() {
        const loading = document.getElementById('loading');
        const gallery = document.getElementById('photoGallery');
        
        try {
            loading.style.display = 'block';
            
            // 从 Supabase 获取照片数据
            const { data: photos, error } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('加载照片失败:', error);
                this.showError('加载照片失败，请刷新页面重试');
                return;
            }

            this.photos = photos || [];
            this.renderPhotos();
            
        } catch (error) {
            console.error('加载照片时发生错误:', error);
            this.showError('网络错误，请检查连接后重试');
        } finally {
            loading.style.display = 'none';
        }
    }

    renderPhotos() {
        const gallery = document.getElementById('photoGallery');
        const filteredPhotos = this.filterPhotos(this.photos, this.currentFilter);
        
        if (filteredPhotos.length === 0) {
            gallery.innerHTML = `
                <div class="no-photos">
                    <p>暂无照片${this.currentFilter !== 'all' ? `（${this.getFilterName(this.currentFilter)}）` : ''}</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = filteredPhotos.map(photo => `
            <div class="photo-card" data-category="${photo.category}">
                <img src="${photo.image_url}" alt="${photo.title}" loading="lazy">
                <div class="photo-info">
                    <h3 class="photo-title">${this.escapeHtml(photo.title)}</h3>
                    <div class="photo-meta">
                        <span class="photo-category">${this.getCategoryName(photo.category)}</span>
                        <span class="photo-date">${this.formatDate(photo.created_at)}</span>
                    </div>
                    ${photo.description ? `<p class="photo-description">${this.escapeHtml(photo.description)}</p>` : ''}
                </div>
            </div>
        `).join('');

        // 添加点击事件
        gallery.querySelectorAll('.photo-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showPhotoDetail(filteredPhotos[index]);
            });
        });
    }

    filterPhotos(photos, filter) {
        if (filter === 'all') return photos;
        return photos.filter(photo => photo.category === filter);
    }

    handleFilter(filter) {
        // 更新当前筛选
        this.currentFilter = filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // 重新渲染
        this.renderPhotos();
    }

    showPhotoDetail(photo) {
        // 创建照片详情模态框
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        
        // 判断是否为 RAW 文件
        const isRawFile = photo.image_url && (
            photo.image_url.toLowerCase().endsWith('.cr3') || 
            photo.image_url.toLowerCase().endsWith('.cr2') || 
            photo.image_url.toLowerCase().endsWith('.nef') || 
            photo.image_url.toLowerCase().endsWith('.arw') ||
            photo.image_url.toLowerCase().endsWith('.raf') || 
            photo.image_url.toLowerCase().endsWith('.rw2') ||
            photo.image_url.toLowerCase().endsWith('.raw') || 
            photo.image_url.toLowerCase().endsWith('.dng')
        );
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-photo">
                    ${isRawFile ? `
                        <div class="raw-display">
                            <div class="raw-icon">📷</div>
                            <div class="raw-filename">${photo.image_url.split('/').pop()}</div>
                            <div class="raw-label">RAW格式文件</div>
                        </div>
                    ` : `
                        <img src="${photo.image_url}" alt="${photo.title}">
                    `}
                </div>
                <div class="modal-info">
                    <h2>${this.escapeHtml(photo.title)}</h2>
                    <div class="modal-meta">
                        <span class="photo-category">${this.getCategoryName(photo.category)}</span>
                        <span class="photo-date">${this.formatDate(photo.created_at)}</span>
                    </div>
                    ${photo.description ? `<p class="photo-description">${this.escapeHtml(photo.description)}</p>` : ''}
                    ${photo.location ? `<p class="photo-location">📍 ${this.escapeHtml(photo.location)}</p>` : ''}
                    ${photo.camera_info ? `<p class="photo-camera">📷 ${this.getCameraInfo(photo)}</p>` : ''}
                    <div class="modal-actions">
                        <button class="delete-btn" onclick="window.photoGallery.deletePhoto('${photo.id}', '${photo.image_url || ''}')">
                            🗑️ 删除照片
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    getCameraInfo(photo) {
        if (!photo.camera_info) return '未记录';
        const info = JSON.parse(photo.camera_info);
        return Object.entries(info)
            .filter(([key, value]) => value)
            .map(([key, value]) => `${this.getCameraFieldName(key)}: ${value}`)
            .join(', ');
    }

    getCameraFieldName(field) {
        const fieldNames = {
            camera: '相机',
            lens: '镜头',
            focal: '焦距',
            aperture: '光圈',
            shutter: '快门',
            iso: 'ISO'
        };
        return fieldNames[field] || field;
    }

    getCategoryName(category) {
        const categories = {
            landscape: '风光',
            portrait: '人像',
            street: '街拍',
            macro: '微距',
            wildlife: '野生动物',
            architecture: '建筑'
        };
        return categories[category] || category;
    }

    getFilterName(filter) {
        return this.getCategoryName(filter);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async deletePhoto(photoId, imageUrl) {
        // 确认删除
        const confirmed = confirm('确定要删除这张照片吗？此操作不可恢复。');
        if (!confirmed) return;
        
        try {
            // 关闭模态框
            const modal = document.querySelector('.photo-modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // 显示加载状态
            this.showNotificationMessage('正在删除照片...', 'info');
            
            // 1. 删除数据库记录
            const { error: dbError } = await supabase
                .from('photos')
                .delete()
                .eq('id', photoId);
            
            if (dbError) {
                throw new Error(`删除数据库记录失败: ${dbError.message}`);
            }
            
            // 2. 尝试删除存储文件（如果有的话）
            if (imageUrl) {
                try {
                    const filePath = imageUrl.split('/').pop();
                    const fullFilePath = `photos/${filePath}`;
                    
                    const { error: storageError } = await supabase.storage
                        .from('photos')
                        .remove([fullFilePath]);
                    
                    if (storageError) {
                        console.warn('删除存储文件失败:', storageError);
                        // 不抛出错误，因为数据库记录已删除
                    }
                } catch (storageError) {
                    console.warn('删除存储文件时出错:', storageError);
                }
            }
            
            // 3. 重新加载照片列表
            await this.loadPhotos();
            
            this.showNotificationMessage('✅ 照片删除成功！', 'success');
            
        } catch (error) {
            console.error('删除照片失败:', error);
            this.showNotificationMessage(`❌ 删除失败: ${error.message}`, 'error');
        }
    }

    showNotificationMessage(message, type = 'info') {
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
    }

    showError(message) {
        const gallery = document.getElementById('photoGallery');
        gallery.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">重试</button>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.photoGallery = new PhotoGallery();
});

// 工具函数
window.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

window.validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
};

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