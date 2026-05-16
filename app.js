class DownloadApp {
    constructor() {
        this.files = SITE_CONFIG.files;
        this.filteredFiles = [...this.files];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderFiles();
        this.createParticles();
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.applyFilters();
        });

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.filteredFiles = this.files.filter(file => {
            const matchesFilter = this.currentFilter === 'all' || file.category === this.currentFilter;
            const matchesSearch = file.name.toLowerCase().includes(this.searchQuery);
            return matchesFilter && matchesSearch;
        });
        this.renderFiles();
    }

    getFileExtension(file) {
        const urlExt = file.downloadUrl.split('.').pop().toLowerCase().split('?')[0];
        if (urlExt && urlExt.length <= 10) {
            return urlExt;
        }
        return file.name.split('.').pop().toLowerCase();
    }

    generateColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return {
            bg: `linear-gradient(135deg, hsl(${h}, 65%, 55%), hsl(${(h + 40) % 360}, 65%, 45%))`,
            text: `hsl(${h}, 65%, 55%)`
        };
    }

    getFileCategoryIcon(category) {
        const icons = {
            document: 'DOC',
            software: 'APP',
            other: 'FILE'
        };
        return icons[category] || 'FILE';
    }

    formatFileSize(sizeStr) {
        return sizeStr;
    }

    renderFiles() {
        const fileList = document.getElementById('fileList');
        
        if (this.filteredFiles.length === 0) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <p>没有找到文件</p>
                </div>
            `;
            return;
        }

        fileList.innerHTML = this.filteredFiles.map((file, index) => {
            const ext = this.getFileExtension(file);
            const color = this.generateColor(ext);
            
            return `
                <div class="file-card" style="animation-delay: ${index * 0.1}s">
                    <div class="file-icon" style="background: ${color.bg}">
                        ${ext.toUpperCase().substring(0, 4)}
                    </div>
                    <div class="file-info">
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-meta">
                            <span class="file-date">${file.uploadDate}</span>
                        </div>
                    </div>
                    <a href="${file.downloadUrl}" class="download-btn" download target="_blank">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        下载
                    </a>
                </div>
            `;
        }).join('');
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(0, 212, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DownloadApp();
});
