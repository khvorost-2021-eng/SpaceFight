// ==========================================
// YANDEX SDK И СОХРАНЕНИЯ
// ==========================================

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
                if (!Game.playerData.drones) Game.playerData.drones = [];
                if (!Game.playerData.selectedDrones) Game.playerData.selectedDrones = [];
                if (Game.playerData.xp === undefined) Game.playerData.xp = 0;
                if (Game.playerData.playerLevel === undefined) Game.playerData.playerLevel = 1;
                if (!Game.playerData.slotsUnlocked) Game.playerData.slotsUnlocked = [true, false, false, false, false];
                if (Game.playerData.pilotName === undefined) Game.playerData.pilotName = 'Пилот';
                if (Game.playerData.totalScore === undefined) Game.playerData.totalScore = 0;
                Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
            } catch(e) {}
        }
        return;
    }
    
    try {
        Game.ysdk = await YaGames.init();
        Game.yandexPlayer = await Game.ysdk.getPlayer();
        const data = await Game.yandexPlayer.getData([
            'coins', 'skins', 'selectedSkin', 'drones', 'selectedDrones',
            'levelsCompleted', 'maxLevelUnlocked', 'xp', 'playerLevel', 'slotsUnlocked',
            'pilotName', 'totalScore'
        ]);
        Object.assign(Game.playerData, data);
        if (!Game.playerData.levelsCompleted) Game.playerData.levelsCompleted = [];
        if (!Game.playerData.maxLevelUnlocked) Game.playerData.maxLevelUnlocked = 1;
        if (!Game.playerData.drones) Game.playerData.drones = [];
        if (!Game.playerData.selectedDrones) Game.playerData.selectedDrones = [];
        if (Game.playerData.xp === undefined) Game.playerData.xp = 0;
        if (Game.playerData.playerLevel === undefined) Game.playerData.playerLevel = 1;
        if (!Game.playerData.slotsUnlocked) Game.playerData.slotsUnlocked = [true, false, false, false, false];
        if (Game.playerData.pilotName === undefined) Game.playerData.pilotName = 'Пилот';
        if (Game.playerData.totalScore === undefined) Game.playerData.totalScore = 0;
        Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
        console.log('Yandex SDK initialized');
    } catch (err) {
        console.error('Yandex SDK error:', err);
    }
};

Game.savePlayerData = function() {
    try {
        const data = {
            coins: Game.playerData.coins,
            skins: Game.playerData.skins,
            selectedSkin: Game.playerData.selectedSkin,
            drones: Game.playerData.drones,
            selectedDrones: Game.playerData.selectedDrones,
            levelsCompleted: Game.playerData.levelsCompleted,
            maxLevelUnlocked: Game.playerData.maxLevelUnlocked,
            xp: Game.playerData.xp,
            playerLevel: Game.playerData.playerLevel,
            slotsUnlocked: Game.playerData.slotsUnlocked,
            pilotName: Game.playerData.pilotName,
            totalScore: Game.playerData.totalScore
        };
        if (Game.ysdk && Game.yandexPlayer) {
            Game.yandexPlayer.setData(data);
        } else {
            localStorage.setItem('playerData', JSON.stringify(data));
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

console.log('✅ state/sdk.js загружен');