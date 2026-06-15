// ==========================================
// ГЛАВНОЕ МЕНЮ И НАВИГАЦИЯ (НОВАЯ ВЕРСИЯ)
// ==========================================

let currentView = 'home';

Game.showMainMenu = function() {
    Game.state.currentState = Game.STATE.MENU;
    
    // === УБИРАЕМ игровой state ===
    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');
    
    // === ЖЕЛЕЗОБЕТОННОЕ СКРЫТИЕ ИГРОВОГО HUD ===
    const uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.add('hidden');
        uiEl.style.display = 'none';
        uiEl.style.visibility = 'hidden';
        uiEl.style.opacity = '0';
        uiEl.style.pointerEvents = 'none';
    }
    
    // === Принудительно скрываем все игровые экраны ===
    const screensToHide = ['deathScreen', 'levelCompleteScreen', 'pauseScreen'];
    screensToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
        }
    });
    
    // === Скрываем мобильную кнопку паузы ===
    const mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (mobilePauseBtn) {
        mobilePauseBtn.classList.add('hidden');
    }
    
    // === Восстанавливаем видимость sidebar и main-content ===
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) {
        sidebar.style.display = '';
        sidebar.style.visibility = '';
    }
    if (mainContent) {
        mainContent.style.display = '';
        mainContent.style.visibility = '';
    }
    
    Game.resetWorld();
    Game.hideDeathOverlays();
    
    // Обновляем статистику
    const menuCoins = document.getElementById('menuCoins');
    const menuLevel = document.getElementById('menuLevel');
    if (menuCoins) menuCoins.textContent = Game.playerData.coins;
    if (menuLevel) menuLevel.textContent = Game.playerData.playerLevel;
    
    // Показываем главное меню
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
        mainMenu.classList.remove('hidden');
        mainMenu.classList.remove('fade-out');
        mainMenu.style.display = '';
        mainMenu.style.visibility = '';
    }
    
    // Переключаемся на главную вкладку
    if (typeof switchView === 'function') {
        switchView('home');
    } else {
        // Fallback если switchView не определена
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const homeView = document.getElementById('homeView');
        if (homeView) homeView.classList.add('active');
        
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === 'home') {
                btn.classList.add('active');
            }
        });
    }
    
    document.body.style.cursor = 'default';
    console.log('✅ Возврат в главное меню - HUD скрыт');
};

function switchView(viewName) {
    // Скрываем все view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Показываем выбранный view
    const targetView = document.getElementById(viewName + 'View');
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Обновляем активную кнопку в sidebar
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });
    
    currentView = viewName;
    
    // Рендерим контент для конкретного view
    if (viewName === 'levels') {
        Game.currentLevelPage = 1;
        Game.renderLevelPage(1);
    } else if (viewName === 'profile') {
        Game.renderProfile();
    } else if (viewName === 'shop') {
        document.getElementById('shopCoins').textContent = `Монеты: ${Game.playerData.coins}`;
        if (window.renderShopTabInternal) {
            window.renderShopTabInternal('skins');
        }
    }
}

Game.showLevelSelect = function() {
    switchView('levels');
};

Game.showProfileScreen = function() {
    switchView('profile');
};

Game.showShopScreen = function() {
    switchView('shop');
};

// Инициализация обработчиков sidebar
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
});