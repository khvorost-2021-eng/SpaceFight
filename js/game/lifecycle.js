// ==========================================
// ЖИЗНЕННЫЙ ЦИКЛ ИГРЫ
// ==========================================

Game.gameOver = function() {
    const s = Game.state;
    s.currentState = Game.STATE.DYING;
    s.deathAnimationTimer = 0;
    s.isPlayerDead = true;
    Game.player.visible = false;
    
    Game.createExplosion(Game.player.x, Game.player.y, true);
    Game.playPlayerExplosionSound();
    s.shakeAmount = 25;
    
    s.coinsEarned = s.mode === 'arcade' ? Math.floor(s.score / 2) : Math.floor(s.score * 1.5);
    
    // Обновляем лучший счёт
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }
    
    Game.playerData.coins += s.coinsEarned;
    Game.savePlayerData();
    
    if (s.mode === 'arcade') Game.submitLeaderboardScore(s.score);
};

Game.levelComplete = function() {
    const s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    s.coinsEarned = s.score * 2;
    Game.playerData.coins += s.coinsEarned;
    
    // Обновляем лучший счёт
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }
    
    const levelBonusXP = s.level * 50;
    s.xpEarned = (s.xpEarned || 0) + levelBonusXP;
    Game.addXP(levelBonusXP);
    
    if (!Game.playerData.levelsCompleted.includes(s.level)) {
        Game.playerData.levelsCompleted.push(s.level);
    }
    if (s.level >= Game.playerData.maxLevelUnlocked) {
        Game.playerData.maxLevelUnlocked = Math.min(20, s.level + 1);
    }
    
    Game.savePlayerData();
    Game.showLevelCompleteScreen();
};

function actuallyStartGame(mode, level) {
    const s = Game.state;
    
    Game.resetAllAnimations();
    Game.initAudio();
    
    // === ЖЕЛЕЗОБЕТОННОЕ СКРЫТИЕ ВСЕХ OVERLAY-ЭКРАНОВ ===
    const overlayIds = ['deathScreen', 'levelCompleteScreen', 'pauseScreen'];
    overlayIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.classList.remove('fade-out');
            // Принудительные inline-стили (на случай CSS-конфликтов)
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-1';
        }
    });
    
    // СКРЫВАЕМ кнопку "Следующий уровень" при старте игры
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        nextLevelBtn.classList.add('hidden');
        nextLevelBtn.style.display = 'none';
    }
    
    // === СКРЫТИЕ ГЛАВНОГО МЕНЮ ===
    if (typeof hideMainMenuUI === 'function') {
        hideMainMenuUI();
    } else {
        // Fallback если функция не экспортирована
        document.body.classList.add('in-game');
        const mainMenu = document.getElementById('mainMenu');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (mainMenu) mainMenu.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
    }
    
    // === ПОКАЗ ИГРОВОГО HUD ===
    if (typeof showGameHUD === 'function') {
        showGameHUD();
    } else {
        document.body.classList.add('in-game');
        document.body.classList.remove('showing-overlay');
        const uiEl = document.getElementById('ui');
        if (uiEl) {
            uiEl.classList.remove('hidden');
            uiEl.style.display = '';
            uiEl.style.visibility = '';
            uiEl.style.opacity = '';
            uiEl.style.pointerEvents = '';
            uiEl.style.zIndex = '';
        }
    }
    
    // === ИНИЦИАЛИЗАЦИЯ ИГРОВОГО СОСТОЯНИЯ ===
    s.mode = mode;
    s.score = 0;
    s.hp = s.maxHp;
    s.coinsEarned = 0;
    s.xpEarned = 0;
    
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
    
    console.log(`🎮 Игра начата. Волн: ${s.totalWaves}, Дронов: ${Game.drones.length}`);
    
    setTimeout(() => {
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            Game.startWave(0);
        }
    }, 1000);
}

Game.startGame = function(mode) {
    actuallyStartGame(mode);
};

Game.startCampaignFromLevel = function(level) {
    actuallyStartGame('campaign', level);
};

Game.nextLevel = function() {
    const next = Math.min(20, Game.state.level + 1);
    Game.playerData.maxLevelUnlocked = Math.max(Game.playerData.maxLevelUnlocked, next);
    Game.savePlayerData();
    Game.startCampaignFromLevel(next);
};

Game.resetWorld = function() {
    Game.particles.length = 0;
    Game.bullets.length = 0;
    Game.enemyBullets.length = 0;
    Game.enemies.length = 0;
    Game.drones.length = 0;
    Game.state.shakeAmount = 0;
    Game.state.invulnerable = 0;
    Game.state.announcementTimer = 0;
    Game.state.waveState = 'IDLE';
    Game.state.currentWave = 0;
    Game.state.deathAnimationTimer = 0;
    Game.state.isPlayerDead = false;
    Game.player.visible = true;
    Game.hideDeathOverlays();
};

Game.resetAllAnimations = function() {
    Game.resetWorld();
};