// ==========================================
// ОБНОВЛЕНИЕ ВРАГОВ
// ==========================================

/**
 * Плавный поворот врага к целевой точке
 */
Game.rotateTowards = function(entity, targetX, targetY, speed) {
    speed = speed || 0.08;
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
    const diff = targetAngle - entity.rotation;
    const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
    entity.rotation += normalized * speed;
};

Game.updateEnemies = function() {
    const s = Game.state;
    const player = Game.player;
    
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        
        // Повороты в зависимости от состояния
        switch(enemy.state) {
            case AI_STATE.ENTERING:
                Game.rotateTowards(enemy, enemy.targetX, enemy.targetY, 0.15);
                break;
            case AI_STATE.MANEUVERING:
                if (s.currentState !== Game.STATE.DYING) {
                    Game.rotateTowards(enemy, player.x, player.y, 0.03);
                }
                break;
            case AI_STATE.ATTACKING:
                if (s.currentState !== Game.STATE.DYING) {
                    Game.rotateTowards(enemy, player.x, player.y, 0.1);
                }
                break;
            case AI_STATE.RETREATING:
                Game.rotateTowards(enemy, enemy.targetX, enemy.targetY, 0.1);
                break;
            case AI_STATE.KAMIKAZE:
                Game.rotateTowards(enemy, player.x, player.y, 0.15);
                break;
        }
        
        // Обновляем ИИ (стрельба обрабатывается внутри)
        if (typeof Game.updateEnemyAI === 'function') {
            Game.updateEnemyAI(enemy);
        }
        
        // Удаляем врагов за пределами экрана
        if (enemy.type !== 'boss') {
            if (enemy.x < -200 || enemy.x > Game.canvas.width + 200 ||
                enemy.y < -200 || enemy.y > Game.canvas.height + 200) {
                Game.enemies.splice(i, 1);
            }
        }
    }
    
    // Вражеские пули продолжают лететь даже при DYING
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

console.log('✅ enemies/update.js загружен');