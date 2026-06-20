// ==========================================
// YANDEX SDK И СОХРАНЕНИЯ
// ==========================================
Game.ysdk = null;
Game.yandexPlayer = null;

Game.initYandexSDK = async function() {
    var isIframe = window.parent !== window && typeof YaGames !== 'undefined';
    if (!isIframe) {
        console.log('Локальный режим: localStorage');
        var saved = localStorage.getItem('playerData');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                Object.assign(Game.playerData, data);
                Game.migratePlayerData(Game.playerData);
                Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
            } catch(e) {}
        }
        return;
    }

    try {
        Game.ysdk = await YaGames.init();
        Game.yandexPlayer = await Game.ysdk.getPlayer();
        var data = await Game.yandexPlayer.getData([
            'coins', 'skins', 'selectedSkin', 'drones', 'selectedDrones',
            'levelsCompleted', 'maxLevelUnlocked', 'xp', 'playerLevel', 'slotsUnlocked',
            'pilotName', 'totalScore', 'upgrades', 'shipColor'
        ]);
        Object.assign(Game.playerData, data);
        Game.migratePlayerData(Game.playerData);
        Game.playerData.playerLevel = Game.calculatePlayerLevel(Game.playerData.xp);
        console.log('Yandex SDK initialized');
    } catch (err) {
        console.error('Yandex SDK error:', err);
    }
};

Game.savePlayerData = function() {
    try {
        var data = {
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
            totalScore: Game.playerData.totalScore,
            upgrades: Game.playerData.upgrades,
            shipColor: Game.playerData.shipColor
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
            var isAvailable = await Game.ysdk.isAvailableMethod('leaderboards.setScore');
            if (isAvailable) await Game.ysdk.leaderboards.setScore('highscore', score);
        }
    } catch (err) {
        console.error('Leaderboard error:', err);
    }
};

console.log('✅ state/sdk.js загружен');