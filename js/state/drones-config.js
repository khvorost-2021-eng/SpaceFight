// ==========================================
// КОНФИГУРАЦИЯ ДРОНОВ И СЛОТОВ
// ==========================================

// Слоты дронов
Game.SLOT_CONFIG = [
    { index: 0, price: 0, requiredLevel: 1, name: 'Слот 1' },
    { index: 1, price: 300, requiredLevel: 5, name: 'Слот 2' },
    { index: 2, price: 800, requiredLevel: 10, name: 'Слот 3' },
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

// Типы дронов (ослабленные для баланса)
Game.DRONE_TYPES = {
    defender: {
        id: 'defender',
        name: 'Защитник',
        price: 150,
        color: '#00ffff',
        hp: 1,
        damage: 0.3,
        fireRate: 120,
        bulletSpeed: 7,
        orbitRadius: 60,
        orbitSpeed: 0.02,
        accuracy: 0.55,
        description: LANG.droneDescriptions.defender,
        priority: 'closest'
    },
    interceptor: {
        id: 'interceptor',
        name: 'Перехватчик',
        price: 250,
        color: '#ff8800',
        hp: 1,
        damage: 0.25,
        fireRate: 50,
        bulletSpeed: 10,
        orbitRadius: 70,
        orbitSpeed: 0.035,
        accuracy: 0.50,
        description: LANG.droneDescriptions.interceptor,
        priority: 'fast'
    },
    heavy: {
        id: 'heavy',
        name: 'Тяжёлый',
        price: 400,
        color: '#aa00ff',
        hp: 2,
        damage: 0.5,
        fireRate: 240,
        bulletSpeed: 6,
        orbitRadius: 55,
        orbitSpeed: 0.012,
        accuracy: 0.60,
        description: LANG.droneDescriptions.heavy,
        priority: 'closest',
        volley: 2
    },
    healer: {
        id: 'healer',
        name: 'Хилер',
        price: 800,
        color: '#00ff88',
        hp: 1,
        damage: 0,
        fireRate: 0,
        bulletSpeed: 0,
        orbitRadius: 50,
        orbitSpeed: 0.015,
        accuracy: 0,
        description: LANG.droneDescriptions.healer,
        priority: 'none',
        healInterval: 1800,
        healAmount: 1
    }
};

console.log('✅ state/drones-config.js загружен');