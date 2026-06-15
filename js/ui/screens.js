// ==========================================
// ЭКРАНЫ СМЕРТИ И ПОБЕДЫ
// ==========================================

Game.showDeathScreen = function() {
    const s = Game.state;
    s.currentState = Game.STATE.GAME_OVER;
    
    console.log('💀 Показ экрана смерти');
    
    // === ВАЖНО: Убираем in-game, чтобы deathScreen был виден ===
    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');
    
    // Скрываем sidebar и main-content
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
    
    // Скрываем игровой HUD
    const uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');
    
    // Заполняем данные
    const deathScore = document.getElementById('deathScore');
    const deathCoins = document.getElementById('deathCoins');
    const deathXP = document.getElementById('deathXP');
    
    if (deathScore) deathScore.textContent = `Счёт: ${s.score}`;
    if (deathCoins) deathCoins.textContent = `Получено монет: ${s.coinsEarned}`;
    if (deathXP) deathXP.textContent = `Получено опыта: ${s.xpEarned || 0}`;
    
    Game.hideDeathOverlays();
    
    // ПОКАЗЫВАЕМ экран смерти
    const deathScreen = document.getElementById('deathScreen');
    if (deathScreen) {
        deathScreen.classList.remove('hidden');
        deathScreen.classList.remove('fade-out');
        deathScreen.style.display = 'flex';
        deathScreen.style.visibility = 'visible';
        deathScreen.style.opacity = '1';
        deathScreen.style.pointerEvents = 'auto';
        deathScreen.style.zIndex = '2000';
        
        // Убеждаемся что кнопки кликабельны
        const restartBtn = document.getElementById('restartBtn');
        const menuBtn = document.getElementById('menuBtn');
        if (restartBtn) {
            restartBtn.style.pointerEvents = 'auto';
            restartBtn.style.zIndex = '2001';
        }
        if (menuBtn) {
            menuBtn.style.pointerEvents = 'auto';
            menuBtn.style.zIndex = '2001';
        }
    }
    
    document.body.style.cursor = 'default';
    console.log('✅ Экран смерти показан');
};

Game.showLevelCompleteScreen = function() {
    const s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    
    // Убираем in-game, добавляем showing-overlay
    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');
    
    // Скрываем sidebar и main-content
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mainMenu = document.getElementById('mainMenu');
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (mainMenu) mainMenu.style.display = 'none';
    
    // Скрываем игровой HUD
    const uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');
    
    // Заполняем данные
    const info = document.getElementById('levelCompleteInfo');
    if (info) {
        info.innerHTML = 
            `Уровень ${s.level} пройден!<br>Получено монет: ${s.coinsEarned}<br>Получено опыта: ${s.xpEarned || 0}`;
    }
    
    // ПОКАЗЫВАЕМ кнопку "Следующий уровень" ТОЛЬКО для кампании
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        if (s.mode === 'campaign') {
            nextLevelBtn.classList.remove('hidden');
            nextLevelBtn.style.display = '';
        } else {
            // В бесконечном режиме скрываем
            nextLevelBtn.classList.add('hidden');
            nextLevelBtn.style.display = 'none';
        }
    }
    
    // ПОКАЗЫВАЕМ экран победы
    const completeScreen = document.getElementById('levelCompleteScreen');
    if (completeScreen) {
        completeScreen.classList.remove('hidden');
        completeScreen.classList.add('active');
        // Сбрасываем inline-стили
        completeScreen.style.display = '';
        completeScreen.style.visibility = '';
        completeScreen.style.opacity = '';
        completeScreen.style.pointerEvents = '';
        completeScreen.style.zIndex = '';
    }
    
    document.body.style.cursor = 'default';
};