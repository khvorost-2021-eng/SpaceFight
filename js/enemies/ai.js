// ==========================================
// ИИ ВРАГОВ И МАНЕВРИРОВАНИЕ
// ==========================================

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

Game.updateEnemyAI = function(enemy) {
    const player = Game.player;
    const s = Game.state;
    
    // Во время DYING враги продолжают двигаться, но не стреляют
    const isDying = s.currentState === Game.STATE.DYING;
    
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
            }
            break;
        }
        
        case AI_STATE.MANEUVERING: {
            Game.updateManeuver(enemy);
            
            const attackDelay = enemy.role === 'distractor' ? 60 : 120 + Math.random() * 60;
            if (enemy.stateTimer > attackDelay && !isDying) {
                enemy.state = AI_STATE.ATTACKING;
                enemy.stateTimer = 0;
            }
            break;
        }
        
        case AI_STATE.ATTACKING: {
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
            
            // Стрельба только если не dying и canShoot
            if (enemy.canShoot && !isDying) {
                enemy.shootTimer++;
                if (enemy.shootTimer >= enemy.shootInterval) {
                    if (enemy.type === 'boss') Game.bossShoot(enemy);
                    else Game.enemyShoot(enemy);
                    enemy.shootTimer = 0;
                }
            }
            
            if (enemy.stateTimer > enemy.attackDuration && enemy.type !== 'boss' && !isDying) {
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
                enemy.state = AI_STATE.MANEUVERING;
                enemy.stateTimer = 0;
                enemy.homeX = 100 + Math.random() * (Game.canvas.width - 200);
                enemy.homeY = 100 + Math.random() * 200;
            } else {
                enemy.x += (dx / dist) * enemy.speed * 1.3;
                enemy.y += (dy / dist) * enemy.speed * 1.3;
            }
            break;
        }
        
        case AI_STATE.KAMIKAZE: {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed;
                enemy.y += (dy / dist) * enemy.speed;
            }
            
            enemy.maneuverPhase += 0.1;
            const perpX = -dy / (dist || 1);
            const perpY = dx / (dist || 1);
            enemy.x += perpX * Math.sin(enemy.maneuverPhase) * 2;
            enemy.y += perpY * Math.sin(enemy.maneuverPhase) * 2;
            break;
        }
    }
};

Game.findDroneTarget = function(drone) {
    if (Game.enemies.length === 0) return null;
    const type = drone.type;

    // Перехватчик ищет быстрых врагов
    if (type === 'interceptor') {
        const fastEnemies = Game.enemies.filter(e => e.type === 'fast');
        if (fastEnemies.length > 0) {
            return Game.findClosest(drone, fastEnemies);
        }
    }

    // Остальные ищут ближайшего врага
    return Game.findClosest(drone, Game.enemies);
};

Game.findClosest = function(from, targets) {
    let closest = null;
    let closestDist = Infinity;
    targets.forEach(target => {
        const dx = target.x - from.x;
        const dy = target.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < closestDist) {
            closestDist = dist;
            closest = target;
        }
    });

    return closest;
};

console.log('✅ enemies/ai.js загружен');