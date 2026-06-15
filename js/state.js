window.Game = window.Game || {};

Game.canvas = document.getElementById('gameCanvas');
Game.ctx = Game.canvas.getContext('2d');
Game.canvas.width = window.innerWidth;
Game.canvas.height = window.innerHeight;

Game.STATE = {
    MENU: 'menu',
    LEVEL_SELECT: 'levelSelect',
    SKINS: 'skins',
    ARCADE: 'arcade',
    CAMPAIGN: 'campaign',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete'
};

Game.state = {
    currentState: Game.STATE.MENU,
    mode: null,
    score: 0,
    hp: 3,
    maxHp: 3,
    level: 1,
    coinsEarned: 0,
    shakeAmount: 0,
    invulnerable: 0,
    lastPlayerX: 0,
    lastPlayerY: 0,
    playerVX: 0,
    playerVY: 0,
    // === ВОЛНЫ ===
    currentWave: 0,
    totalWaves: 0,
    waveState: 'IDLE', // IDLE, SPAWNING, ACTIVE, CLEARED
    waveTimer: 0,
    waveAnnouncement: '',
    announcementTimer: 0,
    levelWaves: [],
    currentWaveConfig: null
};

Game.mouse = { x: Game.canvas.width / 2, y: Game.canvas.height / 2 };

Game.player = {
    x: Game.canvas.width / 2,
    y: Game.canvas.height / 2,
    rotation: 0,
    targetRotation: 0,
    flameOffset: 0,
    flameSpeed: 0.15
};

Game.bullets = [];
Game.enemyBullets = [];
Game.enemies = [];
Game.particles = [];
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

Game.playerData = {
    coins: 0,
    skins: ['standard'],
    selectedSkin: 'standard',
    levelsCompleted: [],
    maxLevelUnlocked: 1
};

// === МОДИФИКАТОРЫ СЛОЖНОСТИ ===
Game.getLevelModifiers = function(level, mode) {
    if (mode === 'arcade') {
        const diff = Math.min(Game.state.score / 30, 8);
        return {
            speedMult: 1 + diff * 0.08,
            shootFreqMult: 1 + diff * 0.12,
            accuracyBonus: Math.min(0.2, diff * 0.025),
            countMult: 1 + diff * 0.05,
            useLead: diff >= 4
        };
    }
    return {
        speedMult: 1 + (level - 1) * 0.05,
        shootFreqMult: 1 + (level - 1) * 0.10,
        accuracyBonus: Math.min(0.2, (level - 1) * 0.015),
        countMult: 1 + (level - 1) * 0.05,
        useLead: level >= 6
    };
};

// === СКРИПТЫ УРОВНЕЙ 1-3 ===
Game.LEVEL_SCRIPTS = {
    1: {
        waves: [
            { description: 'РАЗВЕДКА', groups: [
                { type: 'normal', count: 2, side: 'top', role: 'distractor', canShoot: false }
            ]},
            { description: 'ФЛАНГИ', groups: [
                { type: 'normal', count: 3, side: 'flanks', role: 'flanker', canShoot: false }
            ]},
            { description: 'БЫСТРЫЙ', groups: [
                { type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: false },
                { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: false }
            ]},
            { description: 'ОКРУЖЕНИЕ', groups: [
                { type: 'normal', count: 3, side: 'surround', role: 'attacker', canShoot: false }
            ]},
            { description: 'МАНЕВР', groups: [
                { type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: false }
            ]}
        ]
    },
    2: {
        waves: [
            { description: 'ПЕРВЫЙ ОГОНЬ', groups: [
                { type: 'normal', count: 3, side: 'top', role: 'attacker', canShoot: true, shootMult: 0.5 }
            ]},
            { description: 'СМЕШАННАЯ', groups: [
                { type: 'normal', count: 2, side: 'flanks', role: 'attacker', canShoot: true, shootMult: 0.5 },
                { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: true, shootMult: 0.5 }
            ]},
            { description: 'ФЛАНГОВАЯ', groups: [
                { type: 'normal', count: 4, side: 'flanks', role: 'flanker', canShoot: true, shootMult: 0.7 }
            ]},
            { description: 'ПРОРЫВ', groups: [
                { type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true, shootMult: 0.8 }
            ]},
            { description: 'ТАНК', groups: [
                { type: 'normal', count: 3, side: 'flanks', role: 'attacker', canShoot: true },
                { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true, shootMult: 0.5 }
            ]}
        ]
    },
    3: {
        waves: [
            { description: 'ТАНК И СВИТА', groups: [
                { type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: true },
                { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true }
            ]},
            { description: 'СКОРОСТНАЯ', groups: [
                { type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true }
            ]},
            { description: 'ДВА ТАНКА', groups: [
                { type: 'armored', count: 2, side: 'center', role: 'attacker', canShoot: true }
            ]},
            { description: 'ЗАЛП', groups: [
                { type: 'normal', count: 4, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 },
                { type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true }
            ]},
            { description: '⚠ БОСС ⚠', boss: true }
        ]
    }
};

// === ПРОЦЕДУРНЫЙ ГЕНЕРАТОР ВОЛН 4+ ===
Game.generateWavesForLevel = function(level) {
    const isBossLevel = level % 5 === 0;
    const waveCount = isBossLevel ? 6 : Math.min(8, 5 + Math.floor((level - 3) / 3));
    const waves = [];
    const descriptions = ['РАЗВЕДКА', 'ФЛАНГОВАЯ', 'СКОРОСТНАЯ', 'ТАНКОВАЯ', 'ЭЛИТНАЯ', 'ЗАЛПОВАЯ', 'ОКРУЖЕНИЕ', 'КАМИКАДЗЕ'];
    
    for (let i = 0; i < waveCount; i++) {
        const isLast = i === waveCount - 1;
        
        if (isLast && isBossLevel) {
            waves.push({ description: '⚠ БОСС ⚠', boss: true });
            continue;
        }
        
        const wave = {
            description: descriptions[i % descriptions.length] + ` (${i + 1}/${waveCount})`,
            groups: []
        };
        
        const baseCount = 2 + Math.floor(level / 3);
        
        if (i === 0) {
            wave.groups.push({ type: 'normal', count: baseCount, side: 'top', role: 'attacker', canShoot: true });
        } else if (i === 1) {
            wave.groups.push({ type: 'armored', count: Math.ceil(baseCount / 2), side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: Math.floor(baseCount / 2) + 1, side: 'flanks', role: 'distractor', canShoot: true });
        } else if (i === 2) {
            wave.groups.push({ type: 'normal', count: baseCount, side: 'surround', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true });
        } else if (i === 3) {
            wave.groups.push({ type: 'fast', count: baseCount + 1, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true });
        } else if (i === 4) {
            wave.groups.push({ type: 'armored', count: 2 + Math.floor(level / 5), side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'normal', count: baseCount + 2, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 });
        } else if (i === 5) {
            wave.groups.push({ type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true, shootMult: 1.3 });
            wave.groups.push({ type: 'normal', count: baseCount + 1, side: 'flanks', role: 'attacker', canShoot: true });
        } else {
            wave.groups.push({ type: 'armored', count: 3, side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: 4, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true });
        }
        
        waves.push(wave);
    }
    
    return waves;
};

Game.getWavesForLevel = function(level) {
    if (Game.LEVEL_SCRIPTS[level]) {
        return Game.LEVEL_SCRIPTS[level].waves;
    }
    return Game.generateWavesForLevel(level);
};

// === SVG КОРАБЛЕЙ ===
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

Game.ships = {};
Game.shipsLoaded = false;

Game.loadShips = function() {
    return new Promise((resolve) => {
        const keys = Object.keys(SHIP_SVGS);
        let loaded = 0;
        const check = () => {
            loaded++;
            if (loaded === keys.length) {
                Game.shipsLoaded = true;
                console.log('✅ Корабли загружены');
                resolve();
            }
        };
        keys.forEach(key => {
            try {
                const blob = new Blob([SHIP_SVGS[key]], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => { Game.ships[key] = img; check(); };
                img.onerror = () => { console.warn('Не удалось загрузить', key); check(); };
                img.src = url;
            } catch (e) {
                console.warn('Ошибка SVG:', key, e);
                check();
            }
        });
    });
};

// === YANDEX SDK ===
Game.ysdk = null;
Game.yandexPlayer = null;

Game.initYandexSDK = async function() {
    const isIframe = window.parent !== window && typeof YaGames !== 'undefined';
    if (!isIframe) {
        console.log('Локальный режим: localStorage');
        const saved = localStorage.getItem('playerData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(Game.playerData, data);
                if (!Game.playerData.levelsCompleted) Game.playerData.levelsCompleted = [];
                if (!Game.playerData.maxLevelUnlocked) Game.playerData.maxLevelUnlocked = 1;
            } catch(e) {}
        }
        return;
    }
    try {
        Game.ysdk = await YaGames.init();
        Game.yandexPlayer = await Game.ysdk.getPlayer();
        const data = await Game.yandexPlayer.getData(['coins', 'skins', 'selectedSkin', 'levelsCompleted', 'maxLevelUnlocked']);
        Object.assign(Game.playerData, data);
        if (!Game.playerData.levelsCompleted) Game.playerData.levelsCompleted = [];
        if (!Game.playerData.maxLevelUnlocked) Game.playerData.maxLevelUnlocked = 1;
        console.log('Yandex SDK initialized');
    } catch (err) {
        console.error('Yandex SDK error:', err);
    }
};

Game.savePlayerData = function() {
    try {
        if (Game.ysdk && Game.yandexPlayer) {
            Game.yandexPlayer.setData({
                coins: Game.playerData.coins,
                skins: Game.playerData.skins,
                selectedSkin: Game.playerData.selectedSkin,
                levelsCompleted: Game.playerData.levelsCompleted,
                maxLevelUnlocked: Game.playerData.maxLevelUnlocked
            });
        } else {
            localStorage.setItem('playerData', JSON.stringify(Game.playerData));
        }
    } catch (err) {
        console.error('Save error:', err);
    }
};

Game.submitLeaderboardScore = async function(score) {
    try {
        if (Game.ysdk && Game.yandexPlayer && Game.yandexPlayer.isAuthorized()) {
            const isAvailable = await Game.ysdk.isAvailableMethod('leaderboards.setScore');
            if (isAvailable) await Game.ysdk.leaderboards.setScore('highscore', score);
        }
    } catch (err) {
        console.error('Leaderboard error:', err);
    }
};