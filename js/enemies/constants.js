// ==========================================
// КОНСТАНТЫ И ПАРАМЕТРЫ ВРАГОВ (60 FPS)
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

// 🔧 ИСПРАВЛЕНО: убрано дублирование (было 2 определения ENEMY_PARAMS)
// Значения подобраны под DT = 2.64 (setInterval 16ms ≈ 60 FPS)
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
        hp: 8,
        speed: 1.5,
        shootInterval: 140,
        bulletSpeed: 4,
        accuracy: 0.95,
        scoreValue: 10,
        bulletColor: '#ffff00'
    },
    boss: {
        width: 160, height: 180,
        hp: 30,
        speed: 0.8,
        shootInterval: 90,
        bulletSpeed: 4.5,
        accuracy: 0.85,
        scoreValue: 50,
        bulletColor: '#ff0000'
    }
};

console.log('✅ enemies/constants.js загружен (без дублирования)');
