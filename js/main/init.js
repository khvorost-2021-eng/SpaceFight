// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// ==========================================
Game.init = async function() {
    console.log('🟢 Game.init() запущен');

    if (typeof cacheDOMElements === 'function') cacheDOMElements();

    try {
        console.log('📦 Загрузка SDK и ассетов...');
        await Promise.all([Game.initYandexSDK(), Game.loadShips(), Game.loadDroneImages()]);
        console.log('✅ Ассеты загружены');
    } catch (e) { console.error('❌ Ошибка загрузки ассетов:', e); }

    try {
        console.log('🎨 Показ главного меню...');
        if (typeof Game.showMainMenu === 'function') {
            Game.showMainMenu();
        }
        console.log('✅ Меню показано');
    } catch (e) { console.error('❌ Ошибка показа меню:', e); }

    try {
        if (typeof Game.gameLoop === 'function') Game.gameLoop();
    } catch (e) { console.error('❌ Ошибка запуска цикла:', e); }

    if (typeof setupEventHandlers === 'function') setupEventHandlers();
    if (typeof bindButtons === 'function') bindButtons();

    // 🔧 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: проверяем window.initSidebar, а не локальную
    if (typeof window.initSidebar === 'function') {
        console.log('🔧 Вызов window.initSidebar()...');
        window.initSidebar();
    } else {
        console.error('❌ window.initSidebar НЕ НАЙДЕНА! Sidebar кнопки не будут работать!');
    }

    window.addEventListener('resize', () => {
        Game.canvas.width = window.innerWidth;
        Game.canvas.height = window.innerHeight;
    });

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