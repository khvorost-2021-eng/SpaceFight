// js/main.js - ГЛАВНЫЙ ФАЙЛ ИНИЦИАЛИЗАЦИИ ИГРЫ DRONIX
// Отвечает за: загрузку ассетов, привязку обработчиков, запуск игрового цикла

console.log('🔵 main.js загружается...');

// ==========================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ==========================================

Game.SKINS = [
    { id: 'standard', name: 'Стандартный', price: 0, color: '#00ffff' },
    { id: 'red', name: 'Красный (Скоро)', price: 100, color: '#ff0000' },
    { id: 'green', name: 'Зелёный (Скоро)', price: 150, color: '#00ff00' },
    { id: 'purple', name: 'Фиолетовый (Скоро)', price: 200, color: '#aa00ff' },
    { id: 'gold', name: 'Золотой (Скоро)', price: 500, color: '#ffd700' }
];

// ==========================================
// КЭШ DOM-ЭЛЕМЕНТОВ
// ==========================================

const DOM = {
    // Основные кнопки меню
    arcadeBtn: null,
    
    // Навигация по уровням
    levelPrevBtn: null,
    levelNextBtn: null,
    
    // Экран смерти
    restartBtn: null,
    menuBtn: null,
    deathScreen: null,
    
    // Экран победы
    nextLevelBtn: null,
    levelCompleteMenuBtn: null,
    levelCompleteScreen: null,
    
    // Пауза
    pauseScreen: null,
    
    // Мобильная пауза
    mobilePauseBtn: null,
    pauseResumeBtn: null,
    pauseMenuBtn: null,
    
    // Sidebar и контент
    mainMenu: null,
    sidebar: null,
    mainContent: null,
    
    // HUD
    ui: null
};

function cacheDOMElements() {
    DOM.arcadeBtn = document.getElementById('arcadeBtn');
    DOM.levelPrevBtn = document.getElementById('levelPrevBtn');
    DOM.levelNextBtn = document.getElementById('levelNextBtn');
    DOM.restartBtn = document.getElementById('restartBtn');
    DOM.menuBtn = document.getElementById('menuBtn');
    DOM.nextLevelBtn = document.getElementById('nextLevelBtn');
    DOM.levelCompleteMenuBtn = document.getElementById('levelCompleteMenuBtn');
    DOM.deathScreen = document.getElementById('deathScreen');
    DOM.levelCompleteScreen = document.getElementById('levelCompleteScreen');
    DOM.pauseScreen = document.getElementById('pauseScreen');
    DOM.mobilePauseBtn = document.getElementById('mobilePauseBtn');
    DOM.pauseResumeBtn = document.getElementById('pauseResumeBtn');
    DOM.pauseMenuBtn = document.getElementById('pauseMenuBtn');
    DOM.mainMenu = document.getElementById('mainMenu');
    DOM.sidebar = document.querySelector('.sidebar');
    DOM.mainContent = document.querySelector('.main-content');
    DOM.ui = document.getElementById('ui');
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

/**
 * Безопасный вызов функции с обработкой ошибок
 */
function safeCall(fn, ...args) {
    if (typeof fn === 'function') {
        try {
            return fn(...args);
        } catch (e) {
            console.error('❌ Ошибка вызова функции:', e);
        }
    } else {
        console.warn('⚠️ Функция не найдена:', fn);
    }
}

/**
 * Показывает игровой HUD
 */
function showGameHUD() {
    document.body.classList.add('in-game');
    document.body.classList.remove('showing-overlay');
    
    const uiEl = document.getElementById('ui');
    if (uiEl) {
        uiEl.classList.remove('hidden');
        // Сбрасываем inline-стили, чтобы CSS сработал
        uiEl.style.display = '';
        uiEl.style.visibility = '';
        uiEl.style.opacity = '';
        uiEl.style.pointerEvents = '';
    }
    
    console.log('🎮 HUD показан');
}
/**
 * Скрывает игровой HUD
 */
function hideGameHUD() {
    document.body.classList.remove('in-game');
    if (DOM.ui) DOM.ui.classList.add('hidden');
}

/**
 * Скрывает все overlay-экраны (смерть, победа, пауза)
 */
function hideAllOverlayScreens() {
    const screens = ['deathScreen', 'levelCompleteScreen', 'pauseScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.classList.remove('fade-out');
            // Принудительные inline-стили
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-1';
        }
    });
}

/**
 * Показывает главное меню (восстанавливает sidebar и main-content)
 */
function showMainMenuUI() {
    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');
    
    if (DOM.sidebar) DOM.sidebar.style.display = '';
    if (DOM.mainContent) DOM.mainContent.style.display = '';
    if (DOM.mainMenu) {
        DOM.mainMenu.classList.remove('hidden');
        DOM.mainMenu.classList.remove('fade-out');
    }
    
    // Скрываем мобильную кнопку паузы
    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.classList.add('hidden');
    }
}

/**
 * Скрывает главное меню (sidebar и main-content)
 */
function hideMainMenuUI() {
    document.body.classList.add('in-game');
    if (DOM.sidebar) DOM.sidebar.style.display = 'none';
    if (DOM.mainContent) DOM.mainContent.style.display = 'none';
    if (DOM.mainMenu) DOM.mainMenu.classList.add('hidden');
}

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
                        // Возврат на главную
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

// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// ==========================================

Game.init = async function() {
    console.log('🟢 Game.init() запущен');
    
    // Кэшируем DOM-элементы
    cacheDOMElements();
    
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
    
    // === АКТИВАЦИЯ АУДИО ===
    const enableAudio = () => {
        safeCall(Game.initAudio);
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
    };
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    // === TOUCH-УПРАВЛЕНИЕ (мобильные) ===
    let isTouching = false;
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    // Touchstart — начинаем отслеживание
    document.addEventListener('touchstart', (e) => {
        const s = Game.state;
        // Работает только во время игры
        if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) {
            return;
        }
        
        // Игнорируем тапы по UI элементам (кнопки, sidebar и т.д.)
        const target = e.target;
        if (target.closest('.sidebar') || 
            target.closest('.main-content') ||
            target.closest('.screen') ||
            target.closest('#ui') ||
            target.closest('.mobile-pause-btn')) {
            return;
        }
        
        isTouching = true;
        const touch = e.touches[0];
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        
        // Сразу двигаем корабль к точке касания
        Game.mouse.x = touch.clientX;
        Game.mouse.y = touch.clientY;
        
    }, { passive: true });
    
    // Touchmove — НЕПРЕРЫВНОЕ движение за пальцем
    document.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        
        const s = Game.state;
        if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) {
            return;
        }
        
        // Предотвращаем скролл и зум страницы
        e.preventDefault();
        
        const touch = e.touches[0];
        
        // Плавное следование: используем offset от начальной точки
        const deltaX = touch.clientX - lastTouchX;
        const deltaY = touch.clientY - lastTouchY;
        
        Game.mouse.x += deltaX;
        Game.mouse.y += deltaY;
        
        // Ограничиваем границы экрана
        Game.mouse.x = Math.max(0, Math.min(Game.canvas.width, Game.mouse.x));
        Game.mouse.y = Math.max(0, Math.min(Game.canvas.height, Game.mouse.y));
        
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        
    }, { passive: false });
    
    // Touchend — останавливаем отслеживание
    document.addEventListener('touchend', (e) => {
        isTouching = false;
    }, { passive: true });
    
    // Touchcancel — на случай прерывания (звонок и т.п.)
    document.addEventListener('touchcancel', (e) => {
        isTouching = false;
    }, { passive: true });
    
    // === ОТСЛЕЖИВАНИЕ МЫШИ (десктоп) ===
    document.addEventListener('mousemove', (e) => {
        // Игнорируем мышь на touch-устройствах когда идёт touch
        if (isTouching) return;
        Game.mouse.x = e.clientX;
        Game.mouse.y = e.clientY;
    });
    
    // === ОБРАБОТКА КЛАВИАТУРЫ ===
    document.addEventListener('keydown', (e) => {
        const s = Game.state;
        
        // ESC — пауза во время игры
        if (e.key === 'Escape') {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = '';
                    DOM.pauseScreen.style.visibility = '';
                    DOM.pauseScreen.style.opacity = '';
                    DOM.pauseScreen.style.pointerEvents = '';
                    DOM.pauseScreen.style.zIndex = '';
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
        const currentViewVar = typeof currentView !== 'undefined' ? currentView : null;
        if (currentViewVar === 'levels') {
            if (e.key === 'ArrowLeft') safeCall(Game.levelPagePrev);
            if (e.key === 'ArrowRight') safeCall(Game.levelPageNext);
        }
    });
    
    console.log('🔗 Привязка кнопок...');
    
    // === КНОПКА "ИГРАТЬ" (АРКАДА) ===
    if (DOM.arcadeBtn) {
        DOM.arcadeBtn.onclick = () => {
            console.log('🎮 Клик: arcade');
            hideMainMenuUI();
            hideAllOverlayScreens();
            showGameHUD();
            
            // Показываем мобильную кнопку паузы
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            safeCall(Game.startGame, 'arcade');
        };
    }
    
    // === МОБИЛЬНАЯ КНОПКА ПАУЗЫ ===
    if (DOM.mobilePauseBtn) {
        DOM.mobilePauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('📱 Клик: мобильная пауза');
            
            const s = Game.state;
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.body.classList.add('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.remove('hidden');
                    DOM.pauseScreen.style.display = '';
                    DOM.pauseScreen.style.visibility = '';
                }
                document.body.style.cursor = 'default';
            }
        });
        console.log('✅ Обработчик mobilePauseBtn привязан');
    }
    
    // === КНОПКА "ПРОДОЛЖИТЬ" В ПАУЗЕ ===
    if (DOM.pauseResumeBtn) {
        DOM.pauseResumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('▶️ Клик: Продолжить');
            
            const s = Game.state;
            if (s.currentState === Game.STATE.PAUSED) {
                s.currentState = s.mode === 'arcade' ? Game.STATE.ARCADE : Game.STATE.CAMPAIGN;
                document.body.classList.remove('showing-overlay');
                if (DOM.pauseScreen) {
                    DOM.pauseScreen.classList.add('hidden');
                    DOM.pauseScreen.style.display = 'none';
                }
                document.body.style.cursor = 'none';
            }
        });
    }
    
    // === КНОПКА "ВЫЙТИ В МЕНЮ" В ПАУЗЕ ===
    if (DOM.pauseMenuBtn) {
        DOM.pauseMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🏠 Клик: Выйти в меню из паузы');
            
            // Скрываем экран паузы
            if (DOM.pauseScreen) {
                DOM.pauseScreen.classList.add('hidden');
                DOM.pauseScreen.style.display = 'none';
            }
            document.body.classList.remove('showing-overlay');
            safeCall(Game.showMainMenu);
        });
    }
    
    // === НАВИГАЦИЯ ПО УРОВНЯМ ===
    if (DOM.levelPrevBtn) DOM.levelPrevBtn.onclick = () => safeCall(Game.levelPagePrev);
    if (DOM.levelNextBtn) DOM.levelNextBtn.onclick = () => safeCall(Game.levelPageNext);
    
    // === КНОПКИ ЭКРАНА СМЕРТИ ===
    if (DOM.restartBtn) {
        DOM.restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Клик: Заново');
            
            const mode = Game.state.mode;
            const level = Game.state.level || 1;
            
            // Скрываем экран смерти
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
                DOM.deathScreen.style.visibility = 'hidden';
                DOM.deathScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            
            // Показываем мобильную кнопку паузы
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            if (mode === 'arcade') {
                safeCall(Game.startGame, 'arcade');
            } else {
                safeCall(Game.startCampaignFromLevel, level);
            }
        });
        console.log('✅ Обработчик restartBtn привязан');
    }
    
    if (DOM.menuBtn) {
        DOM.menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏠 Клик: Главное меню');
            
            // Скрываем экран смерти
            if (DOM.deathScreen) {
                DOM.deathScreen.classList.add('hidden');
                DOM.deathScreen.style.display = 'none';
                DOM.deathScreen.style.visibility = 'hidden';
                DOM.deathScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            safeCall(Game.showMainMenu);
        });
        console.log('✅ Обработчик menuBtn привязан');
    }
    
    // === КНОПКИ ЭКРАНА ПОБЕДЫ ===
    if (DOM.nextLevelBtn) {
        DOM.nextLevelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Клик: Следующий уровень');
            
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
                DOM.levelCompleteScreen.style.visibility = 'hidden';
                DOM.levelCompleteScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            
            // Показываем мобильную кнопку паузы
            if (DOM.mobilePauseBtn) {
                DOM.mobilePauseBtn.classList.remove('hidden');
            }
            
            safeCall(Game.nextLevel);
        });
        console.log('✅ Обработчик nextLevelBtn привязан');
    }
    
    if (DOM.levelCompleteMenuBtn) {
        DOM.levelCompleteMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏠 Клик: Главное меню (после победы)');
            
            if (DOM.levelCompleteScreen) {
                DOM.levelCompleteScreen.classList.add('hidden');
                DOM.levelCompleteScreen.style.display = 'none';
                DOM.levelCompleteScreen.style.visibility = 'hidden';
                DOM.levelCompleteScreen.style.pointerEvents = 'none';
            }
            
            document.body.classList.remove('showing-overlay');
            safeCall(Game.showMainMenu);
        });
        console.log('✅ Обработчик levelCompleteMenuBtn привязан');
    }
    
    // === ВКЛАДКИ МАГАЗИНА ===
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabName = tab.dataset.tab;
            if (window.renderShopTabInternal) {
                window.renderShopTabInternal(tabName);
            }
        });
    });
    
    // === ИНИЦИАЛИЗАЦИЯ SIDEBAR ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
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

// ==========================================
// ЭКСПОРТ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ
// ==========================================

// Делаем функции доступными для других модулей
window.showGameHUD = showGameHUD;
window.hideGameHUD = hideGameHUD;
window.hideAllOverlayScreens = hideAllOverlayScreens;
window.showMainMenuUI = showMainMenuUI;
window.hideMainMenuUI = hideMainMenuUI;

console.log('🔵 main.js определён, ожидание app.js...');