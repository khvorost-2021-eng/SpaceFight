// ==========================================
// ВЫБОР УРОВНЕЙ С ПАГИНАЦИЕЙ
// ==========================================

Game.LEVELS_PER_PAGE = 10;
Game.currentLevelPage = 1;

Game.getTotalLevels = function() {
    return Math.max(20, Game.playerData.maxLevelUnlocked + 5);
};

Game.renderLevelPage = function(pageNum) {
    const grid = document.getElementById('levelGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    const startLevel = (pageNum - 1) * Game.LEVELS_PER_PAGE + 1;
    
    // Обновляем индикатор страницы
    const indicator = document.getElementById('levelPageIndicator');
    if (indicator) {
        indicator.textContent = `${LANG.page} ${pageNum} / ${totalPages}`;
    }
    
    // Обновляем состояние кнопок пагинации
    const prevBtn = document.getElementById('levelPrevBtn');
    const nextBtn = document.getElementById('levelNextBtn');
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= totalPages;
    
    // Рендерим карточки
    for (let i = 0; i < Game.LEVELS_PER_PAGE; i++) {
        const levelNum = startLevel + i;
        
        if (levelNum > totalLevels) {
            // Пустая карточка-заглушка для сохранения сетки
            const emptyCard = document.createElement('div');
            emptyCard.className = 'level-card locked';
            emptyCard.style.visibility = 'hidden';
            emptyCard.style.animationDelay = `${i * 30}ms`;
            grid.appendChild(emptyCard);
            continue;
        }
        
        const card = Game.createLevelCard(levelNum, i);
        grid.appendChild(card);
    }
};

/**
 * Создаёт карточку уровня с правильным отображением статуса
 */
Game.createLevelCard = function(levelNum, index) {
    const card = document.createElement('div');
    card.className = 'level-card';
    card.style.animationDelay = `${index * 30}ms`;
    
    const isCompleted = Game.playerData.levelsCompleted.includes(levelNum);
    const isUnlocked = levelNum <= Game.playerData.maxLevelUnlocked;
    const isCurrent = levelNum === Game.playerData.maxLevelUnlocked;
    const isBoss = levelNum % 5 === 0;
    
    // Определяем базовый класс по статусу
    if (isCompleted) {
        card.classList.add('completed');
    } else if (isCurrent) {
        card.classList.add('current');
    } else if (!isUnlocked) {
        card.classList.add('locked');
    }
    
    // === БОСС-УРОВНИ — ОСОБАЯ ЛОГИКА ===
    if (isBoss) {
        card.classList.add('boss-card');
        
        if (isCompleted) {
            // Пройденный босс — зелёная галочка + метка "БОСС ПРОЙДЕН"
            card.classList.add('boss-completed');
            
            const number = document.createElement('div');
            number.textContent = levelNum;
            number.style.fontSize = '24px';
            card.appendChild(number);
            
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.textContent = '✓';
            card.appendChild(checkmark);
            
            const label = document.createElement('div');
            label.className = 'boss-completed-label';
            label.textContent = 'БОСС ПРОЙДЕН';
            card.appendChild(label);
        } else {
            // Непройденный босс — череп + надпись "БОСС"
            const skull = document.createElement('div');
            skull.className = 'boss-skull';
            skull.textContent = '💀';
            card.appendChild(skull);
            
            const label = document.createElement('div');
            label.className = 'boss-label';
            label.textContent = 'БОСС';
            card.appendChild(label);
        }
    } else {
        // === ОБЫЧНЫЕ УРОВНИ ===
        const number = document.createElement('div');
        number.textContent = isUnlocked ? levelNum : '🔒';
        card.appendChild(number);
        
        // Галочка для пройденных уровней
        if (isCompleted) {
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.textContent = '✓';
            card.appendChild(checkmark);
        }
    }
    
    // Обработчик клика
    if (isUnlocked) {
        card.addEventListener('click', () => {
            Game.startCampaignFromLevel(levelNum);
        });
    }
    
    return card;
};

Game.showLevelSelect = function() {
    Game.state.currentState = Game.STATE.MENU;
    document.body.classList.remove('in-game');
    document.body.classList.remove('showing-overlay');
    
    const uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');
    
    const mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (mobilePauseBtn) mobilePauseBtn.classList.add('hidden');
    
    Game.currentLevelPage = 1;
    
    if (typeof switchView === 'function') {
        switchView('levels');
    }
    
    Game.renderLevelPage(1);
    
    document.body.style.cursor = 'default';
};

Game.levelPagePrev = function() {
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    if (Game.currentLevelPage > 1) {
        Game.currentLevelPage--;
        Game.renderLevelPage(Game.currentLevelPage);
    }
};

Game.levelPageNext = function() {
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    if (Game.currentLevelPage < totalPages) {
        Game.currentLevelPage++;
        Game.renderLevelPage(Game.currentLevelPage);
    }
};

console.log('✅ ui/levels.js загружен');