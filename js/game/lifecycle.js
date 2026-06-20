// ==========================================
// ЖИЗНЕННЫЙ ЦИКЛ ИГРЫ
// ==========================================

// 🔧 УНИВЕРСАЛЬНАЯ ОЧИСТКА: мир + death-анимации + canvas + setTimeout
window.clearGameWorld = function() {
    // 🔧 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: очищаем все запланированные setTimeout спавна врагов
    if (window.waveSpawnTimers && window.waveSpawnTimers.length > 0) {
        window.waveSpawnTimers.forEach(timerId => {
            clearTimeout(timerId);
        });
        window.waveSpawnTimers.length = 0;
        console.log(`🧹 Очищено ${window.waveSpawnTimers.length} setTimeout спавна врагов`);
    }

    Game.particles.length = 0;
    Game.bullets.length = 0;
    Game.enemyBullets.length = 0;
    Game.enemies.length = 0;
    Game.drones.length = 0;
    var s = Game.state;
    s.shakeAmount = 0;
    s.invulnerable = 0;
    s.announcementTimer = 0;
    s.waveState = 'IDLE';
    s.currentWave = 0;
    s.deathAnimationTimer = 0;
    s.isPlayerDead = false;
    s.waveTimer = 0;
    s.currentWaveConfig = null;
    s.waveAnnouncement = '';
    Game.player.visible = false;

    var fade = document.getElementById('deathFadeOverlay');
    var text = document.getElementById('gameOverText');
    if (fade) {
        fade.classList.remove('active');
        fade.style.opacity = '0';
        fade.style.pointerEvents = 'none';
    }
    if (text) {
        text.classList.remove('active');
        text.classList.add('hidden');
        text.style.opacity = '0';
        text.style.transform = 'translate(-50%, -50%) scale(0.5)';
        text.style.pointerEvents = 'none';
    }

    if (Game.ctx && Game.canvas) {
        var ctx = Game.ctx;
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        if (Game.stars) {
            Game.stars.forEach(function(star) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + star.brightness + ')';
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });
        }
    }
};

Game.gameOver = function() {
    var s = Game.state;
    s.currentState = Game.STATE.DYING;
    s.deathAnimationTimer = 0;
    s.isPlayerDead = true;
    Game.player.visible = false;
    Game.createExplosion(Game.player.x, Game.player.y, true);
    Game.playPlayerExplosionSound();
    s.shakeAmount = 25;
    s.coinsEarned = s.mode === 'arcade' ? Math.floor(s.score / 2) : Math.floor(s.score * 1.5);
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }
    Game.playerData.coins += s.coinsEarned;
    Game.savePlayerData();

    if (s.mode === 'arcade') Game.submitLeaderboardScore(s.score);
};

Game.levelComplete = function() {
    var s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    s.coinsEarned = s.score * 2;
    Game.playerData.coins += s.coinsEarned;
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }

    var levelBonusXP = s.level * 50;
    s.xpEarned = (s.xpEarned || 0) + levelBonusXP;
    Game.addXP(levelBonusXP);

    if (!Game.playerData.levelsCompleted.includes(s.level)) {
        Game.playerData.levelsCompleted.push(s.level);
    }
    if (s.level >= Game.playerData.maxLevelUnlocked) {
        Game.playerData.maxLevelUnlocked = Math.min(20, s.level + 1);
    }

    Game.savePlayerData();
    Game.resetWorld();
    Game.showLevelCompleteScreen();
};

// === СТАРТ ИГРЫ С ПРИМЕНЕНИЕМ АПГРЕЙДОВ ===
function actuallyStartGame(mode, level) {
    var s = Game.state;
    clearGameWorld();
    Game.initAudio();
    var overlayIds = ['deathScreen', 'levelCompleteScreen', 'pauseScreen'];
    overlayIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.classList.remove('fade-out');
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-1';
        }
    });

    var nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        nextLevelBtn.classList.add('hidden');
        nextLevelBtn.style.display = 'none';
    }

    if (typeof hideMainMenuUI === 'function') {
        hideMainMenuUI();
    } else {
        document.body.classList.add('in-game');
        var mainMenu = document.getElementById('mainMenu');
        var sidebar = document.querySelector('.sidebar');
        var mainContent = document.querySelector('.main-content');
        if (mainMenu) mainMenu.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
    }

    if (typeof showGameHUD === 'function') {
        showGameHUD();
    } else {
        document.body.classList.add('in-game');
        document.body.classList.remove('showing-overlay');
        var uiEl = document.getElementById('ui');
        if (uiEl) {
            uiEl.classList.remove('hidden');
            uiEl.style.display = '';
            uiEl.style.visibility = '';
            uiEl.style.opacity = '';
            uiEl.style.pointerEvents = '';
        }
    }

    s.mode = mode;
    s.score = 0;
    s.coinsEarned = 0;
    s.xpEarned = 0;

    // 🔧 HP КОРБЛЯ С УЧЁТОМ АПГРЕЙДОВ
    var shipHpUpgrade = (Game.playerData.upgrades && Game.playerData.upgrades.shipHp) ? Game.playerData.upgrades.shipHp : 0;
    s.maxHp = 3 + shipHpUpgrade;
    s.hp = s.maxHp;

    if (mode === 'arcade') {
        s.currentState = Game.STATE.ARCADE;
        s.levelWaves = Game.generateEndlessWaves(0);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    } else {
        s.level = level || Game.playerData.maxLevelUnlocked;
        s.currentState = Game.STATE.CAMPAIGN;
        s.levelWaves = Game.getWavesForLevel(s.level);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    }

    Game.resetPlayer();
    Game.spawnDrones();
    document.body.style.cursor = 'none';

    console.log('🎮 Игра начата. HP: ' + s.maxHp + ', Волн: ' + s.totalWaves + ', Дронов: ' + Game.drones.length);

    // 🔧 ИСПРАВЛЕНО: сохраняем setTimeout в массив
    const startTimerId = setTimeout(function() {
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            Game.startWave(0);
        }
    }, 1000);
    
    if (!window.waveSpawnTimers) window.waveSpawnTimers = [];
    window.waveSpawnTimers.push(startTimerId);
}

Game.startGame = function(mode) { actuallyStartGame(mode); };
Game.startCampaignFromLevel = function(level) { actuallyStartGame('campaign', level); };
Game.nextLevel = function() {
    var next = Math.min(20, Game.state.level + 1);
    Game.playerData.maxLevelUnlocked = Math.max(Game.playerData.maxLevelUnlocked, next);
    Game.savePlayerData();
    Game.startCampaignFromLevel(next);
};
Game.resetWorld = function() {
    clearGameWorld();
};
Game.resetAllAnimations = function() {
    clearGameWorld();
};

console.log('✅ game/lifecycle.js загружен (с очисткой setTimeout)');