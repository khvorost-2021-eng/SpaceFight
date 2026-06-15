// ==========================================
// КОНСТАНТЫ И ПАРАМЕТРЫ ВРАГОВ
// ==========================================

// Состояния ИИ врагов
window.AI_STATE = {
    ENTERING: 'ENTERING',
    MANEUVERING: 'MANEUVERING',
    ATTACKING: 'ATTACKING',
    RETREATING: 'RETREATING',
    KAMIKAZE: 'KAMIKAZE'
};

// Типы маневров
window.MANEUVER = {
    ZIGZAG: 'ZIGZAG',
    CIRCLE: 'CIRCLE',
    HOLD: 'HOLD'
};

// Параметры типов врагов
// Параметры типов врагов
// Параметры типов врагов (оригинальные значения)
window.ENEMY_PARAMS = {
    normal: {
        width: 60,
        height: 70,
        hp: 1,
        speed: 2.5,
        shootInterval: 100,
        bulletSpeed: 5,
        accuracy: 0.85,
        scoreValue: 1,
        bulletColor: '#ff0000'
    },
    fast: {
        width: 70,
        height: 80,
        hp: 1,
        speed: 4.5,
        shootInterval: 60,
        bulletSpeed: 7,
        accuracy: 0.75,
        scoreValue: 2,
        bulletColor: '#ff4400'
    },
    armored: {
        width: 80,
        height: 80,
        hp: 3,
        speed: 1.5,
        shootInterval: 140,
        bulletSpeed: 4,
        accuracy: 0.95,
        scoreValue: 3,
        bulletColor: '#ffff00'
    },
    boss: {
        width: 160,
        height: 180,
        hp: 50,
        speed: 1,
        shootInterval: 50,
        bulletSpeed: 6,
        accuracy: 0.9,
        scoreValue: 50,
        bulletColor: '#ff0000'
    }
};

console.log('✅ enemies/constants.js загружен');