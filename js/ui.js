// === СИСТЕМА FADE + SCALE ПЕРЕХОДОВ ===
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
    
    // Fade out + scale down
    current.classList.add('fade-out');
    
    setTimeout(() => {
        current.classList.add('hidden');
        current.classList.remove('fade-out');
        
        // Показываем новый экран в начальном состоянии (scale 0.95, opacity 0)
        target.classList.remove('hidden');
        target.classList.add('fade-out');
        target.offsetHeight; // force reflow
        
        if (onMiddle) onMiddle();
        Game.animateButtons(target);
        
        // Fade in + scale up
        setTimeout(() => {
            target.classList.remove('fade-out');
        }, 20);
    }, 300);
};

// === STAGGER АНИМАЦИЯ ДЛЯ КНОПОК ===
Game.animateButtons = function(screen) {
    const buttons = screen.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        btn.style.animation = 'none';
        btn.offsetHeight; // force reflow
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
        
        let info = '';
        if (s.mode === 'campaign') {
            info = `Уровень ${s.level}`;
        } else {
            info = 'Аркада';
        }
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

Game.showSkinsScreen = function() {
    Game.transitionTo('skinsScreen', () => {
        Game.state.currentState = Game.STATE.SKINS;
        const grid = document.getElementById('skinsGrid');
        grid.innerHTML = '';
        
        Game.SKINS.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'skin-card';
            
            const isOwned = Game.playerData.skins.includes(skin.id);
            const isSelected = Game.playerData.selectedSkin === skin.id;
            
            if (isSelected) card.classList.add('selected');
            if (!isOwned && skin.price > 0) card.classList.add('locked');
            
            let priceText;
            if (isSelected) priceText = 'Выбран';
            else if (isOwned) priceText = 'Выбрать';
            else if (skin.price > 0) priceText = `${skin.price} монет`;
            else priceText = 'Бесплатно';
            
            card.innerHTML = `<div class="skin-name">${skin.name}</div><div class="skin-price">${priceText}</div>`;
            card.addEventListener('click', () => {
                if (isOwned) {
                    Game.playerData.selectedSkin = skin.id;
                    Game.savePlayerData();
                    Game.showSkinsScreen();
                }
            });
            grid.appendChild(card);
        });
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