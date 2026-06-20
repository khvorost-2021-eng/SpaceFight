// ==========================================
// КОНФИГУРАЦИИ МАГАЗИНА
// ==========================================

// === ЦВЕТА КОРАБЛЯ (замена скинам) ===
Game.SHIP_COLORS = {
    cyan:    { name: 'Неон',      color: '#00ffff', rgb: '0, 255, 255' },
    blue:    { name: 'Синий',     color: '#4488ff', rgb: '68, 136, 255' },
    red:     { name: 'Красный',   color: '#ff4444', rgb: '255, 68, 68' },
    green:   { name: 'Зелёный',   color: '#00ff88', rgb: '0, 255, 136' },
    gold:    { name: 'Золотой',   color: '#ffd700', rgb: '255, 215, 0' },
    magenta: { name: 'Пурпурный', color: '#ff00ff', rgb: '255, 0, 255' }
};

Game.getShipColor = function() {
    const colorKey = Game.playerData.shipColor || 'cyan';
    const c = Game.SHIP_COLORS[colorKey];
    return c ? c.color : '#00ffff';
};

// === ПРОКАЧКА КОРАБЛЯ ===
Game.SHIP_UPGRADES = {
    shipHp:          { name: '❤️ HP корабля',     max: 5, basePrice: 100, description: '+1 HP',         icon: '❤️' },
    shipDamage:      { name: '⚔️ Урон пуль',      max: 5, basePrice: 150, description: '+1 урон',       icon: '⚔️' },
    shipBulletSpeed: { name: '⚡ Скорость пуль',  max: 5, basePrice: 120, description: '+15% скорость', icon: '⚡' },
    shipBulletSize:  { name: '🎯 Размер пуль',    max: 3, basePrice: 200, description: 'Крупнее пули',  icon: '🎯' }
};

// === ПРОКАЧКА ДРОНОВ ===
Game.DRONE_UPGRADES = {
    defender: {
        title: 'Защитник', icon: '🛡️', color: '#00ffff',
        upgrades: {
            hp:       { name: '❤️ HP',             max: 5, basePrice: 150, description: '+1 HP',         perLevel: 1 },
            damage:   { name: '⚔️ Урон',           max: 5, basePrice: 200, description: '+0.1 к урону',  perLevel: 0.1 },
            fireRate: { name: '⚡ Скорость',       max: 3, basePrice: 250, description: '-10% интервал', perLevel: 0.1 }
        }
    },
    interceptor: {
        title: 'Перехватчик', icon: '🎯', color: '#ff8800',
        upgrades: {
            hp:       { name: '❤️ HP',             max: 5, basePrice: 200, description: '+1 HP',         perLevel: 1 },
            damage:   { name: '⚔️ Урон',           max: 5, basePrice: 250, description: '+0.08 к урону', perLevel: 0.08 },
            fireRate: { name: '⚡ Скорость',       max: 3, basePrice: 300, description: '-10% интервал', perLevel: 0.1 }
        }
    },
    heavy: {
        title: 'Тяжёлый', icon: '💪', color: '#aa00ff',
        upgrades: {
            hp:       { name: '❤️ HP',             max: 5, basePrice: 250, description: '+1 HP',         perLevel: 1 },
            damage:   { name: '⚔️ Урон',           max: 5, basePrice: 300, description: '+0.15 к урону', perLevel: 0.15 },
            fireRate: { name: '⚡ Скорость',       max: 3, basePrice: 350, description: '-10% интервал', perLevel: 0.1 }
        }
    },
    healer: {
        title: 'Хилер', icon: '💚', color: '#00ff88',
        upgrades: {
            hp:           { name: '❤️ HP',                 max: 5, basePrice: 300, description: '+1 HP',         perLevel: 1 },
            healInterval: { name: '💚 Частота лечения',    max: 3, basePrice: 400, description: '-15% интервал', perLevel: 0.15 }
        }
    }
};

// === ФОРМУЛА ЦЕНЫ ===
Game.getUpgradePrice = function(basePrice, currentLevel) {
    return Math.floor(basePrice * Math.pow(1.6, currentLevel));
};

// === ПОЛУЧЕНИЕ УРОВНЯ АПГРЕЙДА ДРОНА ===
Game.getDroneUpgradeLevel = function(droneId, upgradeKey) {
    const u = Game.playerData.upgrades;
    if (!u || !u.drones || !u.drones[droneId]) return 0;
    return u.drones[droneId][upgradeKey] || 0;
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
window.getDroneIcon = function(id) {
    return { defender: '🛡️', interceptor: '🎯', heavy: '💪', healer: '💚' }[id] || '🛸';
};

window.hexToRgb = function(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};

window.hexToRGBA = function(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

console.log('✅ shop/config.js загружен');