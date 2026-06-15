Game.transitionTo = function(targetId, onMiddle) {
    const screens = document.querySelectorAll('.screen');
    const current = Array.from(screens).find(s => !s.classList.contains('hidden'));
    const target = document.getElementById(targetId);
    
    if (!current || current === target) {
        screens.forEach(s => s.classList.add('hidden'));
        target.classList.remove('hidden');
        target.classList.remove('fade-out');
        if (onMiddle) onMiddle();
        Game.animateButtons(target);
        return;
    }
    
    current.classList.add('fade-out');
    
    setTimeout(() => {
        current.classList.add('hidden');
        current.classList.remove('fade-out');
        
        target.classList.remove('hidden');
        target.classList.add('fade-out');
        target.offsetHeight;
        
        if (onMiddle) onMiddle();
        Game.animateButtons(target);
        
        setTimeout(() => {
            target.classList.remove('fade-out');
        }, 20);
    }, 300);
};

Game.animateButtons = function(screen) {
    if (!screen) return;
    const buttons = screen.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        btn.style.animation = 'none';
        btn.offsetHeight;
        btn.style.animation = `buttonAppear 400ms ease-out ${i * 50}ms forwards`;
    });
};

Game.hideAllScreens = function() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('fade-out');
    });
};

Game.updateUI = function() {
    const s = Game.state;
    if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('score').textContent = `Счёт: ${s.score}`;
        document.getElementById('coinsDisplay').textContent = `Монеты: ${Game.playerData.coins}`;
        
        const hpContainer = document.getElementById('hpContainer');
        hpContainer.innerHTML = '';
        for (let i = 0; i < s.maxHp; i++) {
            const heart = document.createElement('div');
            heart.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`;
            hpContainer.appendChild(heart);
        }
        
        let info = s.mode === 'campaign' ? `Уровень ${s.level}` : 'Аркада';
        info += ` | Волна ${s.currentWave}/${s.totalWaves}`;
        const aliveCount = Game.enemies.length;
        if (aliveCount > 0) info += ` | Врагов: ${aliveCount}`;
        document.getElementById('levelDisplay').textContent = info;
    } else {
        document.getElementById('ui').classList.add('hidden');
    }
};

Game.showMainMenu = function() {
    document.getElementById('menuCoins').textContent = `Монеты: ${Game.playerData.coins}`;
    Game.transitionTo('mainMenu', () => {
        Game.state.currentState = Game.STATE.MENU;
        document.body.style.cursor = 'default';
    });
};

Game.showLevelSelect = function() {
    Game.transitionTo('levelSelectScreen', () => {
        Game.state.currentState = Game.STATE.LEVEL_SELECT;
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';
        
        const totalLevels = 20;
        for (let i = 1; i <= totalLevels; i++) {
            const card = document.createElement('div');
            card.className = 'level-card';
            
            const isCompleted = Game.playerData.levelsCompleted.includes(i);
            const isUnlocked = i <= Game.playerData.maxLevelUnlocked;
            const isCurrent = i === Game.playerData.maxLevelUnlocked;
            const isBoss = i % 5 === 0;
            
            if (isCompleted) card.classList.add('completed');
            else if (isCurrent) card.classList.add('current');
            else if (!isUnlocked) card.classList.add('locked');
            
            card.style.animationDelay = `${i * 30}ms`;
            card.innerHTML = isBoss ? `${i}<br><span style="font-size:12px;color:#ff4444;">БОСС</span>` : i;
            
            if (isUnlocked) {
                card.addEventListener('click', () => Game.startCampaignFromLevel(i));
            }
            grid.appendChild(card);
        }
        document.body.style.cursor = 'default';
    });
};

Game.showDeathScreen = function() {
    document.getElementById('deathScore').textContent = `Счёт: ${Game.state.score}`;
    document.getElementById('deathCoins').textContent = `Получено монет: ${Game.state.coinsEarned}`;
    Game.transitionTo('deathScreen', () => {
        document.body.style.cursor = 'default';
    });
};

Game.showLevelCompleteScreen = function() {
    document.getElementById('levelCompleteInfo').textContent = 
        `Уровень ${Game.state.level} пройден!\nПолучено монет: ${Game.state.coinsEarned}`;
    Game.transitionTo('levelCompleteScreen', () => {
        document.body.style.cursor = 'default';
    });
};