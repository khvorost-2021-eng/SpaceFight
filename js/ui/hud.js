// ==========================================
// ИГРОВОЙ HUD (счёт, сердечки, волны)
// ==========================================
Game.updateUI = function() {
    const s = Game.state;
    const uiElement = document.getElementById('ui');
    if (!uiElement) return;
    
    // Если виден экран меню — HUD скрыт
    const visibleScreens = document.querySelectorAll('.screen:not(.hidden)');
    if (visibleScreens.length > 0) {
        uiElement.classList.add('hidden');
        return;
    }
    
    const inGame = s.currentState === Game.STATE.ARCADE || 
                   s.currentState === Game.STATE.CAMPAIGN ||
                   s.currentState === Game.STATE.DYING;
    
    if (inGame && document.body.classList.contains('in-game')) {
        uiElement.classList.remove('hidden');
        
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // ==========================================
            // 📱 МОБИЛЬНАЯ ВЕРСИЯ: МНОГОСТРОЧНЫЙ HUD
            // ==========================================
            if (!uiElement.dataset.mobileReady) {
                uiElement.innerHTML = `
                    <div class="hud-row hud-row-score">
                        <span id="mScore" class="hud-main">Счёт: 0</span>
                        <span id="mCoins" class="hud-main hud-coins">💰 0</span>
                    </div>
                    <div class="hud-row hud-row-hp">
                        <div id="hpContainer"></div>
                    </div>
                    <div class="hud-row hud-row-level" id="mLevelInfo">Ур.1 • В.0/0</div>
                    <div class="hud-row hud-row-minor" id="mMinorInfo">🛸 0/0</div>
                `;
                uiElement.dataset.mobileReady = 'true';
            }
            
            const mScore = document.getElementById('mScore');
            const mCoins = document.getElementById('mCoins');
            const mLevel = document.getElementById('mLevelInfo');
            const mMinor = document.getElementById('mMinorInfo');
            
            if (mScore) mScore.textContent = `Счёт: ${s.score}`;
            if (mCoins) mCoins.textContent = `💰 ${Game.playerData.coins}`;
            
            if (mLevel) {
                mLevel.textContent = `${s.mode === 'campaign' ? `Ур.${s.level}` : 'Аркада'} • В.${s.currentWave}/${s.totalWaves}`;
            }
            
            if (mMinor) {
                const aliveEnemies = Game.enemies.length;
                const aliveDrones = Game.drones.filter(d => d.alive).length;
                const maxSlots = Game.getMaxDroneSlots();
                mMinor.textContent = `${aliveEnemies > 0 ? `👾 ${aliveEnemies} • ` : ''}🛸 ${aliveDrones}/${maxSlots}`;
            }
            
            const hpContainer = document.getElementById('hpContainer');
            if (hpContainer) {
                if (hpContainer.children.length !== s.maxHp) {
                    hpContainer.innerHTML = '';
                    for (let i = 0; i < s.maxHp; i++) {
                        const heart = document.createElement('div');
                        heart.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`;
                        hpContainer.appendChild(heart);
                    }
                } else {
                    Array.from(hpContainer.children).forEach((heart, i) => {
                        heart.classList.toggle('empty', i >= s.hp);
                    });
                }
            }
            
        } else {
            // ==========================================
            // 💻 ПК-ВЕРСИЯ: БЕЗ ИЗМЕНЕНИЙ
            // ==========================================
            if (uiElement.dataset.mobileReady) {
                uiElement.innerHTML = `
                    <div id="score">Счёт: 0</div>
                    <div id="coinsDisplay">Монеты: 0</div>
                    <div id="hpContainer"></div>
                    <div id="levelDisplay"></div>
                `;
                delete uiElement.dataset.mobileReady;
            }
            
            const scoreEl = document.getElementById('score');
            const coinsEl = document.getElementById('coinsDisplay');
            const levelEl = document.getElementById('levelDisplay');
            
            if (scoreEl) scoreEl.textContent = `Счёт: ${s.score}`;
            if (coinsEl) coinsEl.textContent = `Монеты: ${Game.playerData.coins}`;
            
            const hpContainer = document.getElementById('hpContainer');
            if (hpContainer) {
                hpContainer.innerHTML = '';
                for (let i = 0; i < s.maxHp; i++) {
                    const heart = document.createElement('div');
                    heart.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`;
                    hpContainer.appendChild(heart);
                }
            }
            
            if (levelEl) {
                let info = s.mode === 'campaign' ? `Уровень ${s.level}` : 'Аркада';
                info += ` | Волна ${s.currentWave}/${s.totalWaves}`;
                const aliveCount = Game.enemies.length;
                if (aliveCount > 0) info += ` | Врагов: ${aliveCount}`;
                const aliveDrones = Game.drones.filter(d => d.alive).length;
                const maxSlots = Game.getMaxDroneSlots();
                info += ` | 🛸 ${aliveDrones}/${maxSlots}`;
                info += ` | Ур.${Game.playerData.playerLevel}`;
                levelEl.textContent = info;
            }
        }
    } else {
        uiElement.classList.add('hidden');
    }
};