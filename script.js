// Tsunami Simulator Game
class TsunamiSimulator {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.isPlaying = false;
        this.soundEnabled = true;
        this.waveHeight = 300;
        this.waveSpeed = 5;
        this.waveProgress = 0; // 0-100
        this.affectedCities = new Set();

        // Cities data (approximate positions and names)
        this.cities = [
            { name: 'Kiel', x: 0.45, y: 0.15, affected: false },
            { name: 'Rostock', x: 0.65, y: 0.12, affected: false },
            { name: 'Hamburg', x: 0.40, y: 0.22, affected: false },
            { name: 'Bremen', x: 0.30, y: 0.28, affected: false },
            { name: 'Berlin', x: 0.70, y: 0.28, affected: false },
            { name: 'Osnabrück', x: 0.15, y: 0.35, affected: false },
            { name: 'Hanover', x: 0.42, y: 0.38, affected: false },
            { name: 'Leipzig', x: 0.65, y: 0.42, affected: false },
            { name: 'Cologne', x: 0.18, y: 0.48, affected: false },
            { name: 'Dortmund', x: 0.25, y: 0.45, affected: false },
            { name: 'Erfurt', x: 0.50, y: 0.50, affected: false },
            { name: 'Frankfurt', x: 0.32, y: 0.58, affected: false },
            { name: 'Dresden', x: 0.75, y: 0.48, affected: false },
            { name: 'Nuremberg', x: 0.50, y: 0.68, affected: false },
            { name: 'Stuttgart', x: 0.32, y: 0.70, affected: false },
            { name: 'Munich', x: 0.50, y: 0.78, affected: false },
            { name: 'Freiburg', x: 0.25, y: 0.72, affected: false },
            { name: 'Passau', x: 0.70, y: 0.75, affected: false },
            { name: 'Saarbrücken', x: 0.22, y: 0.62, affected: false }
        ];

        // Wave origin (North Sea)
        this.waveOrigin = { x: 0.05, y: 0.15 };

        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();

        // Draw initial state
        this.draw();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEventListeners() {
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('closeMenuBtn').addEventListener('click', () => this.closeMenu());

        document.getElementById('heightSlider').addEventListener('input', (e) => {
            this.waveHeight = parseInt(e.target.value);
            document.getElementById('heightValue').textContent = this.waveHeight + 'm';
            this.updateTsunamiInfo();
            this.checkAffectedCities();
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.waveSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.waveSpeed + 'x';
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
        
        if (this.soundEnabled) {
            this.playSound('play');
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    toggleMenu() {
        const menuPopup = document.getElementById('menuPopup');
        menuPopup.classList.toggle('hidden');
    }

    closeMenu() {
        document.getElementById('menuPopup').classList.add('hidden');
    }

    reset() {
        this.waveProgress = 0;
        this.isPlaying = false;
        this.affectedCities.clear();
        this.cities.forEach(city => city.affected = false);
        document.getElementById('playBtn').textContent = '▶ Play';
        document.getElementById('affectedCount').textContent = '0';
        this.closeMenu();
        this.draw();
    }

    updateTsunamiInfo() {
        const feet = Math.round(this.waveHeight * 3.28084);
        document.getElementById('tsunamiHeight').textContent = 
            `${this.waveHeight}m / ${feet}ft`;
    }

    checkAffectedCities() {
        this.affectedCities.clear();
        const maxDistance = this.waveHeight / 500;
        
        this.cities.forEach(city => {
            const dx = city.x - this.waveOrigin.x;
            const dy = city.y - this.waveOrigin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            city.affected = distance <= maxDistance * (0.3 + this.waveProgress / 100 * 0.7);
            
            if (city.affected) {
                this.affectedCities.add(city.name);
            }
        });

        document.getElementById('affectedCount').textContent = this.affectedCities.size;
    }

    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'play') {
                oscillator.frequency.value = 440;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        } catch (e) {
            // Audio not available
        }
    }

    animate() {
        if (this.isPlaying) {
            // Increased speed: multiply waveSpeed by 2 for faster progression
            this.waveProgress += (this.waveSpeed * 1.2);
            
            if (this.waveProgress >= 100) {
                this.waveProgress = 100;
                this.isPlaying = false;
                document.getElementById('playBtn').textContent = '▶ Play';
            }

            this.checkAffectedCities();
        }

        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    draw() {
        // Clear canvas with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#1a3a52');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw map
        this.drawMap();

        // Draw tsunami wave
        this.drawTsunamiWave();

        // Draw cities
        this.drawCities();

        // Draw wave progress indicator
        this.drawProgressBar();
    }

    drawMap() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Draw land
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.85);
        
        // Add topographical shading
        this.ctx.fillStyle = 'rgba(45, 80, 22, 0.5)';
        this.ctx.fillRect(w * 0.25, h * 0.6, w * 0.3, h * 0.25);
        
        this.ctx.fillStyle = 'rgba(139, 101, 34, 0.4)';
        this.ctx.fillRect(w * 0.2, h * 0.65, w * 0.4, h * 0.2);
    }

    drawTsunamiWave() {
        const progress = this.waveProgress / 100;
        const waveRadius = Math.sqrt(progress) * Math.min(this.canvas.width, this.canvas.height) * 0.6;
        
        const originX = this.waveOrigin.x * this.canvas.width;
        const originY = this.waveOrigin.y * this.canvas.height;

        // Outer wave ring
        this.ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 - progress * 0.4})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(originX, originY, waveRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner wave glow
        this.ctx.fillStyle = `rgba(100, 200, 255, ${0.2 - progress * 0.1})`;
        this.ctx.beginPath();
        this.ctx.arc(originX, originY, waveRadius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Wave origin point
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(originX, originY, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCities() {
        this.cities.forEach(city => {
            const x = city.x * this.canvas.width;
            const y = city.y * this.canvas.height;

            // Draw city marker
            this.ctx.fillStyle = city.affected ? '#ff4444' : '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw city label
            this.ctx.fillStyle = city.affected ? '#ffff00' : '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            this.ctx.fillText(city.name, x, y - 12);
            this.ctx.shadowColor = 'transparent';
        });
    }

    drawProgressBar() {
        const barWidth = this.canvas.width * 0.3;
        const barHeight = 8;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height - 40;

        // Background
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.fillRect(barX, barY, barWidth * (this.waveProgress / 100), barHeight);

        // Border
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Progress text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(this.waveProgress)}%`, this.canvas.width / 2, barY - 10);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new TsunamiSimulator();
});
