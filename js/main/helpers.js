// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ UI
// ==========================================

window.safeCall = function(fn, ...args) {
    if (typeof fn === 'function') {
        try {
            return fn(...args);
        } catch (e) {
            console.error('❌ Ошибка вызова функции:', e);
        }
    } else {
        console.warn('⚠️ Функция не найдена:', fn);
    }
};

window.showGameHUD = function() {
    document.body.classList.add('in-game');
    document.body.classList.remove('showing-overlay');
    
    const uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.remove('hidden');
        uiEl.style.display = '';
        uiEl.style.visibility = '';
        uiEl.style.opacity = '';
        uiEl.style.pointerEvents = '';
    }
};

window.hideGameHUD = function() {
    document.body.classList.remove('in-game');
    if (DOM.ui) DOM.ui.classList.add('hidden');
};

window.hideAllOverlayScreens = function() {
    const screens = ['deathScreen', 'levelCompleteScreen', 'pauseScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
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
};

window.showMainMenuUI = function() {
    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');
    
    if (DOM.sidebar) DOM.sidebar.style.display = '';
    if (DOM.mainContent) DOM.mainContent.style.display = '';
    if (DOM.mainMenu) {
        DOM.mainMenu.classList.remove('hidden');
        DOM.mainMenu.classList.remove('fade-out');
    }
    
    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.classList.add('hidden');
    }
};

window.hideMainMenuUI = function() {
    document.body.classList.add('in-game');
    if (DOM.sidebar) DOM.sidebar.style.display = 'none';
    if (DOM.mainContent) DOM.mainContent.style.display = 'none';
    if (DOM.mainMenu) DOM.mainMenu.classList.add('hidden');
};

console.log('✅ main/helpers.js загружен');