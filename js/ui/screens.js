// ==========================================
// ЭКРАНЫ СМЕРТИ И ПОБЕДЫ
// ==========================================
Game.showDeathScreen = function() {
    const s = Game.state;
    s.currentState = Game.STATE.GAME_OVER;
    console.log('💀 Показ экрана смерти');

    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainMenu = document.getElementById('mainMenu');
    if (sidebar) {
        sidebar.style.display = 'none';
        sidebar.style.visibility = 'hidden';
    }
    if (mainContent) {
        mainContent.style.display = 'none';
        mainContent.style.visibility = 'hidden';
    }
    if (mainMenu) {
        mainMenu.style.display = 'none';
        mainMenu.style.visibility = 'hidden';
    }

    const uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');

    const deathScore = document.getElementById('deathScore');
    const deathCoins = document.getElementById('deathCoins');
    const deathXP = document.getElementById('deathXP');

    if (deathScore) deathScore.textContent = `Счёт: ${s.score}`;
    if (deathCoins) deathCoins.textContent = `Получено монет: ${s.coinsEarned}`;
    if (deathXP) deathXP.textContent = `Получено опыта: ${s.xpEarned || 0}`;

    Game.hideDeathOverlays();

    const deathScreen = document.getElementById('deathScreen');
    if (deathScreen) {
        deathScreen.classList.remove('hidden');
        deathScreen.classList.remove('fade-out');
        deathScreen.style.display = 'flex';
        deathScreen.style.visibility = 'visible';
        deathScreen.style.opacity = '1';
        deathScreen.style.pointerEvents = 'auto';
        deathScreen.style.zIndex = '2000';
    }

    // 🔧 ДИНАМИЧЕСКИЙ ОБРАБОТЧИК menuBtn — зависит от режима
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.style.pointerEvents = 'auto';
        menuBtn.style.zIndex = '2001';
        
        if (s.mode === 'campaign') {
            menuBtn.textContent = '🗺️ В уровни';
            menuBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🗺️ Клик: В уровни (из смерти)');
                
                if (DOM.deathScreen) {
                    DOM.deathScreen.classList.add('hidden');
                    DOM.deathScreen.style.display = 'none';
                    DOM.deathScreen.style.visibility = 'hidden';
                    DOM.deathScreen.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showLevelSelect);
            };
        } else {
            menuBtn.textContent = '🏠 В меню';
            menuBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Клик: В меню (из смерти)');
                
                if (DOM.deathScreen) {
                    DOM.deathScreen.classList.add('hidden');
                    DOM.deathScreen.style.display = 'none';
                    DOM.deathScreen.style.visibility = 'hidden';
                    DOM.deathScreen.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showMainMenu);
            };
        }
    }

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.style.pointerEvents = 'auto';
        restartBtn.style.zIndex = '2001';
    }

    document.body.style.cursor = 'default';
    console.log('✅ Экран смерти показан');
};

Game.showLevelCompleteScreen = function() {
    const s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    
    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainMenu = document.getElementById('mainMenu');
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (mainMenu) mainMenu.style.display = 'none';

    const uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');

    const info = document.getElementById('levelCompleteInfo');
    if (info) {
        info.innerHTML = 
            `Уровень ${s.level} пройден!<br>Получено монет: ${s.coinsEarned}<br>Получено опыта: ${s.xpEarned || 0}`;
    }

    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        if (s.mode === 'campaign') {
            nextLevelBtn.classList.remove('hidden');
            nextLevelBtn.style.display = '';
        } else {
            nextLevelBtn.classList.add('hidden');
            nextLevelBtn.style.display = 'none';
        }
    }

    const completeScreen = document.getElementById('levelCompleteScreen');
    if (completeScreen) {
        completeScreen.classList.remove('hidden');
        completeScreen.classList.add('active');
        completeScreen.style.display = '';
        completeScreen.style.visibility = '';
        completeScreen.style.opacity = '';
        completeScreen.style.pointerEvents = '';
        completeScreen.style.zIndex = '';
    }

    // 🔧 ДИНАМИЧЕСКИЙ ОБРАБОТЧИК levelCompleteMenuBtn
    const levelCompleteMenuBtn = document.getElementById('levelCompleteMenuBtn');
    if (levelCompleteMenuBtn) {
        if (s.mode === 'campaign') {
            levelCompleteMenuBtn.textContent = '🗺️ В уровни';
            levelCompleteMenuBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🗺️ Клик: В уровни (из победы)');
                
                if (DOM.levelCompleteScreen) {
                    DOM.levelCompleteScreen.classList.add('hidden');
                    DOM.levelCompleteScreen.style.display = 'none';
                    DOM.levelCompleteScreen.style.visibility = 'hidden';
                    DOM.levelCompleteScreen.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showLevelSelect);
            };
        } else {
            levelCompleteMenuBtn.textContent = '🏠 В меню';
            levelCompleteMenuBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Клик: В меню (из победы)');
                
                if (DOM.levelCompleteScreen) {
                    DOM.levelCompleteScreen.classList.add('hidden');
                    DOM.levelCompleteScreen.style.display = 'none';
                    DOM.levelCompleteScreen.style.visibility = 'hidden';
                    DOM.levelCompleteScreen.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showMainMenu);
            };
        }
    }

    document.body.style.cursor = 'default';
};