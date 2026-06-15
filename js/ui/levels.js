// ==========================================
// ЭКРАН ВЫБОРА УРОВНЕЙ С ПАГИНАЦИЕЙ
// ==========================================

Game.LEVELS_PER_PAGE = 10;
Game.currentLevelPage = 1;

Game.getTotalLevels = function() {
    return Math.max(20, Game.playerData.maxLevelUnlocked + 5);
};

Game.renderLevelPage = function(pageNum) {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    const startLevel = (pageNum - 1) * Game.LEVELS_PER_PAGE + 1;
    
    const indicator = document.getElementById('levelPageIndicator');
    if (indicator) {
        indicator.textContent = `${LANG.page} ${pageNum} / ${totalLevels > Game.LEVELS_PER_PAGE ? totalPages : 1}`;
    }
    
    const prevBtn = document.getElementById('levelPrevBtn');
    const nextBtn = document.getElementById('levelNextBtn');
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= totalPages;
    
    for (let i = 0; i < Game.LEVELS_PER_PAGE; i++) {
        const levelNum = startLevel + i;
        const card = document.createElement('div');
        card.className = 'level-card';
        
        if (levelNum > totalLevels) {
            card.classList.add('locked');
            card.style.visibility = 'hidden';
            grid.appendChild(card);
            continue;
        }
        
        const isCompleted = Game.playerData.levelsCompleted.includes(levelNum);
        const isUnlocked = levelNum <= Game.playerData.maxLevelUnlocked;
        const isCurrent = levelNum === Game.playerData.maxLevelUnlocked;
        const isBoss = levelNum % 5 === 0;
        
        if (isCompleted) card.classList.add('completed');
        else if (isCurrent) card.classList.add('current');
        else if (!isUnlocked) card.classList.add('locked');
        
        card.style.animationDelay = `${i * 30}ms`;
        
        const numberDiv = document.createElement('div');
        numberDiv.textContent = isUnlocked ? levelNum : '🔒';
        card.appendChild(numberDiv);
        
        if (isBoss) {
            const subtitle = document.createElement('div');
            subtitle.className = 'level-card-subtitle';
            subtitle.textContent = LANG.bossLevel;
            card.appendChild(subtitle);
        }
        
        if (isCompleted) {
            const check = document.createElement('div');
            check.style.cssText = 'position:absolute;top:5px;right:8px;font-size:18px;color:#00ff66;text-shadow:0 0 5px #00ff66;';
            check.textContent = '✓';
            card.appendChild(check);
        }
        
        if (isUnlocked) {
            card.addEventListener('click', () => {
                Game.startCampaignFromLevel(levelNum);
            });
        }
        
        grid.appendChild(card);
    }
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