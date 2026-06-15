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
        Game.loadShips()
    ]);
    
    Game.showMainMenu();
    Game.gameLoop();
    
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
    });
    
    document.getElementById('arcadeBtn').onclick = () => Game.startGame('arcade');
    document.getElementById('campaignBtn').onclick = () => Game.showLevelSelect();
    document.getElementById('skinsBtn').onclick = () => Game.showSkinsScreen();
    
    document.getElementById('levelSelectBackBtn').onclick = () => Game.showMainMenu();
    document.getElementById('backBtn').onclick = () => Game.showMainMenu();
    
    document.getElementById('restartBtn').onclick = () => {
        if (Game.state.mode === 'arcade') Game.startGame('arcade');
        else Game.startCampaignFromLevel(Game.state.level);
    };
    document.getElementById('menuBtn').onclick = () => Game.showMainMenu();
    
    document.getElementById('nextLevelBtn').onclick = () => Game.nextLevel();
    document.getElementById('levelCompleteMenuBtn').onclick = () => Game.showMainMenu();
    
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
        }
    }, 150);
};