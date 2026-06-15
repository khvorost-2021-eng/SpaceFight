// ==========================================
// СИСТЕМА ВОЛН И СПАВНА ВРАГОВ
// ==========================================

Game.checkWaveComplete = function() {
    const s = Game.state;
    if (s.waveState !== 'ACTIVE') return;
    
    if (Game.enemies.length === 0) {
        s.waveState = 'CLEARED';
        s.waveTimer = 0;
        s.waveAnnouncement = '✓ ВОЛНА ЗАЧИЩЕНА';
        s.announcementTimer = 90;
        console.log(`Волна ${s.currentWave} зачищена!`);
    }
};

Game.startWave = function(waveIndex) {
    const s = Game.state;
    const waveConfig = s.levelWaves[waveIndex];
    
    if (!waveConfig) {
        console.warn('Нет конфигурации для волны', waveIndex);
        return;
    }
    
    s.currentWave = waveIndex + 1;
    s.waveState = 'SPAWNING';
    s.waveTimer = 0;
    s.currentWaveConfig = waveConfig;
    s.waveAnnouncement = waveConfig.description;
    s.announcementTimer = 120;
    
    if (waveConfig.boss) {
        setTimeout(() => {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                Game.spawnBoss();
                s.waveState = 'ACTIVE';
            }
        }, 1500);
        return;
    }
    
    let delay = 0;
    waveConfig.groups.forEach((group) => {
        const totalInGroup = Math.ceil(group.count);
        for (let i = 0; i < group.count; i++) {
            setTimeout(() => {
                if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                    Game.enemies.push(Game.createEnemy(group, i, totalInGroup));
                }
            }, delay);
            delay += 300;
        }
    });
    
    setTimeout(() => {
        if (s.waveState === 'SPAWNING') s.waveState = 'ACTIVE';
    }, delay + 500);
};

Game.generateEndlessWaves = function(currentScore) {
    const diffLevel = Math.floor(currentScore / 30) + 4;
    return Game.generateWavesForLevel(diffLevel);
};