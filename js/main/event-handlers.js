// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ (Touch, Mouse, Keyboard)
// ==========================================
function setupEventHandlers() {
    // === АКТИВАЦИЯ АУДИО ===
    const enableAudio = () => {
        safeCall(Game.initAudio);
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
    };
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);

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

        // ESC — пауза
        if (e.key === 'Escape') {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');

                // 🔧 ДИНАМИЧЕСКИЙ ТЕКСТ КНОПКИ "В МЕНЮ"
                if (DOM.pauseMenuBtn) {
                    if (s.mode === 'campaign') {
                        DOM.pauseMenuBtn.textContent = '🗺️ В уровни';
                    } else {
                        DOM.pauseMenuBtn.textContent = '🏠 Выйти в меню';
                    }
                }

                // 🔧 ИСПРАВЛЕНО: Явно ставим display:flex вместо сброса ''
                // (Теперь CSS #pauseScreen{display:none} не даст экрану показаться при сбросе inline-стиля)
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = 'flex';
                    DOM.pauseScreen.style.visibility = 'visible';
                    DOM.pauseScreen.style.opacity = '1';
                    DOM.pauseScreen.style.pointerEvents = 'auto';
                    DOM.pauseScreen.style.zIndex = '2000';
                }
                document.body.style.cursor = 'default';

            } else if (s.currentState === Game.STATE.PAUSED) {
                s.currentState = s.mode === 'arcade' ? Game.STATE.ARCADE : Game.STATE.CAMPAIGN;
                document.body.classList.remove('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.add('hidden');
                    DOM.pauseScreen.style.display = 'none';
                }
                document.body.style.cursor = 'none';
            }
        }

        // Стрелки для навигации по уровням
        const currentViewVar = typeof window.currentView !== 'undefined' ? window.currentView : null;
        if (currentViewVar === 'levels') {
            if (e.key === 'ArrowLeft') safeCall(Game.levelPagePrev);
            if (e.key === 'ArrowRight') safeCall(Game.levelPageNext);
        }
    });

    console.log('✅ Обработчики событий настроены');
}
window.setupEventHandlers = setupEventHandlers;
console.log('✅ main/event-handlers.js загружен');