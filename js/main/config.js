// ==========================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ==========================================

// === СКИНЫ (устаревшая система, для совместимости) ===
Game.SKINS = [
    { id: 'standard', name: 'Стандартный', price: 0, color: '#00ffff' },
    { id: 'red', name: 'Красный (Скоро)', price: 100, color: '#ff0000' },
    { id: 'green', name: 'Зелёный (Скоро)', price: 150, color: '#00ff00' },
    { id: 'purple', name: 'Фиолетовый (Скоро)', price: 200, color: '#aa00ff' },
    { id: 'gold', name: 'Золотой (Скоро)', price: 500, color: '#ffd700' }
];

// ==========================================
// ПРОКАЧКА КОРАБЛЯ
// ==========================================
Game.SHIP_UPGRADES = {
    shipHp: {
        name: '❤️ HP корабля',
        max: 5,
        basePrice: 100,
        description: '+1 HP за уровень',
        icon: '❤️'
    },
    shipDamage: {
        name: '⚔️ Урон пуль',
        max: 5,
        basePrice: 150,
        description: '+1 урон за уровень',
        icon: '⚔️'
    },
    shipBulletSpeed: {
        name: '⚡ Скорость пуль',
        max: 5,
        basePrice: 120,
        description: '+15% скорость пуль',
        icon: '⚡'
    },
    shipBulletSize: {
        name: '🎯 Размер пуль',
        max: 3,
        basePrice: 200,
        description: 'Крупнее пули',
        icon: '🎯'
    }
};

// ==========================================
// ИНДИВИДУАЛЬНАЯ ПРОКАЧКА ДРОНОВ
// ==========================================
Game.DRONE_UPGRADES = {
    defender: {
        title: 'Защитник',
        icon: '🛡️',
        color: '#00ffff',
        upgrades: {
            hp: {
                name: '❤️ HP',
                max: 5,
                basePrice: 150,
                description: '+1 HP',
                perLevel: 1
            },
            damage: {
                name: '⚔️ Урон',
                max: 5,
                basePrice: 200,
                description: '+0.1 к урону',
                perLevel: 0.1
            },
            fireRate: {
                name: '⚡ Скорость',
                max: 3,
                basePrice: 250,
                description: '-10% интервал',
                perLevel: 0.1
            }
        }
    },
    interceptor: {
        title: 'Перехватчик',
        icon: '🎯',
        color: '#ff8800',
        upgrades: {
            hp: {
                name: '❤️ HP',
                max: 5,
                basePrice: 200,
                description: '+1 HP',
                perLevel: 1
            },
            damage: {
                name: '⚔️ Урон',
                max: 5,
                basePrice: 250,
                description: '+0.08 к урону',
                perLevel: 0.08
            },
            fireRate: {
                name: '⚡ Скорость',
                max: 3,
                basePrice: 300,
                description: '-10% интервал',
                perLevel: 0.1
            }
        }
    },
    heavy: {
        title: 'Тяжёлый',
        icon: '💪',
        color: '#aa00ff',
        upgrades: {
            hp: {
                name: '❤️ HP',
                max: 5,
                basePrice: 250,
                description: '+1 HP',
                perLevel: 1
            },
            damage: {
                name: '⚔️ Урон',
                max: 5,
                basePrice: 300,
                description: '+0.15 к урону',
                perLevel: 0.15
            },
            fireRate: {
                name: '⚡ Скорость',
                max: 3,
                basePrice: 350,
                description: '-10% интервал',
                perLevel: 0.1
            }
        }
    },
    healer: {
        title: 'Хилер',
        icon: '💚',
        color: '#00ff88',
        upgrades: {
            hp: {
                name: '❤️ HP',
                max: 5,
                basePrice: 300,
                description: '+1 HP',
                perLevel: 1
            },
            healInterval: {
                name: '💚 Частота лечения',
                max: 3,
                basePrice: 400,
                description: '-15% интервал',
                perLevel: 0.15
            }
        }
    }
};

// === Формула цены: basePrice × (1.6 ^ currentLevel) ===
Game.getUpgradePrice = function(basePrice, currentLevel) {
    return Math.floor(basePrice * Math.pow(1.6, currentLevel));
};

// === Получение уровня апгрейда ===
Game.getDroneUpgradeLevel = function(droneId, upgradeKey) {
    var u = Game.playerData.upgrades;
    if (!u || !u.drones || !u.drones[droneId]) return 0;
    return u.drones[droneId][upgradeKey] || 0;
};

// ==========================================
// ЦВЕТА КОРАБЛЯ
// ==========================================
Game.SHIP_COLORS = {
    cyan:    { name: 'Неон',      color: '#00ffff', free: true },
    blue:    { name: 'Синий',     color: '#4488ff', free: true },
    red:     { name: 'Красный',   color: '#ff4444', free: true },
    green:   { name: 'Зелёный',   color: '#00ff88', free: true },
    gold:    { name: 'Золотой',   color: '#ffd700', free: true },
    magenta: { name: 'Пурпурный', color: '#ff00ff', free: true }
};

Game.getShipColor = function() {
    var colorKey = Game.playerData.shipColor || 'cyan';
    var colorObj = Game.SHIP_COLORS[colorKey];
    return colorObj ? colorObj.color : '#00ffff';
};

console.log('✅ main/config.js загружен (индивидуальная прокачка дронов)');