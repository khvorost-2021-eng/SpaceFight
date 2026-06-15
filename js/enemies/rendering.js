// ==========================================
// ОТРИСОВКА ВРАГОВ
// ==========================================

Game.drawEnemyNormal = function(enemy) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation); // Используем rotation врага
    
    if (Game.ships.normal) {
        ctx.drawImage(Game.ships.normal, -30, -35, 60, 70);
    }
    
    ctx.restore();
};

Game.drawEnemyFast = function(enemy) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    
    if (Game.ships.fast) {
        ctx.drawImage(Game.ships.fast, -35, -40, 70, 80);
    }
    
    ctx.restore();
};

Game.drawEnemyArmored = function(enemy) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    
    if (Game.ships.armored) {
        ctx.drawImage(Game.ships.armored, -40, -40, 80, 80);
    }
    
    ctx.restore();
    
    // HP бар для бронированных
    if (enemy.health < enemy.maxHealth) {
        const barWidth = 60;
        const barHeight = 4;
        const barY = enemy.y - 50;
        const hpPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);
    }
};

Game.drawBoss = function(enemy) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    
    if (Game.ships.boss) {
        ctx.drawImage(Game.ships.boss, -80, -90, 160, 180);
    }
    
    ctx.restore();
    
    // HP бар для босса
    const barWidth = 140;
    const barHeight = 8;
    const barY = enemy.y - 100;
    const hpPercent = enemy.health / enemy.maxHealth;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
    
    const hpColor = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = hpColor;
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
};

Game.drawEnemy = function(enemy) {
    switch (enemy.type) {
        case 'normal':
            Game.drawEnemyNormal(enemy);
            break;
        case 'fast':
            Game.drawEnemyFast(enemy);
            break;
        case 'armored':
            Game.drawEnemyArmored(enemy);
            break;
        case 'boss':
            Game.drawBoss(enemy);
            break;
    }
};

console.log('✅ enemies/rendering.js загружен');