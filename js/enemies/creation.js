// ==========================================
// СОЗДАНИЕ ВРАГОВ И БОССОВ
// ==========================================

Game.createEnemy = function(group, indexInGroup, totalInGroup) {
    const type = group.type;
    const params = ENEMY_PARAMS[type];
    const W = Game.canvas.width;
    const H = Game.canvas.height;
    const mods = Game.getLevelModifiers(
        Game.state.mode === 'campaign' ? Game.state.level : 1,
        Game.state.mode
    );
    
    let startX, startY, targetX, targetY;
    let maneuverType = MANEUVER.ZIGZAG;
    const side = group.side;
    
    switch(side) {
        case 'left':
            startX = -50;
            startY = 100 + (indexInGroup / Math.max(1, totalInGroup)) * 200;
            targetX = 150 + Math.random() * 100;
            targetY = 150 + (indexInGroup / Math.max(1, totalInGroup)) * 150;
            break;
        case 'right':
            startX = W + 50;
            startY = 100 + (indexInGroup / Math.max(1, totalInGroup)) * 200;
            targetX = W - 150 - Math.random() * 100;
            targetY = 150 + (indexInGroup / Math.max(1, totalInGroup)) * 150;
            break;
        case 'top':
            startX = 100 + (indexInGroup / Math.max(1, totalInGroup - 1)) * (W - 200);
            startY = -50;
            targetX = 100 + Math.random() * (W - 200);
            targetY = 150 + Math.random() * 100;
            maneuverType = type === 'fast' ? MANEUVER.ZIGZAG : MANEUVER.CIRCLE;
            break;
        case 'center':
            startX = W/2 + (indexInGroup - totalInGroup/2) * 60;
            startY = -50;
            targetX = W/2 + (indexInGroup - totalInGroup/2) * 80;
            targetY = 150 + Math.random() * 80;
            maneuverType = MANEUVER.HOLD;
            break;
        case 'surround': {
            const angle = (indexInGroup / Math.max(1, totalInGroup)) * Math.PI * 2;
            const radius = 250;
            startX = W/2 + Math.cos(angle) * (Math.max(W, H) / 2 + 100);
            startY = H/2 + Math.sin(angle) * (Math.max(W, H) / 2 + 100);
            targetX = W/2 + Math.cos(angle) * radius;
            targetY = H/2 + Math.sin(angle) * radius;
            maneuverType = MANEUVER.CIRCLE;
            break;
        }
        case 'flanks': {
            if (indexInGroup < totalInGroup / 2) {
                startX = -50;
                startY = 100 + indexInGroup * 80;
                targetX = 150 + Math.random() * 50;
                targetY = 150 + indexInGroup * 60;
            } else {
                const rightIndex = indexInGroup - Math.ceil(totalInGroup / 2);
                startX = W + 50;
                startY = 100 + rightIndex * 80;
                targetX = W - 150 - Math.random() * 50;
                targetY = 150 + rightIndex * 60;
            }
            maneuverType = MANEUVER.ZIGZAG;
            break;
        }
    }
    
    let shootInterval = params.shootInterval;
    if (group.shootMult) shootInterval /= group.shootMult;
    shootInterval = Math.max(20, shootInterval / mods.shootFreqMult);
    
    const enemy = {
        type: type,
        x: startX, y: startY,
        rotation: 0, targetRotation: 0,
        state: AI_STATE.ENTERING,
        targetX: targetX, targetY: targetY,
        homeX: targetX, homeY: targetY,
        health: params.hp, maxHealth: params.hp,
        speed: params.speed * mods.speedMult,
        shootTimer: Math.random() * 30,
        shootInterval: shootInterval,
        bulletSpeed: params.bulletSpeed * (1 + (mods.speedMult - 1) * 0.5),
        accuracy: Math.min(1, params.accuracy + mods.accuracyBonus),
        scoreValue: params.scoreValue,
        role: group.role,
        canShoot: group.canShoot !== false,
        kamikaze: group.kamikaze || false,
        maneuverType: maneuverType,
        maneuverTimer: 0,
        maneuverPhase: Math.random() * Math.PI * 2,
        stateTimer: 0,
        attackDuration: type === 'boss' ? 500 : 80 + Math.random() * 40,
        retreatDuration: 100,
        useLead: mods.useLead || type === 'boss',
        bossAttackPhase: 0
    };
    
    if (enemy.kamikaze) {
        enemy.state = AI_STATE.KAMIKAZE;
        enemy.speed *= 1.8;
    }
    
    return enemy;
};

Game.spawnBoss = function() {
    const mods = Game.getLevelModifiers(Game.state.level, 'campaign');
    const boss = {
        x: Game.canvas.width / 2, y: -100,
        rotation: 0, targetRotation: 0,
        type: 'boss', state: AI_STATE.ENTERING,
        targetX: Game.canvas.width / 2, targetY: 150,
        homeX: Game.canvas.width / 2, homeY: 150,
        health: 40 + Game.state.level * 15,
        maxHealth: 40 + Game.state.level * 15,
        speed: 1 * mods.speedMult,
        shootTimer: 0,
        shootInterval: Math.max(25, 50 / mods.shootFreqMult),
        bulletSpeed: 6, accuracy: 0.95, scoreValue: 50,
        role: 'boss', canShoot: true, kamikaze: false,
        maneuverType: MANEUVER.CIRCLE,
        maneuverTimer: 0, maneuverPhase: 0,
        stateTimer: 0, attackDuration: 1000,
        useLead: true, bossAttackPhase: 0
    };
    Game.enemies.push(boss);
};

console.log('✅ enemies/creation.js загружен');