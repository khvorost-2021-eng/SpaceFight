// ==========================================
// СОЗДАНИЕ ВРАГОВ И БОССОВ
// ==========================================

let enemyIdCounter = 0;

Game.createEnemy = function(group, indexInGroup, totalInGroup) {
    const type = group.type;
    const params = ENEMY_PARAMS[type];
    const W = Game.canvas.width;
    const H = Game.canvas.height;
    const mods = Game.getLevelModifiers(
        Game.state.mode === 'campaign' ? Game.state.level : 1,
        Game.state.mode
    );
    
    const enemyId = enemyIdCounter++;
    
    let startX, startY, targetX, targetY;
    let maneuverType = MANEUVER.ZIGZAG;
    const side = group.side;

    const offsetX = ((enemyId * 37) % 100 - 50);
    const offsetY = ((enemyId * 73) % 80 - 40);
    const offsetPhase = (enemyId * 17) % 100 / 100 * Math.PI * 2;

    switch(side) {
        case 'left':
            startX = -50;
            startY = 100 + (indexInGroup / Math.max(1, totalInGroup)) * 200;
            targetX = 150 + offsetX;
            targetY = 150 + (indexInGroup / Math.max(1, totalInGroup)) * 150 + offsetY;
            break;
        case 'right':
            startX = W + 50;
            startY = 100 + (indexInGroup / Math.max(1, totalInGroup)) * 200;
            targetX = W - 150 + offsetX;
            targetY = 150 + (indexInGroup / Math.max(1, totalInGroup)) * 150 + offsetY;
            break;
        case 'top':
            startX = 100 + (indexInGroup / Math.max(1, totalInGroup - 1 || 1)) * (W - 200);
            startY = -50;
            targetX = 100 + (indexInGroup / Math.max(1, totalInGroup - 1 || 1)) * (W - 200) + offsetX;
            targetY = 150 + offsetY;
            maneuverType = type === 'fast' ? MANEUVER.ZIGZAG : MANEUVER.CIRCLE;
            break;
        case 'center':
            startX = W/2 + (indexInGroup - totalInGroup/2) * 60;
            startY = -50;
            targetX = W/2 + (indexInGroup - totalInGroup/2) * 80 + offsetX;
            targetY = 150 + offsetY;
            maneuverType = MANEUVER.HOLD;
            break;
        case 'surround': {
            const angle = (indexInGroup / Math.max(1, totalInGroup)) * Math.PI * 2;
            const radius = 250 + offsetX * 0.3;
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
                targetX = 150 + offsetX;
                targetY = 150 + indexInGroup * 60 + offsetY;
            } else {
                const rightIndex = indexInGroup - Math.ceil(totalInGroup / 2);
                startX = W + 50;
                startY = 100 + rightIndex * 80;
                targetX = W - 150 + offsetX;
                targetY = 150 + rightIndex * 60 + offsetY;
            }
            maneuverType = MANEUVER.ZIGZAG;
            break;
        }
    }

    const margin = 100;
    targetX = Math.max(margin, Math.min(W - margin, targetX));
    targetY = Math.max(margin, Math.min(H - margin * 2, targetY));

    if (isNaN(targetX) || isNaN(targetY) || targetX === undefined || targetY === undefined) {
        targetX = W / 2 + offsetX;
        targetY = H / 3 + offsetY;
    }

    let shootInterval = params.shootInterval;
    if (group.shootMult) shootInterval /= group.shootMult;
    shootInterval = Math.max(20, shootInterval / mods.shootFreqMult);

    const canShoot = (type === 'fast') 
        ? (group.kamikaze ? false : true)
        : (group.canShoot !== false && type !== 'boss');

    let maneuverAttackDelay;
    if (type === 'fast') {
        maneuverAttackDelay = 40 + ((enemyId * 31) % 30);
    } else if (group.role === 'distractor') {
        maneuverAttackDelay = 60;
    } else {
        maneuverAttackDelay = 120 + ((enemyId * 31) % 60);
    }

    const enemy = {
        id: enemyId,
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
        canShoot: canShoot,
        kamikaze: group.kamikaze || false,
        maneuverType: maneuverType,
        maneuverTimer: 0,
        maneuverPhase: offsetPhase,
        stateTimer: 0,
        attackDuration: type === 'boss' ? 500 : 80 + Math.random() * 40,
        retreatDuration: 100,
        useLead: mods.useLead || type === 'boss',
        bossAttackPhase: 0,
        maneuverAttackDelay: maneuverAttackDelay,
        stuckInManeuver: 0,
        // 🔧 ЛОГИРОВАНИЕ: счётчик выстрелов
        shotsFired: 0
    };

    if (enemy.kamikaze) {
        enemy.state = AI_STATE.KAMIKAZE;
        enemy.speed *= 1.8;
    }

    // 🔧 ЛОГИРОВАНИЕ: создание врага
    if (type === 'fast') {
        console.log(`🚀 [CREATE] Fast-враг ID:${enemyId} создан`, {
            side: side,
            indexInGroup: indexInGroup,
            totalInGroup: totalInGroup,
            startX: startX.toFixed(1),
            startY: startY.toFixed(1),
            targetX: targetX.toFixed(1),
            targetY: targetY.toFixed(1),
            homeX: targetX.toFixed(1),
            homeY: targetY.toFixed(1),
            canShoot: canShoot,
            shootInterval: shootInterval,
            maneuverAttackDelay: maneuverAttackDelay,
            offsetX: offsetX,
            offsetY: offsetY,
            kamikaze: enemy.kamikaze
        });
    }

    return enemy;
};

Game.spawnBoss = function() {
    const mods = Game.getLevelModifiers(Game.state.level, 'campaign');
    const bossHP = 20 + Game.state.level * 5;
    const bossId = enemyIdCounter++;

    const boss = {
        id: bossId,
        x: Game.canvas.width / 2,
        y: -100,
        rotation: 0,
        targetRotation: 0,
        type: 'boss',
        state: AI_STATE.ENTERING,
        targetX: Game.canvas.width / 2,
        targetY: 150,
        homeX: Game.canvas.width / 2,
        homeY: 150,
        health: bossHP,
        maxHealth: bossHP,
        speed: 0.8 * mods.speedMult,
        shootTimer: 0,
        shootInterval: Math.max(60, 90 / mods.shootFreqMult),
        bulletSpeed: 4.5,
        accuracy: 0.85,
        scoreValue: 50,
        role: 'boss',
        canShoot: true,
        kamikaze: false,
        maneuverType: MANEUVER.CIRCLE,
        maneuverTimer: 0,
        maneuverPhase: 0,
        stateTimer: 0,
        attackDuration: 1000,
        useLead: true,
        bossAttackPhase: 0,
        maneuverAttackDelay: 120,
        stuckInManeuver: 0,
        shotsFired: 0
    };

    Game.enemies.push(boss);
    console.log(`👹 Босс заспавнен! HP: ${bossHP}, ID: ${bossId}`);
};

console.log('✅ enemies/creation.js загружен (с логированием)');