// ==========================================
// ПРИВЯЗКА КНОПОК
// ==========================================
function bindButtons() {
    if (DOM.arcadeBtn) {
        DOM.arcadeBtn.onclick = () => {
            console.log('🎮 Клик: arcade');
            hideMainMenuUI();
            hideAllOverlayScreens();
            showGameHUD();
            if (DOM.mobilePauseBtn) DOM.mobilePauseBtn.classList.remove('hidden');
            safeCall(Game.startGame, 'arcade');
        };
    }

    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const s = Game.state;
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');
                
                if (DOM.pauseMenuBtn) {
                    DOM.pauseMenuBtn.textContent = s.mode === 'campaign' ? '🗺️ В уровни' : '🏠 Выйти в меню';
                }
                
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = '';
                    DOM.pauseScreen.style.visibility = '';
                }
                document.body.style.cursor = 'default';
            }
        });
    }

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

    if (DOM.pauseMenuBtn) {
        DOM.pauseMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (DOM.pauseScreen) {
                DOM.pauseScreen.classList.add('hidden');
                DOM.pauseScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            if (Game.state.mode === 'campaign') safeCall(Game.showLevelSelect);
            else safeCall(Game.showMainMenu);
        });
    }

    if (DOM.levelPrevBtn) DOM.levelPrevBtn.onclick = () => safeCall(Game.levelPagePrev);
    if (DOM.levelNextBtn) DOM.levelNextBtn.onclick = () => safeCall(Game.levelPageNext);

    if (DOM.restartBtn) {
        DOM.restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = Game.state.mode;
            const level = Game.state.level || 1;
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            if (DOM.mobilePauseBtn) DOM.mobilePauseBtn.classList.remove('hidden');
            if (mode === 'arcade') safeCall(Game.startGame, 'arcade');
            else safeCall(Game.startCampaignFromLevel, level);
        });
    }

    if (DOM.menuBtn && !DOM.menuBtn.onclick) {
        DOM.menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            if (Game.state.mode === 'campaign') safeCall(Game.showLevelSelect);
            else safeCall(Game.showMainMenu);
        });
    }

    if (DOM.levelCompleteMenuBtn && !DOM.levelCompleteMenuBtn.onclick) {
        DOM.levelCompleteMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            if (Game.state.mode === 'campaign') safeCall(Game.showLevelSelect);
            else safeCall(Game.showMainMenu);
        });
    }

    if (DOM.nextLevelBtn) {
        DOM.nextLevelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            if (DOM.mobilePauseBtn) DOM.mobilePauseBtn.classList.remove('hidden');
            safeCall(Game.nextLevel);
        });
    }

    // === ВКЛАДКИ МАГАЗИНА ===
    document.querySelectorAll('.shop-tab').forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.stopPropagation();
            var tabName = tab.dataset.tab;
            console.log('\uD83D\uDED2 \u0412\u043A\u043B\u0430\u0434\u043A\u0430: ' + tabName);

            if (typeof Game.renderShopTab === 'function') {
                Game.renderShopTab(tabName);
            } else if (typeof window.renderShopTab === 'function') {
                window.renderShopTab(tabName);
            } else if (typeof window.renderShopTabInternal === 'function') {
                window.renderShopTabInternal(tabName);
            } else {
                console.error('\u274C \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0440\u0435\u043D\u0434\u0435\u0440\u0438\u043D\u0433\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430!');
            }
        });
    });

    console.log('✅ Все кнопки привязаны');
}
window.bindButtons = bindButtons;
console.log('✅ main/button-bindings.js загружен');