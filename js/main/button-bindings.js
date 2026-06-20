// ==========================================
// ПРИВЯЗКА КНОПОК
// ==========================================
function bindButtons() {
    // === КНОПКА "ИГРАТЬ" (АРКАДА) ===
    if (DOM.arcadeBtn) {
        DOM.arcadeBtn.onclick = function() {
            console.log('\uD83C\uDFAE \u041A\u043B\u0438\u043A: arcade');
            hideMainMenuUI();
            hideAllOverlayScreens();
            showGameHUD();
            if (DOM.mobilePauseBtn) DOM.mobilePauseBtn.classList.remove('hidden');
            safeCall(Game.startGame, 'arcade');
        };
    }

    // === МОБИЛЬНАЯ КНОПКА ПАУЗЫ ===
    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var s = Game.state;
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');
                
                if (DOM.pauseMenuBtn) {
                    DOM.pauseMenuBtn.textContent = s.mode === 'campaign' ? '\uD83D\uDDFA\uFE0F \u0412 \u0443\u0440\u043E\u0432\u043D\u0438' : '\uD83C\uDFE0 \u0412\u044B\u0439\u0442\u0438 \u0432 \u043C\u0435\u043D\u044E';
                }
                
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = 'flex';
                    DOM.pauseScreen.style.visibility = 'visible';
                }
                document.body.style.cursor = 'default';
            }
        });
    }

    // === КНОПКА "ПРОДОЛЖИТЬ" В ПАУЗЕ ===
    if (DOM.pauseResumeBtn) {
        DOM.pauseResumeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var s = Game.state;
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

    // === КНОПКА "В МЕНЮ / В УРОВНИ" В ПАУЗЕ ===
    if (DOM.pauseMenuBtn) {
        DOM.pauseMenuBtn.addEventListener('click', function(e) {
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

    // === НАВИГАЦИЯ ПО УРОВНЯМ ===
    if (DOM.levelPrevBtn) DOM.levelPrevBtn.onclick = function() { safeCall(Game.levelPagePrev); };
    if (DOM.levelNextBtn) DOM.levelNextBtn.onclick = function() { safeCall(Game.levelPageNext); };

    // 🔧 УБРАЛИ обработчики для menuBtn, restartBtn, levelCompleteMenuBtn, nextLevelBtn
    // Они теперь устанавливаются динамически в screens.js через addEventListener

    // === ВКЛАДКИ МАГАЗИНА ===
    document.querySelectorAll('.shop-tab').forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.stopPropagation();
            var tabName = tab.dataset.tab;
            if (typeof Game.renderShopTab === 'function') Game.renderShopTab(tabName);
        });
    });

    console.log('\u2705 \u0412\u0441\u0435 \u043A\u043D\u043E\u043F\u043A\u0438 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u044B');
}
window.bindButtons = bindButtons;
console.log('\u2705 main/button-bindings.js \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D');