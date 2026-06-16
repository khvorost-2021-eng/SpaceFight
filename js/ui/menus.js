// ==========================================
// ГЛАВНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================

window.currentView = 'home';

// 🔧 ГЛОБАЛЬНАЯ функция переключения views
window.switchView = function(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(viewName + 'View');
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
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
        const shopCoins = document.getElementById('shopCoins');
        if (shopCoins) shopCoins.textContent = `Монеты: ${Game.playerData.coins}`;
        // Пробуем вызвать рендер магазина
        if (typeof Game.renderShopTab === 'function') {
            Game.renderShopTab('skins');
        } else if (typeof window.renderShopTabInternal === 'function') {
            window.renderShopTabInternal('skins');
        }
    } else if (viewName === 'settings') {
        // Заглушка
    }
};

Game.showMainMenu = function() {
    Game.state.currentState = Game.STATE.MENU;

    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');

    const uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.add('hidden');
        uiEl.style.display = 'none';
        uiEl.style.visibility = 'hidden';
        uiEl.style.opacity = '0';
        uiEl.style.pointerEvents = 'none';
    }

    ['deathScreen', 'levelCompleteScreen', 'pauseScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
        }
    });

    const mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (mobilePauseBtn) mobilePauseBtn.classList.add('hidden');

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) { sidebar.style.display = ''; sidebar.style.visibility = ''; }
    if (mainContent) { mainContent.style.display = ''; mainContent.style.visibility = ''; }

    if (typeof clearGameWorld === 'function') clearGameWorld();
    if (typeof Game.resetWorld === 'function') Game.resetWorld();
    if (typeof Game.hideDeathOverlays === 'function') Game.hideDeathOverlays();

    const menuCoins = document.getElementById('menuCoins');
    const menuLevel = document.getElementById('menuLevel');
    if (menuCoins) menuCoins.textContent = Game.playerData.coins;
    if (menuLevel) menuLevel.textContent = Game.playerData.playerLevel;

    window.switchView('home');
    document.body.style.cursor = 'default';
    console.log('✅ Возврат в главное меню');
};

// 🔧 НЕ перезаписываем Game.showLevelSelect, Game.showProfileScreen, Game.showShopScreen
// Они определены в levels.js, profile.js, shop.js соответственно

console.log('✅ ui/menus.js загружен');