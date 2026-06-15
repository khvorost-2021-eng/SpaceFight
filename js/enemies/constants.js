// ==========================================
// КОНСТАНТЫ И ПАРАМЕТРЫ ВРАГОВ
// ==========================================
window.AI_STATE = {
    ENTERING: 'ENTERING',
    MANEUVERING: 'MANEUVERING',
    ATTACKING: 'ATTACKING',
    RETREATING: 'RETREATING',
    KAMIKAZE: 'KAMIKAZE'
};

window.MANEUVER = {
    ZIGZAG: 'ZIGZAG',
    CIRCLE: 'CIRCLE',
    HOLD: 'HOLD'
};

window.ENEMY_PARAMS = {
    normal: {
        width: 60, height: 70,
        hp: 1, speed: 2.5,
        shootInterval: 100, bulletSpeed: 5,
        accuracy: 0.85, scoreValue: 1,
        bulletColor: '#ff0000'
    },
    fast: {
        width: 70, height: 80,
        hp: 1, speed: 4.5,
        shootInterval: 60, bulletSpeed: 7,
        accuracy: 0.75, scoreValue: 2,
        bulletColor: '#ff4400'
    },
    armored: {
        width: 80, height: 80,
        hp: 8,                    // 🔧 БЫЛО 3 → СТАЛО 8 (реально бронированный)
        speed: 1.5,               // НЕ ТРОГАЕМ
        shootInterval: 140,       // НЕ ТРОГАЕМ
        bulletSpeed: 4,
        accuracy: 0.95,
        scoreValue: 10,           // 🔧 БЫЛО 3 → СТАЛО 10 (награда за живучесть)
        bulletColor: '#ffff00'
    },
    boss: {
        width: 160, height: 180,
        hp: 50, speed: 1,
        shootInterval: 50, bulletSpeed: 6,
        accuracy: 0.9, scoreValue: 50,
        bulletColor: '#ff0000'
    }
};

console.log('✅ enemies/constants.js загружен');