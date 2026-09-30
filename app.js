class DownloadApp {
    constructor() {
        this.files = [...SITE_CONFIG.files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        this.filteredFiles = [...this.files];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderFiles();
        this.startClock();
        this.setupAmbientAudio();
        this.initThreeScene();
        this.setupMainMenu();
        if (window.anime) {
            anime({ targets: ['.topbar', '.title-kicker', '#page-title', '.title-subtitle', '.title-rule', '.main-menu', '.menu-hint'], opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(170, { start: 150 }), duration: 1500, easing: 'easeOutExpo' });
            anime({ targets: '.emblem', opacity: [.2, .85], scale: [.94, 1], duration: 3000, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
        }
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (event) => { this.searchQuery = event.target.value.toLowerCase().trim(); this.applyFilters(); });
        document.addEventListener('keydown', (event) => { if (event.key === '/' && document.activeElement !== searchInput) { event.preventDefault(); searchInput.focus(); } });
        document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); this.currentFilter = tab.dataset.filter; this.applyFilters();
        }));
        document.getElementById('randomFile').addEventListener('click', () => {
            const pool = this.filteredFiles.length ? this.filteredFiles : this.files;
            const selected = pool[Math.floor(Math.random() * pool.length)];
            if (selected) window.open(selected.downloadUrl, '_blank', 'noopener');
        });
    }

    setupMainMenu() {
        const choices = [...document.querySelectorAll('.menu-choice')];
        const select = (index) => {
            const next = (index + choices.length) % choices.length;
            choices.forEach((choice, i) => choice.classList.toggle('selected', i === next));
        };
        choices.forEach((choice, index) => choice.addEventListener('mouseenter', () => select(index)));
        document.addEventListener('keydown', (event) => {
            const activeIndex = Math.max(0, choices.findIndex((choice) => choice.classList.contains('selected')));
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault(); select(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
            }
            if (event.key === 'Enter' && document.activeElement === document.body) {
                const selected = choices[activeIndex];
                if (selected?.tagName === 'A') window.location.hash = selected.getAttribute('href');
                else selected?.click();
            }
        });
        const screen = document.querySelector('.title-screen');
        screen.addEventListener('pointermove', (event) => {
            const x = (event.clientX / window.innerWidth - .5) * 2;
            const y = (event.clientY / window.innerHeight - .5) * 2;
            screen.style.setProperty('--parallax-x', `${x * 9}px`);
            screen.style.setProperty('--parallax-y', `${y * 7}px`);
        });
    }

    applyFilters() {
        this.filteredFiles = this.files.filter((file) => (this.currentFilter === 'all' || file.category === this.currentFilter) && file.name.toLowerCase().includes(this.searchQuery));
        this.renderFiles();
    }

    getFileExtension(file) {
        const urlExt = file.downloadUrl.split('.').pop().toLowerCase().split('?')[0];
        return urlExt && urlExt.length <= 10 ? urlExt : file.name.split('.').pop().toLowerCase();
    }

    getFileCategoryIcon(category) { return { document: 'DOC', software: 'APP', other: 'FILE' }[category] || 'FILE'; }

    renderFiles() {
        const fileList = document.getElementById('fileList');
        document.getElementById('fileCount').textContent = String(this.filteredFiles.length).padStart(2, '0');
        if (!this.filteredFiles.length) {
            fileList.innerHTML = '<div class="empty-state"><strong>没有找到文件</strong><span>换个关键词，或者切换一个分类试试。</span></div>';
            return;
        }
        fileList.innerHTML = this.filteredFiles.map((file, index) => {
            const ext = this.getFileExtension(file).toUpperCase().slice(0, 4);
            return `<article class="file-card" style="--delay:${index * 45}ms"><div class="file-top"><span class="file-icon">${ext || this.getFileCategoryIcon(file.category)}</span><span class="file-number">${String(index + 1).padStart(2, '0')}</span></div><div class="file-name" title="${this.escape(file.name)}">${this.escape(file.name)}</div><div class="file-meta"><span class="file-date">${file.uploadDate}</span><a class="download-btn" href="${file.downloadUrl}" download target="_blank" rel="noopener"><span>下载文件</span><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 20h16"/></svg></a></div></article>`;
        }).join('');
        this.bindCardInteractions();
        if (window.anime) anime({ targets: '.file-card', opacity: [0, 1], translateY: [14, 0], delay: anime.stagger(45), duration: 550, easing: 'easeOutCubic' });
    }

    escape(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }

    bindCardInteractions() {
        document.querySelectorAll('.file-card').forEach((card) => card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect(); const x = event.clientX - bounds.left; const y = event.clientY - bounds.top;
            card.style.setProperty('--mx', `${x}px`); card.style.setProperty('--my', `${y}px`);
            if (window.matchMedia('(pointer: fine)').matches) card.style.transform = `perspective(800px) rotateX(${(y / bounds.height - .5) * -3}deg) rotateY(${(x / bounds.width - .5) * 4}deg) translateY(-4px)`;
        }));
        document.querySelectorAll('.file-card').forEach((card) => card.addEventListener('pointerleave', () => { card.style.transform = ''; }));
    }

    startClock() { const clock = document.getElementById('clock'); const update = () => { clock.textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()); }; update(); setInterval(update, 1000); }

    setupAmbientAudio() {
        const audio = document.getElementById('ambientAudio'); const toggle = document.getElementById('audioToggle');
        const label = toggle.querySelector('.audio-label');
        const setState = (playing) => { toggle.classList.toggle('is-playing', playing); toggle.setAttribute('aria-pressed', String(playing)); toggle.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐'); if (label) label.textContent = playing ? '安放心绪' : '唤醒回响'; };
        const play = () => audio.play().then(() => setState(true)).catch(() => setState(false));
        toggle.addEventListener('click', () => { if (audio.paused) play(); else { audio.pause(); setState(false); } });
        const unlock = () => { if (audio.paused) play(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
        window.addEventListener('pointerdown', unlock, { once: true }); window.addEventListener('keydown', unlock, { once: true });
        play();
    }

    initThreeScene() {
        if (!window.THREE) return;
        const canvas = document.getElementById('scene');
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(58, 1, .1, 100);
        camera.position.z = 7.8;

        const palette = [new THREE.Color('#d7f7ff'), new THREE.Color('#9de7ff'), new THREE.Color('#ffd18a'), new THREE.Color('#fff2ce')];
        const layers = [];
        const makeStarLayer = (count, radius, depth, size, opacity, colorBias) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const r = radius * Math.sqrt(Math.random());
                const a = Math.random() * Math.PI * 2;
                positions[i * 3] = Math.cos(a) * r;
                positions[i * 3 + 1] = Math.sin(a) * r * (.5 + Math.random() * .55);
                positions[i * 3 + 2] = (Math.random() - .5) * depth;
                const color = palette[Math.min(palette.length - 1, Math.max(0, Math.floor(Math.random() * palette.length) + colorBias))];
                colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            const material = new THREE.PointsMaterial({ size, transparent: true, opacity, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
            const points = new THREE.Points(geometry, material);
            scene.add(points); layers.push(points);
            return points;
        };

        makeStarLayer(2600, 8.8, 8, .018, .52, 0);
        makeStarLayer(1050, 6.6, 5, .036, .72, 1);
        makeStarLayer(360, 5.2, 3, .075, .9, 2);

        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaCount = 1500;
        const nebulaPositions = new Float32Array(nebulaCount * 3);
        const nebulaColors = new Float32Array(nebulaCount * 3);
        for (let i = 0; i < nebulaCount; i++) {
            const t = Math.random() * Math.PI * 9;
            const radius = .18 + Math.pow(Math.random(), .65) * 5.7;
            const spiral = t + radius * .42;
            nebulaPositions[i * 3] = Math.cos(spiral) * radius + (Math.random() - .5) * .5;
            nebulaPositions[i * 3 + 1] = (Math.random() - .5) * (.25 + radius * .12);
            nebulaPositions[i * 3 + 2] = Math.sin(spiral) * radius * .52 - 1;
            const color = i % 5 === 0 ? palette[2] : palette[1];
            nebulaColors[i * 3] = color.r; nebulaColors[i * 3 + 1] = color.g; nebulaColors[i * 3 + 2] = color.b;
        }
        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
        const nebula = new THREE.Points(nebulaGeometry, new THREE.PointsMaterial({ size: .028, transparent: true, opacity: .42, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        nebula.rotation.z = -.28; scene.add(nebula); layers.push(nebula);

        const linePositions = [];
        for (let i = 0; i < 180; i++) {
            const radius = 2 + Math.random() * 6;
            const angle = Math.random() * Math.PI * 2;
            linePositions.push(Math.cos(angle) * radius, (Math.random() - .5) * 2.3, Math.sin(angle) * radius * .5);
            linePositions.push(Math.cos(angle + .024) * (radius + .12), (Math.random() - .5) * 2.3, Math.sin(angle + .024) * (radius + .12) * .5);
        }
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const orbitLines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: '#85d9ef', transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false }));
        orbitLines.rotation.x = .42; scene.add(orbitLines); layers.push(orbitLines);

        const pointer = { x: 0, y: 0 };
        window.addEventListener('pointermove', (event) => { pointer.x = (event.clientX / window.innerWidth - .5) * 2; pointer.y = (event.clientY / window.innerHeight - .5) * 2; });
        const resize = () => { renderer.setSize(window.innerWidth, window.innerHeight, false); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); };
        resize(); window.addEventListener('resize', resize);
        const render = (time) => {
            layers[0].rotation.y = time * .000018 + pointer.x * .025; layers[0].rotation.x = pointer.y * .018;
            layers[1].rotation.y = -time * .000035 + pointer.x * .04; layers[1].rotation.x = pointer.y * .03;
            layers[2].rotation.y = time * .00006; layers[2].rotation.x = pointer.y * .05;
            nebula.rotation.y = time * .000035 + pointer.x * .08; nebula.rotation.x = pointer.y * .06;
            orbitLines.rotation.z = time * .00002; orbitLines.rotation.y = pointer.x * .04;
            renderer.render(scene, camera); requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
}

document.addEventListener('DOMContentLoaded', () => new DownloadApp());
