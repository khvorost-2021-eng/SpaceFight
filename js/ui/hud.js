Game.updateUI = function() {
    const s = Game.state;
    const uiElement = DOM.ui;
    if (!uiElement) return;
    
    const inGame = s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN || s.currentState === Game.STATE.DYING;
    const sidebarHidden = DOM.sidebar && DOM.sidebar.style.display === 'none';
    
    if (!inGame || !sidebarHidden) { uiElement.style.display = 'none'; return; }
    uiElement.style.display = '';
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        if (!uiElement.dataset.mobileReady) {
            uiElement.innerHTML = `<div class="hud-row hud-row-score"><span id="mScore" class="hud-main">Счёт: 0</span><span id="mCoins" class="hud-main hud-coins">0</span></div><div class="hud-row hud-row-hp"><div id="hpContainer"></div></div><div class="hud-row hud-row-level" id="mLevelInfo">Ур.1</div><div class="hud-row hud-row-minor" id="mMinorInfo">0</div>`;
            uiElement.dataset.mobileReady = 'true';
        }
        const mScore = document.getElementById('mScore');
        const mCoins = document.getElementById('mCoins');
        const mLevel = document.getElementById('mLevelInfo');
        const mMinor = document.getElementById('mMinorInfo');
        if (mScore) mScore.textContent = `Счёт: ${s.score}`;
        if (mCoins) mCoins.textContent = `${Game.playerData.coins}`;
        if (mLevel) mLevel.textContent = `${s.mode === 'campaign' ? `Ур.${s.level}` : 'Аркада'} • В.${s.currentWave}/${s.totalWaves}`;
        if (mMinor) {
            const alive = Game.enemies.length; const drones = Game.drones.filter(d => d.alive).length;
            mMinor.textContent = `${alive > 0 ? `👾 ${alive} • ` : ''}🛸 ${drones}/${Game.getMaxDroneSlots()}`;
        }
        const hpContainer = document.getElementById('hpContainer');
        if (hpContainer) {
            if (hpContainer.children.length !== s.maxHp) {
                hpContainer.innerHTML = '';
                for (let i = 0; i < s.maxHp; i++) { const h = document.createElement('div'); h.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`; hpContainer.appendChild(h); }
            } else { Array.from(hpContainer.children).forEach((h, i) => h.classList.toggle('empty', i >= s.hp)); }
        }
    } else {
        if (uiElement.dataset.mobileReady) {
            uiElement.innerHTML = `<div id="score">Счёт: 0</div><div id="coinsDisplay">Монеты: 0</div><div id="hpContainer"></div><div id="levelDisplay"></div>`;
            delete uiElement.dataset.mobileReady;
        }
        const scoreEl = document.getElementById('score');
        const coinsEl = document.getElementById('coinsDisplay');
        const levelEl = document.getElementById('levelDisplay');
        if (scoreEl) scoreEl.textContent = `Счёт: ${s.score}`;
        if (coinsEl) coinsEl.textContent = `Монеты: ${Game.playerData.coins}`;
        const hpContainer = document.getElementById('hpContainer');
        if (hpContainer) {
            if (hpContainer.children.length !== s.maxHp) {
                hpContainer.innerHTML = '';
                for (let i = 0; i < s.maxHp; i++) { const h = document.createElement('div'); h.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`; hpContainer.appendChild(h); }
            } else { Array.from(hpContainer.children).forEach((h, i) => h.classList.toggle('empty', i >= s.hp)); }
        }
        if (levelEl) {
            let info = s.mode === 'campaign' ? `Уровень ${s.level}` : 'Аркада';
            info += ` | Волна ${s.currentWave}/${s.totalWaves}`;
            if (Game.enemies.length > 0) info += ` | Врагов: ${Game.enemies.length}`;
            info += ` | 🛸 ${Game.drones.filter(d => d.alive).length}/${Game.getMaxDroneSlots()}`;
            levelEl.textContent = info;
        }
    }
};
console.log('ui/hud.js загружен');