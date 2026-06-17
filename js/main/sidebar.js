// ==========================================
// ИНИЦИАЛИЗАЦИЯ SIDEBAR
// ==========================================
function initSidebar() {
    console.log('🔧 [initSidebar] Запуск...');
    
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    console.log(`  Найдено ${sidebarBtns.length} кнопок sidebar`);
    
    if (sidebarBtns.length === 0) {
        console.warn('  ⚠️ Sidebar-кнопки не найдены');
        return;
    }

    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (!view) return;

            console.log(`\n🎨 [Sidebar] Клик по кнопке: ${view}`);

            // Скрываем все overlay-экраны
            ['deathScreen', 'levelCompleteScreen', 'pauseScreen'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('hidden');
                    el.style.display = 'none';
                    el.style.pointerEvents = 'none';
                }
            });

            document.body.classList.remove('in-game');
            document.body.classList.remove('showing-overlay');

            // Проверяем доступность switchView
            console.log(`  switchView type: ${typeof window.switchView}`);
            console.log(`  Game.showShopScreen type: ${typeof Game.showShopScreen}`);
            console.log(`  Game.showLevelSelect type: ${typeof Game.showLevelSelect}`);

            switch(view) {
                case 'home':
                    if (typeof Game.showMainMenu === 'function') {
                        console.log('  → Вызов Game.showMainMenu()');
                        Game.showMainMenu();
                    }
                    break;
                case 'levels':
                    if (typeof Game.showLevelSelect === 'function') {
                        console.log('  → Вызов Game.showLevelSelect()');
                        Game.showLevelSelect();
                    } else if (typeof window.switchView === 'function') {
                        console.log('  → Вызов window.switchView("levels")');
                        window.switchView('levels');
                    }
                    break;
                case 'profile':
                    if (typeof Game.showProfileScreen === 'function') {
                        console.log('  → Вызов Game.showProfileScreen()');
                        Game.showProfileScreen();
                    } else if (typeof window.switchView === 'function') {
                        console.log('  → Вызов window.switchView("profile")');
                        window.switchView('profile');
                    }
                    break;
                case 'shop':
                    if (typeof Game.showShopScreen === 'function') {
                        console.log('  → Вызов Game.showShopScreen()');
                        Game.showShopScreen();
                    } else if (typeof window.switchView === 'function') {
                        console.log('  → Вызов window.switchView("shop")');
                        window.switchView('shop');
                    }
                    break;
                case 'settings':
                    if (typeof window.switchView === 'function') {
                        console.log('  → Вызов window.switchView("settings")');
                        window.switchView('settings');
                    }
                    break;
            }
        });
    });

    console.log('✅ [initSidebar] Обработчики навешены');
}

window.initSidebar = initSidebar;
console.log('✅ main/sidebar.js загружен');