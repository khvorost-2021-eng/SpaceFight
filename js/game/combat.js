// ==========================================
// СИСТЕМА КОЛЛИЗИЙ И УРОНА
// ==========================================

function checkBulletEnemyCollisions() {
    const s = Game.state;
    
    for (let bIndex = Game.bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = Game.bullets[bIndex];
        const bx = bullet.vx !== undefined ? bullet.x : bullet.x;
        const by = bullet.vx !== undefined ? bullet.y : bullet.y;
        const damage = bullet.damage || 1;
        
        for (let eIndex = Game.enemies.length - 1; eIndex >= 0; eIndex--) {
            const enemy = Game.enemies[eIndex];
            const params = ENEMY_PARAMS[enemy.type];
            const hitDistance = enemy.type === 'boss' ? 70 : (params.width + params.height) / 4;
            const dx = bx - enemy.x;
            const dy = by - enemy.y;
            
            if (Math.sqrt(dx * dx + dy * dy) < hitDistance) {
                Game.bullets.splice(bIndex, 1);
                enemy.health -= damage;
                
                Game.playHitSound();
                Game.createHitFlash(bx, by);
                
                if (enemy.health <= 0) {
                    Game.createExplosion(enemy.x, enemy.y);
                    Game.enemies.splice(eIndex, 1);
                    s.score += enemy.scoreValue;
                    
                    const xpGain = enemy.scoreValue * 5;
                    Game.addXP(xpGain);
                    s.xpEarned = (s.xpEarned || 0) + xpGain;
                    
                    Game.playExplosionSound();
                }
                break;
            }
        }
    }
}

function checkEnemyBulletPlayerCollisions() {
    const s = Game.state;
    
    if (s.invulnerable > 0) return;
    
    for (let bIndex = Game.enemyBullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = Game.enemyBullets[bIndex];
        let hitSomething = false;
        
        // Проверка с игроком
        const dxP = bullet.x - Game.player.x;
        const dyP = bullet.y - Game.player.y;
        if (Math.sqrt(dxP * dxP + dyP * dyP) < 25) {
            Game.enemyBullets.splice(bIndex, 1);
            if (Game.takeDamage()) {
                Game.gameOver();
                return;
            }
            hitSomething = true;
            continue;
        }
        
        // Проверка с дронами
        if (!hitSomething) {
            for (let d = 0; d < Game.drones.length; d++) {
                const drone = Game.drones[d];
                if (!drone.alive) continue;
                const dxD = bullet.x - drone.x;
                const dyD = bullet.y - drone.y;
                if (Math.sqrt(dxD * dxD + dyD * dyD) < 20) {
                    Game.enemyBullets.splice(bIndex, 1);
                    drone.hp--;
                    drone.damageFlash = 20;
                    
                    if (drone.hp <= 0) {
                        drone.alive = false;
                        Game.createExplosion(drone.x, drone.y);
                        Game.playExplosionSound();
                    }
                    hitSomething = true;
                    break;
                }
            }
        }
    }
}

function checkEnemyCollisions() {
    const s = Game.state;
    
    for (let eIndex = Game.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = Game.enemies[eIndex];
        
        // С игроком
        if (s.invulnerable <= 0) {
            const params = ENEMY_PARAMS[enemy.type];
            const hitDistance = enemy.type === 'boss' ? 60 : (params.width + params.height) / 4;
            const dx = enemy.x - Game.player.x;
            const dy = enemy.y - Game.player.y;
            if (Math.sqrt(dx * dx + dy * dy) < hitDistance) {
                if (enemy.kamikaze || enemy.type !== 'boss') {
                    Game.createExplosion(enemy.x, enemy.y);
                    Game.enemies.splice(eIndex, 1);
                }
                if (Game.takeDamage()) {
                    Game.gameOver();
                    return;
                }
                continue;
            }
        }
        
        // С дронами
        for (let d = 0; d < Game.drones.length; d++) {
            const drone = Game.drones[d];
            if (!drone.alive) continue;
            const dxD = enemy.x - drone.x;
            const dyD = enemy.y - drone.y;
            if (Math.sqrt(dxD * dxD + dyD * dyD) < 30) {
                drone.hp -= 2;
                drone.damageFlash = 30;
                
                if (enemy.kamikaze || enemy.type !== 'boss') {
                    Game.createExplosion(enemy.x, enemy.y);
                    Game.enemies.splice(eIndex, 1);
                    Game.playExplosionSound();
                }
                
                if (drone.hp <= 0) {
                    drone.alive = false;
                    Game.createExplosion(drone.x, drone.y);
                    Game.playExplosionSound();
                }
                break;
            }
        }
    }
}