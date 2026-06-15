const AI_STATE = {
    ENTERING: 'ENTERING',
    MANEUVERING: 'MANEUVERING',
    ATTACKING: 'ATTACKING',
    RETREATING: 'RETREATING',
    KAMIKAZE: 'KAMIKAZE'
};

const MANEUVER = { ZIGZAG: 'ZIGZAG', CIRCLE: 'CIRCLE', HOLD: 'HOLD' };

const ENEMY_PARAMS = {
    normal: { width: 60, height: 70, hp: 1, speed: 2.5, shootInterval: 100, bulletSpeed: 5, accuracy: 0.85, scoreValue: 1 },
    fast: { width: 70, height: 80, hp: 1, speed: 4.5, shootInterval: 60, bulletSpeed: 7, accuracy: 0.75, scoreValue: 2 },
    armored: { width: 80, height: 80, hp: 3, speed: 1.5, shootInterval: 140, bulletSpeed: 4, accuracy: 0.95, scoreValue: 3 },
    boss: { width: 160, height: 180, hp: 50, speed: 1, shootInterval: 50, bulletSpeed: 6, accuracy: 0.9, scoreValue: 50 }
};

Game.drawEnemy = function(enemy) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    
    const ship = Game.ships[enemy.type];
    const params = ENEMY_PARAMS[enemy.type];
    
    if (ship) {
        const scale = enemy.type === 'boss' ? 1.0 : 1.2;
        const w = params.width * scale;
        const h = params.height * scale;
        ctx.drawImage(ship, -w/2, -h/2, w, h);
    }
    
    if (enemy.type === 'armored' && enemy.health < enemy.maxHealth) {
        ctx.rotate(-enemy.rotation);
        const w = 40;
        ctx.fillStyle = '#333';
        ctx.fillRect(-w/2, -params.height/2 - 10, w, 4);
        ctx.fillStyle = '#ff0';
        ctx.fillRect(-w/2, -params.height/2 - 10, w * (enemy.health/enemy.maxHealth), 4);
    }
    
    if (enemy.type === 'boss') {
        ctx.rotate(-enemy.rotation);
        const bw = 140;
        const pct = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(-bw/2, -params.height/2 - 20, bw, 8);
        ctx.fillStyle = pct > 0.5 ? '#0f0' : pct > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(-bw/2, -params.height/2 - 20, bw * pct, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-bw/2, -params.height/2 - 20, bw, 8);
    }
    
    ctx.restore();
};

// === СОЗДАНИЕ ВРАГА С ПРИМЕНЕНИЕМ МОДИФИКАТОРОВ ===
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
            startY = 100 + (indexInGroup / totalInGroup) * 200;
            targetX = 150 + Math.random() * 100;
            targetY = 150 + (indexInGroup / totalInGroup) * 150;
            break;
        case 'right':
            startX = W + 50;
            startY = 100 + (indexInGroup / totalInGroup) * 200;
            targetX = W - 150 - Math.random() * 100;
            targetY = 150 + (indexInGroup / totalInGroup) * 150;
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
            const angle = (indexInGroup / totalInGroup) * Math.PI * 2;
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
    
    // Применяем модификаторы уровня
    let shootInterval = params.shootInterval;
    if (group.shootMult) shootInterval /= group.shootMult;
    shootInterval = Math.max(20, shootInterval / mods.shootFreqMult);
    
    const enemy = {
        type: type,
        x: startX,
        y: startY,
        rotation: 0,
        targetRotation: 0,
        state: AI_STATE.ENTERING,
        targetX: targetX,
        targetY: targetY,
        homeX: targetX,
        homeY: targetY,
        health: params.hp,
        maxHealth: params.hp,
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
    
    // Для камикадзе — сразу атакующий режим
    if (enemy.kamikaze) {
        enemy.state = AI_STATE.KAMIKAZE;
        enemy.speed *= 1.8; // Быстрее обычного
    }
    
    return enemy;
};

// === ЗАПУСК КОНКРЕТНОЙ ВОЛНЫ ===
Game.startWave = function(waveIndex) {
    const s = Game.state;
    const waveConfig = s.levelWaves[waveIndex];
    
    if (!waveConfig) return;
    
    s.currentWave = waveIndex + 1;
    s.waveState = 'SPAWNING';
    s.waveTimer = 0;
    s.currentWaveConfig = waveConfig;
    s.waveAnnouncement = waveConfig.description;
    s.announcementTimer = 120;
    
    // Волна босса
    if (waveConfig.boss) {
        setTimeout(() => {
            if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                Game.spawnBoss();
                s.waveState = 'ACTIVE';
            }
        }, 1500);
        return;
    }
    
    // Спавн групп
    let delay = 0;
    waveConfig.groups.forEach((group, gi) => {
        const totalInGroup = Math.ceil(group.count);
        for (let i = 0; i < group.count; i++) {
            setTimeout(() => {
                if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
                    Game.enemies.push(Game.createEnemy(group, i, totalInGroup));
                }
            }, delay);
            delay += group.type === 'boss' ? 500 : 300;
        }
    });
    
    setTimeout(() => {
        if (s.waveState === 'SPAWNING') s.waveState = 'ACTIVE';
    }, delay + 500);
};

Game.spawnBoss = function() {
    const mods = Game.getLevelModifiers(Game.state.level, 'campaign');
    const boss = {
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
        health: 40 + Game.state.level * 15,
        maxHealth: 40 + Game.state.level * 15,
        speed: 1 * mods.speedMult,
        shootTimer: 0,
        shootInterval: Math.max(25, 50 / mods.shootFreqMult),
        bulletSpeed: 6,
        accuracy: 0.95,
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
        moveDirection: 1
    };
    Game.enemies.push(boss);
};

Game.rotateTowards = function(entity, targetX, targetY, speed = 0.08) {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
    const diff = targetAngle - entity.rotation;
    const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
    entity.rotation += normalized * speed;
};

// === ВЫСТРЕЛ ИЗ НОСА ===
Game.enemyShoot = function(enemy) {
    const player = Game.player;
    const s = Game.state;
    
    const noseOffset = enemy.type === 'boss' ? 55 : 25;
    const noseX = enemy.x + Math.sin(enemy.rotation) * noseOffset;
    const noseY = enemy.y - Math.cos(enemy.rotation) * noseOffset;
    
    let targetX = player.x;
    let targetY = player.y;
    
    if (enemy.useLead) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const timeToHit = distance / enemy.bulletSpeed;
        targetX = player.x + s.playerVX * timeToHit * 0.8;
        targetY = player.y + s.playerVY * timeToHit * 0.8;
    }
    
    const dx = targetX - noseX;
    const dy = targetY - noseY;
    const spread = (1 - enemy.accuracy) * 0.5;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * spread;
    
    Game.enemyBullets.push({
        x: noseX, y: noseY,
        vx: Math.cos(angle) * enemy.bulletSpeed,
        vy: Math.sin(angle) * enemy.bulletSpeed,
        width: 4, height: 12
    });
};

Game.bossShoot = function(enemy) {
    enemy.bossAttackPhase++;
    
    if (enemy.bossAttackPhase % 3 === 0) {
        const count = 7;
        for (let i = 0; i < count; i++) {
            const baseAngle = Math.atan2(Game.player.y - enemy.y, Game.player.x - enemy.x);
            const spreadAngle = baseAngle + (i - count/2) * 0.15;
            Game.enemyBullets.push({
                x: enemy.x, y: enemy.y + 40,
                vx: Math.cos(spreadAngle) * enemy.bulletSpeed,
                vy: Math.sin(spreadAngle) * enemy.bulletSpeed,
                width: 4, height: 12
            });
        }
    } else {
        Game.enemyShoot(enemy);
    }
};

Game.updateManeuver = function(enemy) {
    enemy.maneuverTimer++;
    enemy.maneuverPhase += 0.03;
    
    switch(enemy.maneuverType) {
        case MANEUVER.ZIGZAG: {
            const zigzagX = Math.sin(enemy.maneuverPhase * 3) * 80;
            const goalX = enemy.homeX + zigzagX;
            const goalY = enemy.homeY + Math.sin(enemy.maneuverPhase * 1.5) * 20;
            enemy.x += (goalX - enemy.x) * 0.03;
            enemy.y += (goalY - enemy.y) * 0.03;
            break;
        }
        case MANEUVER.CIRCLE: {
            const radius = 60;
            const goalX = enemy.homeX + Math.cos(enemy.maneuverPhase) * radius;
            const goalY = enemy.homeY + Math.sin(enemy.maneuverPhase) * radius;
            enemy.x += (goalX - enemy.x) * 0.04;
            enemy.y += (goalY - enemy.y) * 0.04;
            break;
        }
        case MANEUVER.HOLD: {
            enemy.x += (enemy.homeX - enemy.x) * 0.05;
            enemy.y += (enemy.homeY - enemy.y) * 0.05;
            break;
        }
    }
};

// === ГЛАВНЫЙ ЦИКЛ ИИ ===
Game.updateEnemies = function() {
    const s = Game.state;
    const player = Game.player;
    
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        enemy.stateTimer++;
        
        switch(enemy.state) {
            case AI_STATE.ENTERING: {
                const dx = enemy.targetX - enemy.x;
                const dy = enemy.targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 10) {
                    enemy.state = enemy.kamikaze ? AI_STATE.KAMIKAZE : AI_STATE.MANEUVERING;
                    enemy.stateTimer = 0;
                } else {
                    const speed = enemy.speed * 1.5;
                    enemy.x += (dx / dist) * speed;
                    enemy.y += (dy / dist) * speed;
                    Game.rotateTowards(enemy, enemy.targetX, enemy.targetY, 0.15);
                }
                break;
            }
            
            case AI_STATE.MANEUVERING: {
                Game.updateManeuver(enemy);
                Game.rotateTowards(enemy, player.x, player.y, 0.03);
                
                const attackDelay = enemy.role === 'distractor' ? 60 : 120 + Math.random() * 60;
                if (enemy.stateTimer > attackDelay) {
                    enemy.state = AI_STATE.ATTACKING;
                    enemy.stateTimer = 0;
                }
                break;
            }
            
            case AI_STATE.ATTACKING: {
                Game.rotateTowards(enemy, player.x, player.y, 0.1);
                
                if (enemy.type !== 'boss') {
                    const holdX = enemy.homeX + Math.sin(enemy.maneuverPhase * 2) * 20;
                    const holdY = enemy.homeY + Math.cos(enemy.maneuverPhase * 2) * 10;
                    enemy.x += (holdX - enemy.x) * 0.03;
                    enemy.y += (holdY - enemy.y) * 0.03;
                } else {
                    const bossX = Game.canvas.width / 2 + Math.sin(enemy.maneuverPhase * 0.5) * 100;
                    const bossY = 150 + Math.sin(enemy.maneuverPhase * 0.3) * 30;
                    enemy.x += (bossX - enemy.x) * 0.02;
                    enemy.y += (bossY - enemy.y) * 0.02;
                }
                
                if (enemy.canShoot) {
                    enemy.shootTimer++;
                    if (enemy.shootTimer >= enemy.shootInterval) {
                        if (enemy.type === 'boss') Game.bossShoot(enemy);
                        else Game.enemyShoot(enemy);
                        enemy.shootTimer = 0;
                    }
                }
                
                if (enemy.stateTimer > enemy.attackDuration && enemy.type !== 'boss') {
                    enemy.state = AI_STATE.RETREATING;
                    enemy.stateTimer = 0;
                    enemy.targetX = enemy.x < Game.canvas.width / 2 ? Game.canvas.width + 100 : -100;
                    enemy.targetY = -100;
                }
                break;
            }
            
            case AI_STATE.RETREATING: {
                const dx = enemy.targetX - enemy.x;
                const dy = enemy.targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20 || enemy.stateTimer > enemy.retreatDuration) {
                    // Возвращаемся к маневрам
                    enemy.state = AI_STATE.MANEUVERING;
                    enemy.stateTimer = 0;
                    enemy.homeX = 100 + Math.random() * (Game.canvas.width - 200);
                    enemy.homeY = 100 + Math.random() * 200;
                } else {
                    enemy.x += (dx / dist) * enemy.speed * 1.3;
                    enemy.y += (dy / dist) * enemy.speed * 1.3;
                    Game.rotateTowards(enemy, enemy.targetX, enemy.targetY, 0.1);
                }
                break;
            }
            
            case AI_STATE.KAMIKAZE: {
                // Летит прямо в игрока
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    enemy.x += (dx / dist) * enemy.speed;
                    enemy.y += (dy / dist) * enemy.speed;
                }
                Game.rotateTowards(enemy, player.x, player.y, 0.15);
                
                // Небольшой зигзаг
                enemy.maneuverPhase += 0.1;
                const perpX = -dy / dist;
                const perpY = dx / dist;
                enemy.x += perpX * Math.sin(enemy.maneuverPhase) * 2;
                enemy.y += perpY * Math.sin(enemy.maneuverPhase) * 2;
                break;
            }
        }
        
        // Удаляем улетевших (кроме босса)
        if (enemy.type !== 'boss') {
            if (enemy.x < -200 || enemy.x > Game.canvas.width + 200 ||
                enemy.y < -200 || enemy.y > Game.canvas.height + 200) {
                Game.enemies.splice(i, 1);
            }
        }
    }
    
    // Вражеские пули
    for (let j = Game.enemyBullets.length - 1; j >= 0; j--) {
        const bullet = Game.enemyBullets[j];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        const margin = 50;
        if (bullet.x < -margin || bullet.x > Game.canvas.width + margin ||
            bullet.y < -margin || bullet.y > Game.canvas.height + margin) {
            Game.enemyBullets.splice(j, 1);
        }
    }
};