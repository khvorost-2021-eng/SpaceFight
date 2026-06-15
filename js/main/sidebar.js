// ==========================================
// ИНИЦИАЛИЗАЦИЯ SIDEBAR
// ==========================================

function initSidebar() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    if (sidebarBtns.length === 0) {
        console.warn('⚠️ Sidebar-кнопки не найдены');
        return;
    }
    
    sidebarBtns.forEach(btn => {
        const view = btn.dataset.view;
        if (view) {
            btn.addEventListener('click', () => {
                console.log(`🎨 Sidebar: переключение на ${view}`);
                
                // Настройки пока заглушка
                if (view === 'settings') {
                    if (typeof switchView === 'function') {
                        switchView('settings');
                    }
                    return;
                }
                
                // Для остальных views
                if (typeof switchView === 'function') {
                    switchView(view);
                } else {
                    // Fallback на старые функции
                    if (view === 'levels') safeCall(Game.showLevelSelect);
                    else if (view === 'profile') safeCall(Game.showProfileScreen);
                    else if (view === 'shop') safeCall(Game.showShopScreen);
                    else if (view === 'home') {
                        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                        const homeView = document.getElementById('homeView');
                        if (homeView) homeView.classList.add('active');
                    }
                }
            });
        }
    });
    
    console.log('✅ Sidebar инициализирован');
}

window.initSidebar = initSidebar;

console.log('✅ main/sidebar.js загружен');