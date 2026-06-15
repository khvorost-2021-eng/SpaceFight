// ==========================================
// ИГРОВОЙ HUD (счёт, сердечки, волны)
// ==========================================

Game.updateUI = function() {
    const s = Game.state;
    const uiElement = document.getElementById('ui');
    if (!uiElement) return;
    
    // Если body имеет класс in-game — НЕ показываем HUD через эту функцию
    // (управление через lifecycle.js)
    
    // КРИТИЧЕСКАЯ ПРОВЕРКА: если виден хоть один экран меню - HUD скрыт
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
        document.getElementById('score').textContent = `Счёт: ${s.score}`;
        document.getElementById('coinsDisplay').textContent = `Монеты: ${Game.playerData.coins}`;
        
        const hpContainer = document.getElementById('hpContainer');
        if (hpContainer) {
            hpContainer.innerHTML = '';
            for (let i = 0; i < s.maxHp; i++) {
                const heart = document.createElement('div');
                heart.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`;
                hpContainer.appendChild(heart);
            }
        }
        
        let info = s.mode === 'campaign' ? `Уровень ${s.level}` : 'Аркада';
        info += ` | Волна ${s.currentWave}/${s.totalWaves}`;
        const aliveCount = Game.enemies.length;
        if (aliveCount > 0) info += ` | Врагов: ${aliveCount}`;
        const aliveDrones = Game.drones.filter(d => d.alive).length;
        const maxSlots = Game.getMaxDroneSlots();
        info += ` | 🛸 ${aliveDrones}/${maxSlots}`;
        info += ` | Ур.${Game.playerData.playerLevel}`;
        document.getElementById('levelDisplay').textContent = info;
    } else {
        uiElement.classList.add('hidden');
    }
};