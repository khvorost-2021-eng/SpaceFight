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
    totalScore: 0
};

// Система рангов
Game.RANKS = [
    { minLevel: 1, key: 'recruit', icon: '🎖️' },
    { minLevel: 5, key: 'cadet', icon: '⭐' },
    { minLevel: 10, key: 'lieutenant', icon: '🌟' },
    { minLevel: 15, key: 'captain', icon: '💫' },
    { minLevel: 20, key: 'commander', icon: '👑' }
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

// Система опыта
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

console.log('✅ state/player-data.js загружен');