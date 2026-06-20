// ==========================================
// ДАННЫЕ ИГРОКА, РАНГИ, ОПЫТ
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
    totalScore: 0,
    // === ПРОКАЧКА ===
    upgrades: {
        shipHp: 0,
        shipDamage: 0,
        shipBulletSpeed: 0,
        shipBulletSize: 0,
        drones: {
            defender:    { hp: 0, damage: 0, fireRate: 0 },
            interceptor: { hp: 0, damage: 0, fireRate: 0 },
            heavy:       { hp: 0, damage: 0, fireRate: 0 },
            healer:      { hp: 0, healInterval: 0 }
        }
    },
    shipColor: 'cyan'
};

// === СИСТЕМА РАНГОВ ===
Game.RANKS = [
    { minLevel: 1, key: 'recruit', icon: '🎖️' },
    { minLevel: 5, key: 'cadet', icon: '⭐' },
    { minLevel: 10, key: 'lieutenant', icon: '🌟' },
    { minLevel: 15, key: 'captain', icon: '💫' },
    { minLevel: 20, key: 'commander', icon: '👑' }
];

Game.getRank = function(level) {
    var currentRank = Game.RANKS[0];
    for (var i = 0; i < Game.RANKS.length; i++) {
        if (level >= Game.RANKS[i].minLevel) currentRank = Game.RANKS[i];
    }
    return { ...currentRank, name: LANG.ranks[currentRank.key] };
};

Game.getNextRank = function(level) {
    for (var i = 0; i < Game.RANKS.length; i++) {
        if (level < Game.RANKS[i].minLevel) return Game.RANKS[i];
    }
    return null;
};

// === ОПЫТ ===
Game.calculatePlayerLevel = function(xp) {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
};

Game.getXPForLevel = function(level) {
    return Math.pow(level - 1, 2) * 50;
};

Game.getXPProgress = function() {
    var currentLevelXP = Game.getXPForLevel(Game.playerData.playerLevel);
    var nextLevelXP = Game.getXPForLevel(Game.playerData.playerLevel + 1);
    var currentXP = Game.playerData.xp - currentLevelXP;
    var neededXP = nextLevelXP - currentLevelXP;
    return {
        current: currentXP,
        needed: neededXP,
        percent: Math.min(100, (currentXP / neededXP) * 100)
    };
};

Game.addXP = function(amount) {
    var oldLevel = Game.playerData.playerLevel;
    Game.playerData.xp += amount;
    Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
    if (Game.playerData.playerLevel > oldLevel) {
        console.log('🎉 Уровень повышен! ' + oldLevel + ' → ' + Game.playerData.playerLevel);
    }
    Game.savePlayerData();
    return Game.playerData.playerLevel > oldLevel;
};

// === МИГРАЦИЯ СТАРЫХ СОХРАНЕНИЙ ===
Game.migratePlayerData = function(data) {
    // Гарантируем upgrades
    if (!data.upgrades) {
        data.upgrades = {
            shipHp: 0, shipDamage: 0, shipBulletSpeed: 0, shipBulletSize: 0,
            drones: {
                defender:    { hp: 0, damage: 0, fireRate: 0 },
                interceptor: { hp: 0, damage: 0, fireRate: 0 },
                heavy:       { hp: 0, damage: 0, fireRate: 0 },
                healer:      { hp: 0, healInterval: 0 }
            }
        };
    }
    
    // Миграция: если есть старые общие droneHp/droneDamage/droneFireRate — переносим их в defender
    if (data.upgrades.droneHp !== undefined || data.upgrades.droneDamage !== undefined || data.upgrades.droneFireRate !== undefined) {
        var oldHp = data.upgrades.droneHp || 0;
        var oldDmg = data.upgrades.droneDamage || 0;
        var oldFR = data.upgrades.droneFireRate || 0;
        
        if (!data.upgrades.drones) {
            data.upgrades.drones = {
                defender:    { hp: 0, damage: 0, fireRate: 0 },
                interceptor: { hp: 0, damage: 0, fireRate: 0 },
                heavy:       { hp: 0, damage: 0, fireRate: 0 },
                healer:      { hp: 0, healInterval: 0 }
            };
        }
        
        // Переносим старые уровни в defender (как самый универсальный дрон)
        data.upgrades.drones.defender.hp = Math.max(data.upgrades.drones.defender.hp, oldHp);
        data.upgrades.drones.defender.damage = Math.max(data.upgrades.drones.defender.damage, oldDmg);
        data.upgrades.drones.defender.fireRate = Math.max(data.upgrades.drones.defender.fireRate, oldFR);
        
        delete data.upgrades.droneHp;
        delete data.upgrades.droneDamage;
        delete data.upgrades.droneFireRate;
        
        console.log('🔄 Миграция: старые общие апгрейды дронов перенесены в Защитник');
    }
    
    // Гарантируем структуру drones
    if (!data.upgrades.drones) {
        data.upgrades.drones = {
            defender:    { hp: 0, damage: 0, fireRate: 0 },
            interceptor: { hp: 0, damage: 0, fireRate: 0 },
            heavy:       { hp: 0, damage: 0, fireRate: 0 },
            healer:      { hp: 0, healInterval: 0 }
        };
    }
    
    // Гарантируем поля для каждого дрона
    ['defender', 'interceptor', 'heavy', 'healer'].forEach(function(id) {
        if (!data.upgrades.drones[id]) {
            data.upgrades.drones[id] = id === 'healer' 
                ? { hp: 0, healInterval: 0 }
                : { hp: 0, damage: 0, fireRate: 0 };
        }
        if (data.upgrades.drones[id].hp === undefined) data.upgrades.drones[id].hp = 0;
        if (id === 'healer') {
            if (data.upgrades.drones[id].healInterval === undefined) data.upgrades.drones[id].healInterval = 0;
        } else {
            if (data.upgrades.drones[id].damage === undefined) data.upgrades.drones[id].damage = 0;
            if (data.upgrades.drones[id].fireRate === undefined) data.upgrades.drones[id].fireRate = 0;
        }
    });
    
    // Гарантируем shipColor
    if (!data.shipColor) data.shipColor = 'cyan';
    
    return data;
};

console.log('✅ state/player-data.js загружен (с миграцией)');