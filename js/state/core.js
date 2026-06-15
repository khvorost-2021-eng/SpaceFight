// ==========================================
// БАЗОВАЯ ИНИЦИАЛИЗАЦИЯ И СОСТОЯНИЕ
// ==========================================
window.Game = window.Game || {};
Game.canvas = document.getElementById('gameCanvas');
Game.ctx = Game.canvas.getContext('2d');

// 🔧 CANVAS ВСЕГДА ПОЛНОЭКРАННЫЙ (и ПК, и мобильные)
function updateCanvasSize() {
    Game.canvas.width = window.innerWidth;
    Game.canvas.height = window.innerHeight;
    
    Game.canvas.style.width = window.innerWidth + 'px';
    Game.canvas.style.height = window.innerHeight + 'px';
    Game.canvas.style.top = '0px';
    Game.canvas.style.left = '0px';
    
    // Флаг для других модулей
    Game.isMobile = window.innerWidth <= 768;
    
    console.log(`📐 Canvas: ${Game.canvas.width}x${Game.canvas.height} (${Game.isMobile ? '📱 моб' : '💻 ПК'})`);
}
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);
window.addEventListener('orientationchange', () => {
    setTimeout(updateCanvasSize, 100);
});

// Состояния игры
Game.STATE = {
    MENU: 'menu',
    LEVEL_SELECT: 'levelSelect',
    SHOP: 'shop',
    PROFILE: 'profile',
    ARCADE: 'arcade',
    CAMPAIGN: 'campaign',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete',
    DYING: 'dying'
};

// Игровое состояние
Game.state = {
    currentState: Game.STATE.MENU,
    mode: null,
    score: 0,
    hp: 3,
    maxHp: 3,
    level: 1,
    coinsEarned: 0,
    xpEarned: 0,
    shakeAmount: 0,
    invulnerable: 0,
    lastPlayerX: 0,
    lastPlayerY: 0,
    playerVX: 0,
    playerVY: 0,
    currentWave: 0,
    totalWaves: 0,
    waveState: 'IDLE',
    waveTimer: 0,
    waveAnnouncement: '',
    announcementTimer: 0,
    levelWaves: [],
    currentWaveConfig: null,
    deathAnimationTimer: 0,
    deathAnimationDuration: 180,
    isPlayerDead: false
};

// Позиция мыши/тача
Game.mouse = { x: Game.canvas.width / 2, y: Game.canvas.height / 2 };

// Игрок
Game.player = {
    x: Game.canvas.width / 2,
    y: Game.canvas.height / 2,
    rotation: 0,
    targetRotation: 0,
    flameOffset: 0,
    flameSpeed: 0.15,
    visible: true
};

// Массивы сущностей
Game.bullets = [];
Game.enemyBullets = [];
Game.enemies = [];
Game.particles = [];
Game.drones = [];
Game.stars = [];

// Инициализация звёзд
for (let i = 0; i < 200; i++) {
    Game.stars.push({
        x: Math.random() * Game.canvas.width,
        y: Math.random() * Game.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        brightness: Math.random()
    });
}

console.log('✅ state/core.js загружен');