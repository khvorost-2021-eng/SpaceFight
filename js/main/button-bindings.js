// ==========================================
// ПРИВЯЗКА КНОПОК
// ==========================================
function bindButtons() {
    // === КНОПКА "ИГРАТЬ" (АРКАДА) ===
    if (DOM.arcadeBtn) {
        DOM.arcadeBtn.onclick = () => {
            console.log('🎮 Клик: arcade');
            hideMainMenuUI();
            hideAllOverlayScreens();
            showGameHUD();
            
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            safeCall(Game.startGame, 'arcade');
        };
    }

    // === МОБИЛЬНАЯ КНОПКА ПАУЗЫ ===
    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('📱 Клик: мобильная пауза');
            
            const s = Game.state;
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = '';
                    DOM.pauseScreen.style.visibility = '';
                }
                document.body.style.cursor = 'default';
            }
        });
    }

    // === КНОПКА "ПРОДОЛЖИТЬ" В ПАУЗЕ ===
    if (DOM.pauseResumeBtn) {
        DOM.pauseResumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const s = Game.state;
            if (s.currentState === Game.STATE.PAUSED) {
                s.currentState = s.mode === 'arcade' ? Game.STATE.ARCADE : Game.STATE.CAMPAIGN;
                document.body.classList.remove('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.add('hidden');
                    DOM.pauseScreen.style.display = 'none';
                }
                document.body.style.cursor = 'none';
            }
        });
    }

    // === КНОПКА "ВЫЙТИ В МЕНЮ" В ПАУЗЕ ===
    if (DOM.pauseMenuBtn) {
        DOM.pauseMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (DOM.pauseScreen) {
                DOM.pauseScreen.classList.add('hidden');
                DOM.pauseScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            safeCall(Game.showMainMenu);
        });
    }

    // === НАВИГАЦИЯ ПО УРОВНЯМ ===
    if (DOM.levelPrevBtn) DOM.levelPrevBtn.onclick = () => safeCall(Game.levelPagePrev);
    if (DOM.levelNextBtn) DOM.levelNextBtn.onclick = () => safeCall(Game.levelPageNext);

    // === КНОПКА "ЗАНОВО" НА ЭКРАНЕ СМЕРТИ ===
    if (DOM.restartBtn) {
        DOM.restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Клик: Заново');
            
            const mode = Game.state.mode;
            const level = Game.state.level || 1;
            
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
                DOM.deathScreen.style.visibility = 'hidden';
                DOM.deathScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            if (mode === 'arcade') {
                safeCall(Game.startGame, 'arcade');
            } else {
                safeCall(Game.startCampaignFromLevel, level);
            }
        });
    }

    // 🔧 menuBtn и levelCompleteMenuBtn — ОБРАБОТЧИКИ УСТАНАВЛИВАЮТСЯ ДИНАМИЧЕСКИ В screens.js
    // Здесь оставляем только фолбэк на случай если screens.js не вызвался
    if (DOM.menuBtn && !DOM.menuBtn.onclick) {
        DOM.menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏠 Клик: menuBtn (фолбэк)');
            
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            
            if (Game.state.mode === 'campaign') {
                safeCall(Game.showLevelSelect);
            } else {
                safeCall(Game.showMainMenu);
            }
        });
    }

    if (DOM.levelCompleteMenuBtn && !DOM.levelCompleteMenuBtn.onclick) {
        DOM.levelCompleteMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏠 Клик: levelCompleteMenuBtn (фолбэк)');
            
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            
            if (Game.state.mode === 'campaign') {
                safeCall(Game.showLevelSelect);
            } else {
                safeCall(Game.showMainMenu);
            }
        });
    }

    // === КНОПКА "СЛЕДУЮЩИЙ УРОВЕНЬ" ===
    if (DOM.nextLevelBtn) {
        DOM.nextLevelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Клик: Следующий уровень');
            
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
                DOM.levelCompleteScreen.style.visibility = 'hidden';
                DOM.levelCompleteScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            safeCall(Game.nextLevel);
        });
    }

    // === ВКЛАДКИ МАГАЗИНА ===
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabName = tab.dataset.tab;
            if (window.renderShopTabInternal) {
                window.renderShopTabInternal(tabName);
            }
        });
    });

    console.log('✅ Все кнопки привязаны');
}
window.bindButtons = bindButtons;
console.log('✅ main/button-bindings.js загружен');