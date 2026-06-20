// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ (Touch, Mouse, Keyboard, Visibility)
// ==========================================

// 🔧 УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ПОСТАНОВКИ НА ПАУЗУ
// Используется при ESC, сворачивании вкладки, клике на мобильную кнопку паузы
window.pauseGame = function() {
    var s = Game.state;
    
    // Ставим на паузу ТОЛЬКО если игра активна (не в меню, не в смерти, не уже в паузе)
    if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) {
        return false;
    }
    
    s.currentState = Game.STATE.PAUSED;
    document.body.classList.add('showing-overlay');
    
    // Останавливаем фоновую музыку (стрельба/взрывы затухнут сами)
    if (typeof Game.stopBackgroundMusic === 'function') {
        Game.stopBackgroundMusic();
    }
    
    // Динамический текст кнопки "В меню"
    if (DOM.pauseMenuBtn) {
        if (s.mode === 'campaign') {
            DOM.pauseMenuBtn.textContent = '🗺️ В уровни';
        } else {
            DOM.pauseMenuBtn.textContent = '🏠 Выйти в меню';
        }
    }
    
    // Показываем экран паузы
    if (DOM.pauseScreen) {
        DOM.pauseScreen.classList.remove('hidden');
        DOM.pauseScreen.style.display = 'flex';
        DOM.pauseScreen.style.visibility = 'visible';
        DOM.pauseScreen.style.opacity = '1';
        DOM.pauseScreen.style.pointerEvents = 'auto';
        DOM.pauseScreen.style.zIndex = '2000';
    }
    
    document.body.style.cursor = 'default';
    console.log('⏸️ Игра поставлена на паузу');
    return true;
};

function setupEventHandlers() {
    // === АКТИВАЦИЯ АУДИО ===
    const enableAudio = () => {
        safeCall(Game.initAudio);
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
    };
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);

    // === 🔧 ЗАПРЕТ КОНТЕКСТНОГО МЕНЮ (правая кнопка, долгое нажатие) ===
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    // === 🔧 АВТОПАУЗА ПРИ СВОРАЧИВАНИИ ВКЛАДКИ ===
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Вкладка скрыта — ставим на паузу
            pauseGame();
        }
        // При возвращении на вкладку НЕ снимаем с паузы автоматически
        // Игрок сам нажмёт "Продолжить" — как при обычной паузе
    });

    // === 🔧 ЗАПРЕТ ЖЕСТОВ МАСШТАБИРОВАНИЯ (двойной тап, pinch) ===
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    // Запрет двойного тапа для зума на iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // === TOUCH-УПРАВЛЕНИЕ ===
    let isTouching = false;

    Game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const s = Game.state;
        if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) return;
        isTouching = true;
        const touch = e.touches[0];
        const rect = Game.canvas.getBoundingClientRect();
        const scaleX = Game.canvas.width / rect.width;
        const scaleY = Game.canvas.height / rect.height;
        Game.mouse.x = (touch.clientX - rect.left) * scaleX;
        Game.mouse.y = (touch.clientY - rect.top) * scaleY;
    }, { passive: false });

    Game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isTouching) return;
        const s = Game.state;
        if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) return;
        const touch = e.touches[0];
        const rect = Game.canvas.getBoundingClientRect();
        const scaleX = Game.canvas.width / rect.width;
        const scaleY = Game.canvas.height / rect.height;
        Game.mouse.x = (touch.clientX - rect.left) * scaleX;
        Game.mouse.y = (touch.clientY - rect.top) * scaleY;
    }, { passive: false });

    Game.canvas.addEventListener('touchend', (e) => { e.preventDefault(); isTouching = false; }, { passive: false });
    Game.canvas.addEventListener('touchcancel', (e) => { e.preventDefault(); isTouching = false; }, { passive: false });

    // === МЫШЬ ===
    document.addEventListener('mousemove', (e) => {
        if (isTouching) return;
        const rect = Game.canvas.getBoundingClientRect();
        Game.mouse.x = e.clientX - rect.left;
        Game.mouse.y = e.clientY - rect.top;
    });

    // === КЛАВИАТУРА ===
    document.addEventListener('keydown', (e) => {
        const s = Game.state;

        // ESC — пауза (теперь использует общую функцию pauseGame)
        if (e.key === 'Escape') {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                pauseGame();
            } else if (s.currentState === Game.STATE.PAUSED) {
                s.currentState = s.mode === 'arcade' ? Game.STATE.ARCADE : Game.STATE.CAMPAIGN;
                document.body.classList.remove('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.add('hidden');
                    DOM.pauseScreen.style.display = 'none';
                }
                document.body.style.cursor = 'none';
                
                // Возобновляем музыку при снятии с паузы
                if (typeof Game.startBackgroundMusic === 'function' && Game.audioCtx) {
                    Game.startBackgroundMusic();
                }
            }
        }

        // Запрет F5 / Ctrl+R / Ctrl+U во время игры (защита от случайного перезапуска)
        if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'u' || e.key === 's'))) {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                e.preventDefault();
            }
        }

        // Стрелки для навигации по уровням
        const currentViewVar = typeof window.currentView !== 'undefined' ? window.currentView : null;
        if (currentViewVar === 'levels') {
            if (e.key === 'ArrowLeft') safeCall(Game.levelPagePrev);
            if (e.key === 'ArrowRight') safeCall(Game.levelPageNext);
        }
    });

    console.log('✅ Обработчики событий настроены (с автопаузой и запретами)');
}
window.setupEventHandlers = setupEventHandlers;
console.log('✅ main/event-handlers.js загружен (готов к Яндекс.Играм)');