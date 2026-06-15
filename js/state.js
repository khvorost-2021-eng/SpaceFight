window.Game = window.Game || {};

// ==========================================
// 1. БАЗОВАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================
Game.canvas = document.getElementById('gameCanvas');
Game.ctx = Game.canvas.getContext('2d');
Game.canvas.width = window.innerWidth;
Game.canvas.height = window.innerHeight;

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

Game.mouse = { x: Game.canvas.width / 2, y: Game.canvas.height / 2 };

Game.player = {
    x: Game.canvas.width / 2,
    y: Game.canvas.height / 2,
    rotation: 0,
    targetRotation: 0,
    flameOffset: 0,
    flameSpeed: 0.15,
    visible: true
};

Game.bullets = [];
Game.enemyBullets = [];
Game.enemies = [];
Game.particles = [];
Game.drones = [];
Game.stars = [];

for (let i = 0; i < 200; i++) {
    Game.stars.push({
        x: Math.random() * Game.canvas.width,
        y: Math.random() * Game.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        brightness: Math.random()
    });
}

// ==========================================
// 2. ДАННЫЕ ИГРОКА И ПРОГРЕССИЯ
// ==========================================
Game.playerData = {
    coins: 0,
    skins: ['standard'],
    selectedSkin: 'standard',
    drones: [],
    selectedDrones: [],
    levelsCompleted: [],
    maxLevelUnlocked: 1,
    xp: 0,
    playerLevel: 1,
    slotsUnlocked: [true, false, false, false, false],
    pilotName: 'Пилот',
    totalScore: 0
};

// === РАНГИ ===
Game.RANKS = [
    { minLevel: 1,  key: 'recruit',    icon: '🎖️' },
    { minLevel: 5,  key: 'cadet',      icon: '⭐' },
    { minLevel: 10, key: 'lieutenant', icon: '🌟' },
    { minLevel: 15, key: 'captain',    icon: '💫' },
    { minLevel: 20, key: 'commander',  icon: '👑' }
];

Game.getRank = function(level) {
    let currentRank = Game.RANKS[0];
    for (const rank of Game.RANKS) {
        if (level >= rank.minLevel) currentRank = rank;
    }
    return { ...currentRank, name: LANG.ranks[currentRank.key] };
};

Game.getNextRank = function(level) {
    for (const rank of Game.RANKS) {
        if (level < rank.minLevel) return rank;
    }
    return null;
};

// === ОПЫТ И УРОВНИ ===
Game.calculatePlayerLevel = function(xp) {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
};

Game.getXPForLevel = function(level) {
    return Math.pow(level - 1, 2) * 50;
};

Game.getXPProgress = function() {
    const currentLevelXP = Game.getXPForLevel(Game.playerData.playerLevel);
    const nextLevelXP = Game.getXPForLevel(Game.playerData.playerLevel + 1);
    const currentXP = Game.playerData.xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return {
        current: currentXP,
        needed: neededXP,
        percent: Math.min(100, (currentXP / neededXP) * 100)
    };
};

Game.addXP = function(amount) {
    const oldLevel = Game.playerData.playerLevel;
    Game.playerData.xp += amount;
    Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
    if (Game.playerData.playerLevel > oldLevel) {
        console.log(`🎉 Уровень повышен! ${oldLevel} → ${Game.playerData.playerLevel}`);
    }
    Game.savePlayerData();
    return Game.playerData.playerLevel > oldLevel;
};

// === СЛОТЫ ДРОНОВ ===
Game.SLOT_CONFIG = [
    { index: 0, price: 0,    requiredLevel: 1,  name: 'Слот 1' },
    { index: 1, price: 300,  requiredLevel: 5,  name: 'Слот 2' },
    { index: 2, price: 800,  requiredLevel: 10, name: 'Слот 3' },
    { index: 3, price: 2000, requiredLevel: 15, name: 'Слот 4' },
    { index: 4, price: 5000, requiredLevel: 20, name: 'Слот 5' }
];

Game.canUnlockSlot = function(slotIndex) {
    const config = Game.SLOT_CONFIG[slotIndex];
    if (!config) return false;
    if (Game.playerData.slotsUnlocked[slotIndex]) return false;
    if (Game.playerData.playerLevel < config.requiredLevel) return false;
    if (Game.playerData.coins < config.price) return false;
    return true;
};

Game.unlockSlot = function(slotIndex) {
    if (!Game.canUnlockSlot(slotIndex)) return false;
    const config = Game.SLOT_CONFIG[slotIndex];
    Game.playerData.coins -= config.price;
    Game.playerData.slotsUnlocked[slotIndex] = true;
    Game.savePlayerData();
    return true;
};

Game.getMaxDroneSlots = function() {
    return Game.playerData.slotsUnlocked.filter(s => s).length;
};

// ==========================================
// 3. КОНФИГУРАЦИЯ ДРОНОВ (ОСЛАБЛЕННЫЕ)
// ==========================================
Game.DRONE_TYPES = {
    defender: {
        id: 'defender', name: 'Защитник', price: 150, color: '#00ffff',
        hp: 1, damage: 0.3, fireRate: 120, bulletSpeed: 7,
        orbitRadius: 60, orbitSpeed: 0.02, accuracy: 0.55,
        description: LANG.droneDescriptions.defender, priority: 'closest'
    },
    interceptor: {
        id: 'interceptor', name: 'Перехватчик', price: 250, color: '#ff8800',
        hp: 1, damage: 0.25, fireRate: 50, bulletSpeed: 10,
        orbitRadius: 70, orbitSpeed: 0.035, accuracy: 0.50,
        description: LANG.droneDescriptions.interceptor, priority: 'fast'
    },
    heavy: {
        id: 'heavy', name: 'Тяжёлый', price: 400, color: '#aa00ff',
        hp: 2, damage: 0.5, fireRate: 240, bulletSpeed: 6,
        orbitRadius: 55, orbitSpeed: 0.012, accuracy: 0.60,
        description: LANG.droneDescriptions.heavy, priority: 'closest', volley: 2
    },
    healer: {
        id: 'healer', name: 'Хилер', price: 800, color: '#00ff88',
        hp: 1, damage: 0, fireRate: 0, bulletSpeed: 0,
        orbitRadius: 50, orbitSpeed: 0.015, accuracy: 0,
        description: LANG.droneDescriptions.healer, priority: 'none',
        healInterval: 1800, healAmount: 1
    }
};

// ==========================================
// 4. SVG АССЕТЫ
// ==========================================
const SHIP_SVGS = {
    player: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 70" width="120" height="140">
      <defs><filter id="blueGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-25 L8,-10 L6,5 L4,20 L-4,20 L-6,5 L-8,-10 Z" fill="#1a1a4a" stroke="#4488ff" stroke-width="1.5" filter="url(#blueGlow)"/>
      <path d="M-6,-5 L-22,0 L-18,10 L-8,8 Z" fill="#1a1a4a" stroke="#4488ff" stroke-width="1.5"/>
      <path d="M6,-5 L22,0 L18,10 L8,8 Z" fill="#1a1a4a" stroke="#4488ff" stroke-width="1.5"/>
      <rect x="-3" y="20" width="2" height="8" fill="#4488ff"/>
      <rect x="1" y="20" width="2" height="8" fill="#4488ff"/>
      <path d="M-2,28 L0,36 L2,28 Z" fill="#88ccff"/>
      <ellipse cx="0" cy="-10" rx="4" ry="6" fill="#88ccff"/>
    </svg>`,
    normal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 70" width="120" height="140">
      <path d="M0,-20 L8,-10 L6,8 L4,22 L-4,22 L-6,8 L-8,-10 Z" fill="#444444" stroke="#888888" stroke-width="1.5"/>
      <path d="M-6,3 L-20,8 L-18,16 L-8,12 Z" fill="#555555" stroke="#888888" stroke-width="1.5"/>
      <path d="M6,3 L20,8 L18,16 L8,12 Z" fill="#555555" stroke="#888888" stroke-width="1.5"/>
      <rect x="-3" y="22" width="2" height="6" fill="#aa0000"/>
      <rect x="1" y="22" width="2" height="6" fill="#aa0000"/>
      <path d="M-2,28 L0,34 L2,28 Z" fill="#ff4400"/>
      <ellipse cx="0" cy="-8" rx="3" ry="5" fill="#222222"/>
    </svg>`,
    fast: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-35 -30 70 80" width="140" height="160">
      <defs><filter id="redGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-28 Q10,-15 8,0 L6,18 L3,28 L-3,28 L-6,18 L-8,0 Q-10,-15 0,-28 Z" fill="#cc0000" stroke="#ff4444" stroke-width="1.5" filter="url(#redGlow)"/>
      <path d="M-6,-2 L-28,3 L-22,14 L-8,10 Z" fill="#aa0000" stroke="#ff4444" stroke-width="1.5"/>
      <path d="M6,-2 L28,3 L22,14 L8,10 Z" fill="#aa0000" stroke="#ff4444" stroke-width="1.5"/>
      <rect x="-2" y="28" width="4" height="5" fill="#ff6600"/>
      <path d="M-1,33 L1,33 L0,42 Z" fill="#ffaa00"/>
      <ellipse cx="0" cy="-14" rx="4" ry="6" fill="#000000"/>
    </svg>`,
    armored: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -30 80 80" width="160" height="160">
      <defs><filter id="yellowGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-28 L14,-18 L16,0 L14,22 L7,32 L-7,32 L-14,22 L-16,0 L-14,-18 Z" fill="#1a1a1a"/>
      <path d="M0,-28 L14,-18 L16,0 L14,22 L7,32 L-7,32 L-14,22 L-16,0 L-14,-18 Z" fill="none" stroke="#ffff00" stroke-width="2" filter="url(#yellowGlow)"/>
      <rect x="-10" y="-14" width="20" height="6" fill="#333333" stroke="#555555" stroke-width="0.5"/>
      <rect x="-12" y="4" width="24" height="6" fill="#333333" stroke="#555555" stroke-width="0.5"/>
      <rect x="-10" y="16" width="20" height="6" fill="#333333" stroke="#555555" stroke-width="0.5"/>
      <path d="M-14,-4 L-32,0 L-28,18 L-16,16 Z" fill="#2a2a2a" stroke="#ffff00" stroke-width="1"/>
      <path d="M14,-4 L32,0 L28,18 L16,16 Z" fill="#2a2a2a" stroke="#ffff00" stroke-width="1"/>
      <rect x="-5" y="32" width="3" height="6" fill="#444444"/>
      <rect x="2" y="32" width="3" height="6" fill="#444444"/>
      <ellipse cx="0" cy="-10" rx="5" ry="7" fill="#000000"/>
    </svg>`,
    boss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -60 160 180" width="320" height="360">
      <defs>
        <filter id="bossGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="eyeGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M0,-55 L35,-35 L45,0 L40,45 L25,75 L-25,75 L-40,45 L-45,0 L-35,-35 Z" fill="#0a0a0a"/>
      <path d="M0,-55 L35,-35 L45,0 L40,45 L25,75 L-25,75 L-40,45 L-45,0 L-35,-35 Z" fill="none" stroke="#ff0000" stroke-width="3" filter="url(#bossGlow)"/>
      <rect x="-30" y="-28" width="60" height="12" fill="#1a1a1a" stroke="#444444" stroke-width="1"/>
      <rect x="-35" y="0" width="70" height="12" fill="#1a1a1a" stroke="#444444" stroke-width="1"/>
      <rect x="-30" y="26" width="60" height="12" fill="#1a1a1a" stroke="#444444" stroke-width="1"/>
      <path d="M-35,-18 L-70,-8 L-65,28 L-40,22 Z" fill="#151515" stroke="#ff0000" stroke-width="2"/>
      <path d="M35,-18 L70,-8 L65,28 L40,22 Z" fill="#151515" stroke="#ff0000" stroke-width="2"/>
      <rect x="-28" y="75" width="6" height="8" fill="#666666"/><rect x="-26" y="83" width="2" height="6" fill="#ff4400"/>
      <rect x="-16" y="75" width="6" height="8" fill="#666666"/><rect x="-14" y="83" width="2" height="6" fill="#ff4400"/>
      <rect x="-3" y="75" width="6" height="8" fill="#666666"/><rect x="-1" y="83" width="2" height="6" fill="#ff4400"/>
      <rect x="10" y="75" width="6" height="8" fill="#666666"/><rect x="12" y="83" width="2" height="6" fill="#ff4400"/>
      <rect x="22" y="75" width="6" height="8" fill="#666666"/><rect x="24" y="83" width="2" height="6" fill="#ff4400"/>
      <ellipse cx="0" cy="-18" rx="14" ry="18" fill="#000000"/>
      <ellipse cx="0" cy="-18" rx="7" ry="9" fill="#ff0000" filter="url(#eyeGlow)"/>
    </svg>`
};

const DRONE_SVGS = {
    defender: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 45" width="80" height="90">
      <defs><filter id="defGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-15 L6,-5 L5,8 L3,15 L-3,15 L-5,8 L-6,-5 Z" fill="#1a2a4a" stroke="#00ffff" stroke-width="1.2" filter="url(#defGlow)"/>
      <path d="M-4,-2 L-14,2 L-12,8 L-6,6 Z" fill="#1a2a4a" stroke="#00ffff" stroke-width="1"/>
      <path d="M4,-2 L14,2 L12,8 L6,6 Z" fill="#1a2a4a" stroke="#00ffff" stroke-width="1"/>
      <rect x="-1" y="15" width="2" height="4" fill="#00ffff"/>
      <circle cx="0" cy="-5" r="2" fill="#88ccff"/>
    </svg>`,
    interceptor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 50" width="80" height="100">
      <defs><filter id="intGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-18 Q5,-10 4,0 L3,12 L2,18 L-2,18 L-3,12 L-4,0 Q-5,-10 0,-18 Z" fill="#4a1a1a" stroke="#ff8800" stroke-width="1.2" filter="url(#intGlow)"/>
      <path d="M-3,0 L-16,3 L-13,10 L-5,7 Z" fill="#4a1a1a" stroke="#ff8800" stroke-width="1"/>
      <path d="M3,0 L16,3 L13,10 L5,7 Z" fill="#4a1a1a" stroke="#ff8800" stroke-width="1"/>
      <rect x="-1" y="18" width="2" height="3" fill="#ff8800"/>
      <path d="M-0.5,21 L0.5,21 L0,26 Z" fill="#ffcc00"/>
      <circle cx="0" cy="-8" r="1.5" fill="#ff4400"/>
    </svg>`,
    heavy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -20 50 50" width="100" height="100">
      <defs><filter id="hvGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-18 L10,-10 L11,5 L9,18 L5,22 L-5,22 L-9,18 L-11,5 L-10,-10 Z" fill="#2a1a3a" stroke="#aa00ff" stroke-width="1.5" filter="url(#hvGlow)"/>
      <rect x="-8" y="-8" width="16" height="4" fill="#3a2a4a" stroke="#555" stroke-width="0.5"/>
      <rect x="-9" y="4" width="18" height="4" fill="#3a2a4a" stroke="#555" stroke-width="0.5"/>
      <path d="M-9,-2 L-20,1 L-17,12 L-10,10 Z" fill="#2a1a3a" stroke="#aa00ff" stroke-width="1"/>
      <path d="M9,-2 L20,1 L17,12 L10,10 Z" fill="#2a1a3a" stroke="#aa00ff" stroke-width="1"/>
      <rect x="-4" y="22" width="2" height="4" fill="#aa00ff"/>
      <rect x="2" y="22" width="2" height="4" fill="#aa00ff"/>
      <circle cx="0" cy="-5" r="3" fill="#440066"/>
      <circle cx="0" cy="-5" r="1.5" fill="#dd66ff"/>
    </svg>`,
    healer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 45" width="80" height="90">
      <defs><filter id="hlGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M0,-15 L7,-5 L6,8 L4,15 L-4,15 L-6,8 L-7,-5 Z" fill="#1a3a2a" stroke="#00ff88" stroke-width="1.2" filter="url(#hlGlow)"/>
      <path d="M-5,-2 L-15,2 L-13,8 L-7,6 Z" fill="#1a3a2a" stroke="#00ff88" stroke-width="1"/>
      <path d="M5,-2 L15,2 L13,8 L7,6 Z" fill="#1a3a2a" stroke="#00ff88" stroke-width="1"/>
      <rect x="-1" y="15" width="2" height="4" fill="#00ff88"/>
      <rect x="-1.5" y="-9" width="3" height="8" fill="#ffffff"/>
      <rect x="-4" y="-6.5" width="8" height="3" fill="#ffffff"/>
    </svg>`
};

Game.ships = {};
Game.shipsLoaded = false;
Game.droneImages = {};
Game.droneImagesLoaded = false;

Game.loadShips = function() {
    return new Promise((resolve) => {
        const keys = Object.keys(SHIP_SVGS);
        let loaded = 0;
        const check = () => { if (++loaded === keys.length) { Game.shipsLoaded = true; resolve(); } };
        keys.forEach(key => {
            try {
                const blob = new Blob([SHIP_SVGS[key]], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => { Game.ships[key] = img; check(); };
                img.onerror = () => check();
                img.src = url;
            } catch (e) { check(); }
        });
    });
};

Game.loadDroneImages = function() {
    return new Promise((resolve) => {
        const keys = Object.keys(DRONE_SVGS);
        let loaded = 0;
        const check = () => { if (++loaded === keys.length) { Game.droneImagesLoaded = true; resolve(); } };
        keys.forEach(key => {
            try {
                const blob = new Blob([DRONE_SVGS[key]], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => { Game.droneImages[key] = img; check(); };
                img.onerror = () => check();
                img.src = url;
            } catch (e) { check(); }
        });
    });
};

// ==========================================
// 5. АУДИО СИСТЕМА
// ==========================================
Game.audioCtx = null;
Game.bgMusic = null;
Game.bgMusicGain = null;
Game.masterGain = null;
Game.isAudioInitialized = false;

Game.initAudio = function() {
    if (Game.isAudioInitialized) return;
    try {
        Game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        Game.masterGain = Game.audioCtx.createGain();
        Game.masterGain.gain.value = 0.5;
        Game.masterGain.connect(Game.audioCtx.destination);
        Game.bgMusicGain = Game.audioCtx.createGain();
        Game.bgMusicGain.gain.value = 0.15;
        Game.bgMusicGain.connect(Game.masterGain);
        Game.startBackgroundMusic();
        Game.isAudioInitialized = true;
    } catch (e) { console.error('Audio init error:', e); }
};

Game.startBackgroundMusic = function() {
    if (!Game.audioCtx) return;
    const playNote = (freq, startTime, duration, type = 'sine') => {
        const osc = Game.audioCtx.createOscillator();
        const gain = Game.audioCtx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain); gain.connect(Game.bgMusicGain);
        osc.start(startTime); osc.stop(startTime + duration);
    };
    const loop = () => {
        if (!Game.audioCtx) return;
        const now = Game.audioCtx.currentTime;
        playNote(55, now, 2, 'sawtooth'); playNote(55, now + 2, 2, 'sawtooth');
        playNote(65.41, now + 4, 2, 'sawtooth'); playNote(73.42, now + 6, 2, 'sawtooth');
        playNote(220, now, 0.5, 'sine'); playNote(261.63, now + 0.5, 0.5, 'sine');
        playNote(329.63, now + 1, 0.5, 'sine'); playNote(392, now + 1.5, 0.5, 'sine');
        playNote(440, now + 2, 1, 'sine'); playNote(392, now + 3, 0.5, 'sine');
        playNote(329.63, now + 3.5, 0.5, 'sine'); playNote(293.66, now + 4, 1, 'sine');
        playNote(261.63, now + 5, 1, 'sine'); playNote(220, now + 6, 2, 'sine');
        Game.bgMusic = setTimeout(loop, 8000);
    };
    loop();
};

Game.stopBackgroundMusic = function() { if (Game.bgMusic) { clearTimeout(Game.bgMusic); Game.bgMusic = null; } };

Game.playShootSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator(); const gain = Game.audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain); gain.connect(Game.masterGain); osc.start(now); osc.stop(now + 0.1);
};

Game.playDroneShootSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator(); const gain = Game.audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain); gain.connect(Game.masterGain); osc.start(now); osc.stop(now + 0.08);
};

Game.playHealSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator(); const gain = Game.audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.3);
    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain); gain.connect(Game.masterGain); osc.start(now); osc.stop(now + 0.3);
};

Game.playHitSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator(); const gain = Game.audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 150;
    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain); gain.connect(Game.masterGain); osc.start(now); osc.stop(now + 0.15);
};

Game.playExplosionSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc1 = Game.audioCtx.createOscillator(); const gain1 = Game.audioCtx.createGain();
    osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(100, now); osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain1.gain.setValueAtTime(0.4, now); gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1); gain1.connect(Game.masterGain); osc1.start(now); osc1.stop(now + 0.3);
    const bufferSize = Game.audioCtx.sampleRate * 0.3;
    const buffer = Game.audioCtx.createBuffer(1, bufferSize, Game.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
    const noise = Game.audioCtx.createBufferSource(); const noiseGain = Game.audioCtx.createGain();
    noise.buffer = buffer; noiseGain.gain.setValueAtTime(0.3, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    noise.connect(noiseGain); noiseGain.connect(Game.masterGain); noise.start(now);
};

Game.playPlayerExplosionSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc1 = Game.audioCtx.createOscillator(); const gain1 = Game.audioCtx.createGain();
    osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(80, now); osc1.frequency.exponentialRampToValueAtTime(20, now + 1);
    gain1.gain.setValueAtTime(0.6, now); gain1.gain.exponentialRampToValueAtTime(0.01, now + 1);
    osc1.connect(gain1); gain1.connect(Game.masterGain); osc1.start(now); osc1.stop(now + 1);
};

Game.playDamageSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator(); const gain = Game.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(440, now + 0.1); osc.frequency.setValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain); gain.connect(Game.masterGain); osc.start(now); osc.stop(now + 0.3);
};

// ==========================================
// 6. КОНФИГУРАЦИЯ УРОВНЕЙ И ВОЛН
// ==========================================
Game.getLevelModifiers = function(level, mode) {
    if (mode === 'arcade') {
        const diff = Math.min(Game.state.score / 30, 8);
        return { speedMult: 1 + diff * 0.08, shootFreqMult: 1 + diff * 0.12, accuracyBonus: Math.min(0.2, diff * 0.025), countMult: 1 + diff * 0.05, useLead: diff >= 4 };
    }
    return { speedMult: 1 + (level - 1) * 0.05, shootFreqMult: 1 + (level - 1) * 0.10, accuracyBonus: Math.min(0.2, (level - 1) * 0.015), countMult: 1 + (level - 1) * 0.05, useLead: level >= 6 };
};

Game.LEVEL_SCRIPTS = {
    1: { waves: [
        { description: 'РАЗВЕДКА', groups: [{ type: 'normal', count: 2, side: 'top', role: 'distractor', canShoot: false }]},
        { description: 'ФЛАНГИ', groups: [{ type: 'normal', count: 3, side: 'flanks', role: 'flanker', canShoot: false }]},
        { description: 'БЫСТРЫЙ', groups: [{ type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: false }, { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: false }]},
        { description: 'ОКРУЖЕНИЕ', groups: [{ type: 'normal', count: 3, side: 'surround', role: 'attacker', canShoot: false }]},
        { description: 'МАНЕВР', groups: [{ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: false }]}
    ]},
    2: { waves: [
        { description: 'ПЕРВЫЙ ОГОНЬ', groups: [{ type: 'normal', count: 3, side: 'top', role: 'attacker', canShoot: true, shootMult: 0.5 }]},
        { description: 'СМЕШАННАЯ', groups: [{ type: 'normal', count: 2, side: 'flanks', role: 'attacker', canShoot: true, shootMult: 0.5 }, { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: true, shootMult: 0.5 }]},
        { description: 'ФЛАНГОВАЯ', groups: [{ type: 'normal', count: 4, side: 'flanks', role: 'flanker', canShoot: true, shootMult: 0.7 }]},
        { description: 'ПРОРЫВ', groups: [{ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true, shootMult: 0.8 }]},
        { description: 'ТАНК', groups: [{ type: 'normal', count: 3, side: 'flanks', role: 'attacker', canShoot: true }, { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true, shootMult: 0.5 }]}
    ]},
    3: { waves: [
        { description: 'ТАНК И СВИТА', groups: [{ type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: true }, { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true }]},
        { description: 'СКОРОСТНАЯ', groups: [{ type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true }]},
        { description: 'ДВА ТАНКА', groups: [{ type: 'armored', count: 2, side: 'center', role: 'attacker', canShoot: true }]},
        { description: 'ЗАЛП', groups: [{ type: 'normal', count: 4, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 }, { type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true }]},
        { description: '⚠ БОСС ⚠', boss: true }
    ]}
};

Game.generateWavesForLevel = function(level) {
    const isBossLevel = level % 5 === 0;
    const waveCount = isBossLevel ? 6 : Math.min(8, 5 + Math.floor((level - 3) / 3));
    const waves = [];
    const descriptions = ['РАЗВЕДКА', 'ФЛАНГОВАЯ', 'СКОРОСТНАЯ', 'ТАНКОВАЯ', 'ЭЛИТНАЯ', 'ЗАЛПОВАЯ', 'ОКРУЖЕНИЕ', 'КАМИКАДЗЕ'];
    for (let i = 0; i < waveCount; i++) {
        if (i === waveCount - 1 && isBossLevel) { waves.push({ description: '⚠ БОСС ⚠', boss: true }); continue; }
        const wave = { description: descriptions[i % descriptions.length] + ` (${i + 1}/${waveCount})`, groups: [] };
        const baseCount = 2 + Math.floor(level / 3);
        if (i === 0) wave.groups.push({ type: 'normal', count: baseCount, side: 'top', role: 'attacker', canShoot: true });
        else if (i === 1) { wave.groups.push({ type: 'armored', count: Math.ceil(baseCount / 2), side: 'center', role: 'attacker', canShoot: true }); wave.groups.push({ type: 'fast', count: Math.floor(baseCount / 2) + 1, side: 'flanks', role: 'distractor', canShoot: true }); }
        else if (i === 2) { wave.groups.push({ type: 'normal', count: baseCount, side: 'surround', role: 'attacker', canShoot: true }); wave.groups.push({ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true }); }
        else if (i === 3) wave.groups.push({ type: 'fast', count: baseCount + 1, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true });
        else if (i === 4) { wave.groups.push({ type: 'armored', count: 2 + Math.floor(level / 5), side: 'center', role: 'attacker', canShoot: true }); wave.groups.push({ type: 'normal', count: baseCount + 2, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 }); }
        else if (i === 5) { wave.groups.push({ type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true, shootMult: 1.3 }); wave.groups.push({ type: 'normal', count: baseCount + 1, side: 'flanks', role: 'attacker', canShoot: true }); }
        else { wave.groups.push({ type: 'armored', count: 3, side: 'center', role: 'attacker', canShoot: true }); wave.groups.push({ type: 'fast', count: 4, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true }); }
        waves.push(wave);
    }
    return waves;
};

Game.getWavesForLevel = function(level) {
    if (Game.LEVEL_SCRIPTS[level]) return Game.LEVEL_SCRIPTS[level].waves;
    return Game.generateWavesForLevel(level);
};

// ==========================================
// 7. YANDEX SDK И СОХРАНЕНИЯ
// ==========================================
Game.ysdk = null;
Game.yandexPlayer = null;

Game.initYandexSDK = async function() {
    const isIframe = window.parent !== window && typeof YaGames !== 'undefined';
    if (!isIframe) {
        const saved = localStorage.getItem('playerData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(Game.playerData, data);
                if (!Game.playerData.levelsCompleted) Game.playerData.levelsCompleted = [];
                if (!Game.playerData.maxLevelUnlocked) Game.playerData.maxLevelUnlocked = 1;
                if (!Game.playerData.drones) Game.playerData.drones = [];
                if (!Game.playerData.selectedDrones) Game.playerData.selectedDrones = [];
                if (Game.playerData.xp === undefined) Game.playerData.xp = 0;
                if (Game.playerData.playerLevel === undefined) Game.playerData.playerLevel = 1;
                if (!Game.playerData.slotsUnlocked) Game.playerData.slotsUnlocked = [true, false, false, false, false];
                if (Game.playerData.pilotName === undefined) Game.playerData.pilotName = 'Пилот';
                if (Game.playerData.totalScore === undefined) Game.playerData.totalScore = 0;
                Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
            } catch(e) {}
        }
        return;
    }
    try {
        Game.ysdk = await YaGames.init();
        Game.yandexPlayer = await Game.ysdk.getPlayer();
        const data = await Game.yandexPlayer.getData([
            'coins', 'skins', 'selectedSkin', 'drones', 'selectedDrones',
            'levelsCompleted', 'maxLevelUnlocked', 'xp', 'playerLevel', 'slotsUnlocked',
            'pilotName', 'totalScore'
        ]);
        Object.assign(Game.playerData, data);
        if (!Game.playerData.levelsCompleted) Game.playerData.levelsCompleted = [];
        if (!Game.playerData.maxLevelUnlocked) Game.playerData.maxLevelUnlocked = 1;
        if (!Game.playerData.drones) Game.playerData.drones = [];
        if (!Game.playerData.selectedDrones) Game.playerData.selectedDrones = [];
        if (Game.playerData.xp === undefined) Game.playerData.xp = 0;
        if (Game.playerData.playerLevel === undefined) Game.playerData.playerLevel = 1;
        if (!Game.playerData.slotsUnlocked) Game.playerData.slotsUnlocked = [true, false, false, false, false];
        if (Game.playerData.pilotName === undefined) Game.playerData.pilotName = 'Пилот';
        if (Game.playerData.totalScore === undefined) Game.playerData.totalScore = 0;
        Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
    } catch (err) { console.error('Yandex SDK error:', err); }
};

Game.savePlayerData = function() {
    try {
        const data = {
            coins: Game.playerData.coins,
            skins: Game.playerData.skins,
            selectedSkin: Game.playerData.selectedSkin,
            drones: Game.playerData.drones,
            selectedDrones: Game.playerData.selectedDrones,
            levelsCompleted: Game.playerData.levelsCompleted,
            maxLevelUnlocked: Game.playerData.maxLevelUnlocked,
            xp: Game.playerData.xp,
            playerLevel: Game.playerData.playerLevel,
            slotsUnlocked: Game.playerData.slotsUnlocked,
            pilotName: Game.playerData.pilotName,
            totalScore: Game.playerData.totalScore
        };
        if (Game.ysdk && Game.yandexPlayer) {
            Game.yandexPlayer.setData(data);
        } else {
            localStorage.setItem('playerData', JSON.stringify(data));
        }
    } catch (err) { console.error('Save error:', err); }
};

Game.submitLeaderboardScore = async function(score) {
    try {
        if (Game.ysdk && Game.yandexPlayer && Game.yandexPlayer.isAuthorized()) {
            const isAvailable = await Game.ysdk.isAvailableMethod('leaderboards.setScore');
            if (isAvailable) await Game.ysdk.leaderboards.setScore('highscore', score);
        }
    } catch (err) { console.error('Leaderboard error:', err); }
};