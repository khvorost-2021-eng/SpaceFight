// ==========================================
// КОНФИГУРАЦИЯ УРОВНЕЙ, ВОЛН, МОДИФИКАТОРОВ
// ==========================================

Game.getLevelModifiers = function(level, mode) {
    if (mode === 'arcade') {
        const diff = Math.min(Game.state.score / 30, 8);
        return {
            speedMult: 1 + diff * 0.08,
            shootFreqMult: 1 + diff * 0.12,
            accuracyBonus: Math.min(0.2, diff * 0.025),
            countMult: 1 + diff * 0.05,
            useLead: diff >= 4
        };
    }
    
    // === ОБЛЕГЧЁННЫЕ УРОВНИ 1-10 ===
    if (level <= 10) {
        return {
            speedMult: 1 + (level - 1) * 0.03,          // Медленнее: 1.0 → 1.27
            shootFreqMult: 1 + (level - 1) * 0.04,      // РЕДКАЯ СТРЕЛЬБА: 1.0 → 1.36
            accuracyBonus: Math.min(0.1, (level - 1) * 0.01), // Меньше точность
            countMult: 1 + (level - 1) * 0.03,
            useLead: false
        };
    }
    
    // === УРОВНИ 11+ (нормальная сложность) ===
    return {
        speedMult: 1.3 + (level - 11) * 0.05,
        shootFreqMult: 1.4 + (level - 11) * 0.10,
        accuracyBonus: Math.min(0.2, 0.1 + (level - 11) * 0.015),
        countMult: 1.3 + (level - 11) * 0.05,
        useLead: level >= 15
    };
};

Game.LEVEL_SCRIPTS = {
    1: { waves: [
        { description: 'РАЗВЕДКА', groups: [{ type: 'normal', count: 2, side: 'top', role: 'distractor', canShoot: false }]},
        { description: 'ФЛАНГИ', groups: [{ type: 'normal', count: 3, side: 'flanks', role: 'flanker', canShoot: false }]},
        { description: 'БЫСТРЫЙ', groups: [
            { type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: false },
            { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: false }
        ]},
        { description: 'ОКРУЖЕНИЕ', groups: [{ type: 'normal', count: 3, side: 'surround', role: 'attacker', canShoot: false }]},
        { description: 'МАНЕВР', groups: [{ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: false }]}
    ]},
    2: { waves: [
        { description: 'ПЕРВЫЙ ОГОНЬ', groups: [{ type: 'normal', count: 3, side: 'top', role: 'attacker', canShoot: true, shootMult: 0.5 }]},
        { description: 'СМЕШАННАЯ', groups: [
            { type: 'normal', count: 2, side: 'flanks', role: 'attacker', canShoot: true, shootMult: 0.5 },
            { type: 'fast', count: 1, side: 'top', role: 'distractor', canShoot: true, shootMult: 0.5 }
        ]},
        { description: 'ФЛАНГОВАЯ', groups: [{ type: 'normal', count: 4, side: 'flanks', role: 'flanker', canShoot: true, shootMult: 0.7 }]},
        { description: 'ПРОРЫВ', groups: [{ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true, shootMult: 0.8 }]},
        { description: 'ТАНК', groups: [
            { type: 'normal', count: 3, side: 'flanks', role: 'attacker', canShoot: true },
            { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true, shootMult: 0.5 }
        ]}
    ]},
    3: { waves: [
        { description: 'ТАНК И СВИТА', groups: [
            { type: 'normal', count: 2, side: 'flanks', role: 'flanker', canShoot: true },
            { type: 'armored', count: 1, side: 'center', role: 'attacker', canShoot: true }
        ]},
        { description: 'СКОРОСТНАЯ', groups: [{ type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true }]},
        { description: 'ДВА ТАНКА', groups: [{ type: 'armored', count: 2, side: 'center', role: 'attacker', canShoot: true }]},
        { description: 'ЗАЛП', groups: [
            { type: 'normal', count: 4, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 },
            { type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true }
        ]},
        { description: '⚠ БОСС ⚠', boss: true }
    ]}
};

Game.generateWavesForLevel = function(level) {
    const isBossLevel = level % 5 === 0;
    const waveCount = isBossLevel ? 6 : Math.min(8, 5 + Math.floor((level - 3) / 3));
    const waves = [];
    const descriptions = ['РАЗВЕДКА', 'ФЛАНГОВАЯ', 'СКОРОСТНАЯ', 'ТАНКОВАЯ', 'ЭЛИТНАЯ', 'ЗАЛПОВАЯ', 'ОКРУЖЕНИЕ', 'КАМИКАДЗЕ'];
    
    for (let i = 0; i < waveCount; i++) {
        if (i === waveCount - 1 && isBossLevel) {
            waves.push({ description: '⚠ БОСС ⚠', boss: true });
            continue;
        }
        
        const wave = {
            description: descriptions[i % descriptions.length] + ` (${i + 1}/${waveCount})`,
            groups: []
        };
        const baseCount = 2 + Math.floor(level / 3);
        
        if (i === 0) {
            wave.groups.push({ type: 'normal', count: baseCount, side: 'top', role: 'attacker', canShoot: true });
        } else if (i === 1) {
            wave.groups.push({ type: 'armored', count: Math.ceil(baseCount / 2), side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: Math.floor(baseCount / 2) + 1, side: 'flanks', role: 'distractor', canShoot: true });
        } else if (i === 2) {
            wave.groups.push({ type: 'normal', count: baseCount, side: 'surround', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: 2, side: 'flanks', role: 'distractor', canShoot: true });
        } else if (i === 3) {
            wave.groups.push({ type: 'fast', count: baseCount + 1, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true });
        } else if (i === 4) {
            wave.groups.push({ type: 'armored', count: 2 + Math.floor(level / 5), side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'normal', count: baseCount + 2, side: 'surround', role: 'attacker', canShoot: true, shootMult: 1.5 });
        } else if (i === 5) {
            wave.groups.push({ type: 'fast', count: 3, side: 'surround', role: 'distractor', canShoot: true, shootMult: 1.3 });
            wave.groups.push({ type: 'normal', count: baseCount + 1, side: 'flanks', role: 'attacker', canShoot: true });
        } else {
            wave.groups.push({ type: 'armored', count: 3, side: 'center', role: 'attacker', canShoot: true });
            wave.groups.push({ type: 'fast', count: 4, side: 'surround', role: 'kamikaze', canShoot: false, kamikaze: true });
        }
        
        waves.push(wave);
    }
    
    return waves;
};

Game.getWavesForLevel = function(level) {
    if (Game.LEVEL_SCRIPTS[level]) return Game.LEVEL_SCRIPTS[level].waves;
    return Game.generateWavesForLevel(level);
};

console.log('✅ state/levels-config.js загружен');