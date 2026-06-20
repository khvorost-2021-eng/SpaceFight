// ==========================================
// СТРЕЛЬБА ВРАГОВ
// ==========================================

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

console.log('✅ enemies/combat.js загружен');