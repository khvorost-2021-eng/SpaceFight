// ==========================================
// ИИ ВРАГОВ И МАНЕВРИРОВАНИЕ
// ==========================================
Game.updateManeuver = function(enemy) {
    enemy.maneuverTimer += DT;
    enemy.maneuverPhase += 0.03 * DT;
    
    // 🔧 ИСПРАВЛЕНО: быстрый враг движется быстрее в маневрах
    const moveFactor = enemy.type === 'fast' ? 0.08 : 0.03;
    
    switch (enemy.maneuverType) {
        case MANEUVER.ZIGZAG: {
            const zigzagX = Math.sin(enemy.maneuverPhase * 3) * 80;
            const goalX = enemy.homeX + zigzagX;
            const goalY = enemy.homeY + Math.sin(enemy.maneuverPhase * 1.5) * 20;
            enemy.x += (goalX - enemy.x) * moveFactor * DT;
            enemy.y += (goalY - enemy.y) * moveFactor * DT;
            break;
        }
        case MANEUVER.CIRCLE: {
            const radius = 60;
            const goalX = enemy.homeX + Math.cos(enemy.maneuverPhase) * radius;
            const goalY = enemy.homeY + Math.sin(enemy.maneuverPhase) * radius;
            const circleFactor = enemy.type === 'fast' ? 0.09 : 0.04;
            enemy.x += (goalX - enemy.x) * circleFactor * DT;
            enemy.y += (goalY - enemy.y) * circleFactor * DT;
            break;
        }
        case MANEUVER.HOLD: {
            const holdFactor = enemy.type === 'fast' ? 0.10 : 0.05;
            enemy.x += (enemy.homeX - enemy.x) * holdFactor * DT;
            enemy.y += (enemy.homeY - enemy.y) * holdFactor * DT;
            break;
        }
    }
};

Game.updateEnemyAI = function(enemy) {
    const player = Game.player;
    const s = Game.state;
    const isDying = s.currentState === Game.STATE.DYING;
    enemy.stateTimer += DT;

    switch (enemy.state) {
        case AI_STATE.ENTERING: {
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 🔧 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
            // Вычисляем точное расстояние, которое враг пролетит за этот кадр.
            // Если оно больше, чем расстояние до цели, мы ограничиваем его,
            // чтобы враг НЕ ПЕРЕЛЕТЕЛ цель и не начал осциллировать.
            const moveSpeed = enemy.speed * 1.5 * DT;
            if (dist < 10 || dist <= moveSpeed) {
                const oldState = enemy.state;
                enemy.state = enemy.kamikaze ? AI_STATE.KAMIKAZE : AI_STATE.MANEUVERING;
                enemy.stateTimer = 0;
                enemy.stuckInManeuver = 0;
                
                if (enemy.type === 'fast') {
                    console.log(`➡️ [STATE] Fast ID:${enemy.id}: ${oldState} → ${enemy.state} (достиг targetX/Y)`);
                }
            } else {
                enemy.x += (dx / dist) * moveSpeed;
                enemy.y += (dy / dist) * moveSpeed;
            }
            break;
        }
        
        case AI_STATE.MANEUVERING: {
            Game.updateManeuver(enemy);
            
            enemy.stuckInManeuver += DT;
            
            const forceAttack = enemy.stuckInManeuver > 300;
            const normalAttack = enemy.stateTimer > enemy.maneuverAttackDelay;
            
            if ((normalAttack || forceAttack) && !isDying) {
                const oldState = enemy.state;
                enemy.state = AI_STATE.ATTACKING;
                enemy.stateTimer = 0;
                enemy.stuckInManeuver = 0;
                
                if (enemy.type === 'fast') {
                    console.log(`⚔️ [STATE] Fast ID:${enemy.id}: ${oldState} → ATTACKING`, {
                        reason: forceAttack ? 'FORCE (застрял)' : 'NORMAL',
                        stuckFrames: Math.floor(enemy.stuckInManeuver),
                        maneuverAttackDelay: enemy.maneuverAttackDelay,
                        canShoot: enemy.canShoot,
                        shootInterval: enemy.shootInterval
                    });
                }
            }
            break;
        }
        
        case AI_STATE.ATTACKING: {
            if (enemy.type !== 'boss') {
                // Обновляем maneuverPhase, чтобы точка уклонения двигалась
                enemy.maneuverPhase += 0.03 * DT;
                
                const holdX = enemy.homeX + Math.sin(enemy.maneuverPhase * 2) * 20;
                const holdY = enemy.homeY + Math.cos(enemy.maneuverPhase * 2) * 10;
                
                // Быстрый враг движется активнее в атаке
                const attackMoveFactor = enemy.type === 'fast' ? 0.08 : 0.03;
                enemy.x += (holdX - enemy.x) * attackMoveFactor * DT;
                enemy.y += (holdY - enemy.y) * attackMoveFactor * DT;
            } else {
                const bossX = Game.canvas.width / 2 + Math.sin(enemy.maneuverPhase * 0.5) * 100;
                const bossY = 150 + Math.sin(enemy.maneuverPhase * 0.3) * 30;
                enemy.x += (bossX - enemy.x) * 0.02 * DT;
                enemy.y += (bossY - enemy.y) * 0.02 * DT;
            }
            
            if (enemy.canShoot && !isDying) {
                enemy.shootTimer += DT;
                if (enemy.shootTimer >= enemy.shootInterval) {
                    if (enemy.type === 'boss') {
                        Game.bossShoot(enemy);
                    } else {
                        Game.enemyShoot(enemy);
                    }
                    enemy.shootTimer = 0;
                    
                    enemy.shotsFired++;
                    if (enemy.type === 'fast' && enemy.shotsFired === 1) {
                        console.log(`💥 [SHOOT] Fast ID:${enemy.id} сделал первый выстрел!`, {
                            x: enemy.x.toFixed(1),
                            y: enemy.y.toFixed(1),
                            shootInterval: enemy.shootInterval,
                            stateTimer: enemy.stateTimer.toFixed(1)
                        });
                    }
                }
            }
            
            if (enemy.stateTimer > enemy.attackDuration && enemy.type !== 'boss' && !isDying) {
                const oldState = enemy.state;
                enemy.state = AI_STATE.RETREATING;
                enemy.stateTimer = 0;
                enemy.targetX = enemy.x < Game.canvas.width / 2 ? Game.canvas.width + 100 : -100;
                enemy.targetY = -100;
                
                if (enemy.type === 'fast') {
                    console.log(`🏃 [STATE] Fast ID:${enemy.id}: ${oldState} → RETREATING (выстрелов: ${enemy.shotsFired})`);
                }
            }
            break;
        }
        
        case AI_STATE.RETREATING: {
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const moveSpeed = enemy.speed * 1.3 * DT;
            
            // 🔧 ИСПРАВЛЕНО: защита от перелёта цели при отступлении
            if (dist < 20 || dist <= moveSpeed || enemy.stateTimer > enemy.retreatDuration) {
                const oldState = enemy.state;
                enemy.state = AI_STATE.MANEUVERING;
                enemy.stateTimer = 0;
                enemy.stuckInManeuver = 0;
                
                const W = Game.canvas.width;
                const H = Game.canvas.height;
                const uniqueX = ((enemy.id * 37) % 100) - 50;
                const uniqueY = ((enemy.id * 73) % 80) - 40;
                
                enemy.homeX = Math.max(100, Math.min(W - 100, W / 2 + uniqueX));
                enemy.homeY = Math.max(100, Math.min(H - 200, H / 3 + uniqueY));
                
                enemy.maneuverPhase = ((enemy.id * 17) % 100 / 100) * Math.PI * 2;
                
                if (enemy.type === 'fast') {
                    enemy.maneuverAttackDelay = 40 + ((enemy.id * 31) % 30);
                } else {
                    enemy.maneuverAttackDelay = enemy.role === 'distractor' 
                        ? 60 
                        : 120 + ((enemy.id * 31) % 60);
                }
                
                if (enemy.type === 'fast') {
                    console.log(`🔄 [STATE] Fast ID:${enemy.id}: ${oldState} → MANEUVERING (новый homeX/Y)`, {
                        newHomeX: enemy.homeX.toFixed(1),
                        newHomeY: enemy.homeY.toFixed(1),
                        newManeuverAttackDelay: enemy.maneuverAttackDelay,
                        totalShots: enemy.shotsFired
                    });
                }
            } else {
                enemy.x += (dx / dist) * moveSpeed;
                enemy.y += (dy / dist) * moveSpeed;
            }
            break;
        }
        
        case AI_STATE.KAMIKAZE: {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const moveSpeed = enemy.speed * DT;
            
            if (dist > 0) {
                // 🔧 ИСПРАВЛЕНО: камикадзе не перелетает игрока (избавляет от микро-осцилляций при столкновении)
                const actualMove = Math.min(dist, moveSpeed);
                enemy.x += (dx / dist) * actualMove;
                enemy.y += (dy / dist) * actualMove;
            }
            
            enemy.maneuverPhase += 0.1 * DT;
            const perpX = -dy / (dist || 1);
            const perpY = dx / (dist || 1);
            enemy.x += perpX * Math.sin(enemy.maneuverPhase) * 2 * DT;
            enemy.y += perpY * Math.sin(enemy.maneuverPhase) * 2 * DT;
            break;
        }
    }
};

console.log('✅ enemies/ai.js загружен (ИСПРАВЛЕН баг с перелётом цели у быстрых врагов)');