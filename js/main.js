Game.SKINS = [
    { id: 'standard', name: 'Стандартный', price: 0, color: '#00ffff' },
    { id: 'red', name: 'Красный (Скоро)', price: 100, color: '#ff0000' },
    { id: 'green', name: 'Зелёный (Скоро)', price: 150, color: '#00ff00' },
    { id: 'purple', name: 'Фиолетовый (Скоро)', price: 200, color: '#aa00ff' },
    { id: 'gold', name: 'Золотой (Скоро)', price: 500, color: '#ffd700' }
];

Game.init = async function() {
    await Promise.all([
        Game.initYandexSDK(),
        Game.loadShips(),
        Game.loadDroneImages()
    ]);
    
    Game.showMainMenu();
    Game.gameLoop();
    
    const enableAudio = () => {
        Game.initAudio();
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
    };
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    document.addEventListener('mousemove', (e) => {
        Game.mouse.x = e.clientX;
        Game.mouse.y = e.clientY;
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const s = Game.state;
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                s.currentState = Game.STATE.PAUSED;
                document.getElementById('pauseScreen').classList.remove('hidden');
                document.body.style.cursor = 'default';
                Game.animateButtons(document.getElementById('pauseScreen'));
            } else if (s.currentState === Game.STATE.PAUSED) {
                s.currentState = s.mode === 'arcade' ? Game.STATE.ARCADE : Game.STATE.CAMPAIGN;
                document.getElementById('pauseScreen').classList.add('hidden');
                document.body.style.cursor = 'none';
            }
        }
        // Стрелки ← → на экране выбора уровня
        if (e.key === 'ArrowLeft' && Game.state.currentState === Game.STATE.LEVEL_SELECT) {
            Game.levelPagePrev();
        }
        if (e.key === 'ArrowRight' && Game.state.currentState === Game.STATE.LEVEL_SELECT) {
            Game.levelPageNext();
        }
    });
    
    // ГЛАВНОЕ МЕНЮ
    document.getElementById('arcadeBtn').onclick = () => Game.startGame('arcade');
    document.getElementById('levelsBtn').onclick = () => Game.showLevelSelect();
    document.getElementById('profileBtn').onclick = () => Game.showProfileScreen();
    document.getElementById('shopBtn').onclick = () => Game.showShopScreen();
    
    // ВЫБОР УРОВНЯ — стрелки пагинации
    document.getElementById('levelPrevBtn').onclick = (e) => {
        e.stopPropagation();
        Game.levelPagePrev();
    };
    document.getElementById('levelNextBtn').onclick = (e) => {
        e.stopPropagation();
        Game.levelPageNext();
    };
    document.getElementById('levelSelectBackBtn').onclick = () => Game.showMainMenu();
    
    // ПРОФИЛЬ
    document.getElementById('profileBackBtn').onclick = () => Game.showMainMenu();
    
    // МАГАЗИН
    document.getElementById('shopBackBtn').onclick = () => Game.showMainMenu();
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.onclick = (e) => {
            e.stopPropagation();
            const tabName = tab.dataset.tab;
            if (window.renderShopTabInternal) {
                window.renderShopTabInternal(tabName);
            }
        };
    });
    
    // СМЕРТЬ
    document.getElementById('restartBtn').onclick = (e) => {
        e.stopPropagation();
        const mode = Game.state.mode;
        const level = Game.state.level;
        if (mode === 'arcade') Game.startGame('arcade');
        else Game.startCampaignFromLevel(level);
    };
    document.getElementById('menuBtn').onclick = (e) => {
        e.stopPropagation();
        Game.showMainMenu();
    };
    
    // ПОБЕДА
    document.getElementById('nextLevelBtn').onclick = (e) => {
        e.stopPropagation();
        Game.nextLevel();
    };
    document.getElementById('levelCompleteMenuBtn').onclick = (e) => {
        e.stopPropagation();
        Game.showMainMenu();
    };
    
    window.addEventListener('resize', () => {
        Game.canvas.width = window.innerWidth;
        Game.canvas.height = window.innerHeight;
    });
    
    // Авто-стрельба
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
            Game.playShootSound();
        }
    }, 150);
};