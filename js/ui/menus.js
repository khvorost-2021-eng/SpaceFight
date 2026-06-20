// ==========================================
// ГЛАВНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================

window.currentView = 'home';

// 🔧 ГЛОБАЛЬНАЯ функция переключения views
window.switchView = function(viewName) {
    document.querySelectorAll('.view').forEach(function(v) {
        v.classList.remove('active');
    });
    var targetView = document.getElementById(viewName + 'View');
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.sidebar-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) btn.classList.add('active');
    });

    window.currentView = viewName;

    if (viewName === 'levels') {
        Game.currentLevelPage = 1;
        if (typeof Game.renderLevelPage === 'function') Game.renderLevelPage(1);
    } else if (viewName === 'profile') {
        if (typeof Game.renderProfile === 'function') Game.renderProfile();
    } else if (viewName === 'shop') {
        var shopCoins = document.getElementById('shopCoins');
        if (shopCoins) shopCoins.textContent = '\u041C\u043E\u043D\u0435\u0442\u044B: ' + Game.playerData.coins;
        if (typeof Game.renderShopTab === 'function') Game.renderShopTab('skins');
    }
};

Game.showMainMenu = function() {
    Game.state.currentState = Game.STATE.MENU;

    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');

    // Жёстко скрываем HUD
    var uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.add('hidden');
        uiEl.style.display = 'none';
        uiEl.style.visibility = 'hidden';
        uiEl.style.opacity = '0';
        uiEl.style.pointerEvents = 'none';
    }

    // Жёстко скрываем все overlay-экраны (включая deathScreen)
    ['deathScreen', 'levelCompleteScreen', 'pauseScreen'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-1';
        }
    });

    // Скрываем мобильную паузу
    var mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (mobilePauseBtn) mobilePauseBtn.classList.add('hidden');

    // Показываем sidebar и main-content
    var sidebar = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (sidebar) { sidebar.style.display = ''; sidebar.style.visibility = ''; }
    if (mainContent) { mainContent.style.display = ''; mainContent.style.visibility = ''; }

    // Очищаем мир
    if (typeof clearGameWorld === 'function') clearGameWorld();
    if (typeof Game.resetWorld === 'function') Game.resetWorld();
    if (typeof Game.hideDeathOverlays === 'function') Game.hideDeathOverlays();

    // Обновляем статистику
    var menuCoins = document.getElementById('menuCoins');
    var menuLevel = document.getElementById('menuLevel');
    if (menuCoins) menuCoins.textContent = Game.playerData.coins;
    if (menuLevel) menuLevel.textContent = Game.playerData.playerLevel;

    // Переключаемся на главную через глобальную switchView
    window.switchView('home');
    document.body.style.cursor = 'default';
    console.log('\u2705 \u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0432 \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043C\u0435\u043D\u044E');
};

// НЕ перезаписываем Game.showLevelSelect, Game.showProfileScreen, Game.showShopScreen

console.log('\u2705 ui/menus.js \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D');