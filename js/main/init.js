// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// ==========================================

Game.init = async function() {
    console.log('🟢 Game.init() запущен');
    
    // Кэшируем DOM-элементы
    if (typeof cacheDOMElements === 'function') {
        cacheDOMElements();
    }
    
    // === ЗАГРУЗКА АССЕТОВ ===
    try {
        console.log('📦 Загрузка SDK и ассетов...');
        await Promise.all([
            Game.initYandexSDK(),
            Game.loadShips(),
            Game.loadDroneImages()
        ]);
        console.log('✅ Ассеты загружены');
    } catch (e) {
        console.error('❌ Ошибка загрузки ассетов:', e);
    }
    
    // === ПОКАЗ ГЛАВНОГО МЕНЮ ===
    try {
        console.log('🎨 Показ главного меню...');
        safeCall(Game.showMainMenu);
        console.log('✅ Меню показано');
    } catch (e) {
        console.error('❌ Ошибка показа меню:', e);
    }
    
    // === ЗАПУСК ИГРОВОГО ЦИКЛА ===
    try {
        console.log('🔄 Запуск игрового цикла...');
        safeCall(Game.gameLoop);
        console.log('✅ Цикл запущен');
    } catch (e) {
        console.error('❌ Ошибка запуска цикла:', e);
    }
    
    // === НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ===
    if (typeof setupEventHandlers === 'function') {
        setupEventHandlers();
    }
    
    // === ПРИВЯЗКА КНОПОК ===
    if (typeof bindButtons === 'function') {
        bindButtons();
    }
    
    // === ИНИЦИАЛИЗАЦИЯ SIDEBAR ===
    if (typeof initSidebar === 'function') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSidebar);
        } else {
            initSidebar();
        }
    }
    
    console.log('✅ Все обработчики привязаны');
    
    // === ОБРАБОТКА RESIZE ===
    window.addEventListener('resize', () => {
        Game.canvas.width = window.innerWidth;
        Game.canvas.height = window.innerHeight;
    });
    
    // === АВТО-СТРЕЛЬБА ИГРОКА ===
    setInterval(() => {
        const s = Game.state;
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            const rotation = Game.player.rotation;
            const gunOffset = 15;
            for (let side = -1; side <= 1; side += 2) {
                const gunX = Game.player.x + Math.cos(rotation) * gunOffset * side;
                const gunY = Game.player.y + Math.sin(rotation) * gunOffset * side;
                Game.bullets.push({ x: gunX, y: gunY, width: 4, height: 12 });
            }
            safeCall(Game.playShootSound);
        }
    }, 150);
    
    console.log('🎉 Инициализация завершена!');
};

console.log('✅ main/init.js загружен');