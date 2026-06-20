// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// ==========================================
Game.init = async function() {
    console.log('🟢 Game.init() запущен');

    // === КЭШИРОВАНИЕ DOM ===
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
    // 🔧 setInterval с фиксированным шагом 16ms (60 FPS)
    // Не зависит от частоты обновления монитора (60Hz, 120Hz, 165Hz, 240Hz)
    // Внутри Game.update() используется DT = 2.64 для сохранения скоростей
    try {
        console.log('🔄 Запуск игрового цикла (setInterval 16ms = 60 FPS)...');
        setInterval(Game.gameLoop, 16);
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

    // === АВТО-СТРЕЛЬБА ИГРОКА С УЧЁТОМ АПГРЕЙДОВ ===
    setInterval(() => {
        const s = Game.state;
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            // Применяем апгрейды корабля
            const u = (Game.playerData.upgrades) || {};
            const bulletSpeed = 10 * (1 + (u.shipBulletSpeed || 0) * 0.15);
            const bulletWidth = 4 + (u.shipBulletSize || 0) * 2;
            const bulletHeight = 12 + (u.shipBulletSize || 0) * 4;
            const bulletDamage = 1 + (u.shipDamage || 0);
            const shipColor = (typeof Game.getShipColor === 'function') 
                ? Game.getShipColor() 
                : '#00ffff';

            const rotation = Game.player.rotation;
            const gunOffset = 15;
            for (let side = -1; side <= 1; side += 2) {
                const gunX = Game.player.x + Math.cos(rotation) * gunOffset * side;
                const gunY = Game.player.y + Math.sin(rotation) * gunOffset * side;
                Game.bullets.push({ 
                    x: gunX, 
                    y: gunY, 
                    width: bulletWidth, 
                    height: bulletHeight,
                    vy: -bulletSpeed,
                    damage: bulletDamage,
                    color: shipColor
                });
            }
            safeCall(Game.playShootSound);
        }
    }, 150);

    // === ЗАПУСК ПАРАЛЛАКСА ФОНА ===
    if (typeof window.triggerMenuParallax === 'function') {
        window.triggerMenuParallax();
    }

    console.log('🎉 Инициализация завершена!');
};
console.log('✅ main/init.js загружен');