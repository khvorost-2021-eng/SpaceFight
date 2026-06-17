// ==========================================
// ГЛАВНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================

window.currentView = 'home';

// Глобальная функция переключения views
window.switchView = function(viewName) {
    console.log('\uD83D\uDD04 [switchView] ' + viewName);

    document.querySelectorAll('.view').forEach(function(v) {
        v.classList.remove('active');
    });

    var targetView = document.getElementById(viewName + 'View');
    if (targetView) {
        targetView.classList.add('active');
    }

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

        // Вызываем рендер магазина
        if (typeof Game.renderShopTab === 'function') {
            Game.renderShopTab('skins');
        } else if (typeof window.renderShopTab === 'function') {
            window.renderShopTab('skins');
        } else if (typeof window.renderShopTabInternal === 'function') {
            window.renderShopTabInternal('skins');
        }
    }
};

Game.showMainMenu = function() {
    Game.state.currentState = Game.STATE.MENU;

    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');

    var uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.add('hidden');
        uiEl.style.display = 'none';
    }

    ['deathScreen', 'levelCompleteScreen', 'pauseScreen'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
            el.style.pointerEvents = 'none';
        }
    });

    var mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (mobilePauseBtn) mobilePauseBtn.classList.add('hidden');

    var sidebar = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (sidebar) sidebar.style.display = '';
    if (mainContent) mainContent.style.display = '';

    if (typeof clearGameWorld === 'function') clearGameWorld();

    var menuCoins = document.getElementById('menuCoins');
    var menuLevel = document.getElementById('menuLevel');
    if (menuCoins) menuCoins.textContent = Game.playerData.coins;
    if (menuLevel) menuLevel.textContent = Game.playerData.playerLevel;

    window.switchView('home');
    document.body.style.cursor = 'default';
};

// НЕ перезаписываем Game.showLevelSelect, Game.showProfileScreen, Game.showShopScreen
// Они определены в levels.js, profile.js, shop.js

console.log('\u2705 ui/menus.js \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D');