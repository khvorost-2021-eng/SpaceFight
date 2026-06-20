// ==========================================
// SVG АССЕТЫ И ЗАГРУЗКА ИЗОБРАЖЕНИЙ
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
        const check = () => {
            if (++loaded === keys.length) {
                Game.shipsLoaded = true;
                resolve();
            }
        };
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
        const check = () => {
            if (++loaded === keys.length) {
                Game.droneImagesLoaded = true;
                resolve();
            }
        };
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

console.log('✅ state/assets.js загружен');