Game.createExplosion = function(x, y, isPlayer) {
    isPlayer = isPlayer || false;
    const count = isPlayer ? 50 : 20;
    const size = isPlayer ? 6 : 3;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        Game.particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * size + 2,
            life: 1,
            decay: Math.random() * 0.02 + 0.01,
            color: isPlayer ? `hsl(${Math.random() * 60}, 100%, 50%)` : `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    if (isPlayer) {
        Game.state.shakeAmount = 20;
    }
};

Game.createHitFlash = function(x, y) {
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        Game.particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            life: 1, decay: 0.05,
            color: '#ffffff'
        });
    }
};

// === ГЛАВНЫЙ UPDATE ===
Game.update = function() {
    const s = Game.state;
    
    // Всегда обновляем частицы и тряску (даже в меню/смерти)
    for (let i = Game.particles.length - 1; i >= 0; i--) {
        const p = Game.particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1;
        p.life -= p.decay;
        if (p.life <= 0) Game.particles.splice(i, 1);
    }
    s.shakeAmount *= 0.9;
    if (s.shakeAmount < 0.1) s.shakeAmount = 0;
    
    // Если игра не активна — выходим
    if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) {
        return;
    }
    
    Game.updatePlayer();
    
    Game.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > Game.canvas.height) {
            star.y = 0;
            star.x = Math.random() * Game.canvas.width;
        }
    });
    
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        Game.bullets[i].y -= 10;
        if (Game.bullets[i].y < -20) Game.bullets.splice(i, 1);
    }
    
    Game.updateEnemies();
    Game.checkWaveComplete();
    
    // === КЛЮЧЕВАЯ ЛОГИКА: переход к следующей волне ===
    if (s.waveState === 'CLEARED') {
        s.waveTimer++;
        if (s.waveTimer > 120) {
            // Переходим к следующей волне
            const nextWaveIndex = s.currentWave; // currentWave=1, значит next index = 1
            console.log(`Переход к волне ${nextWaveIndex + 1}`);
            
            if (nextWaveIndex >= s.totalWaves) {
                // Все волны пройдены
                if (s.mode === 'campaign') {
                    Game.levelComplete();
                } else {
                    // Аркада: генерируем новые волны
                    s.levelWaves = Game.generateEndlessWaves(s.score);
                    s.totalWaves = s.levelWaves.length;
                    s.currentWave = 0;
                    Game.startWave(0);
                }
            } else {
                Game.startWave(nextWaveIndex);
            }
        }
    }
    
    if (s.announcementTimer > 0) s.announcementTimer--;
    
    // Коллизии пуль игрока с врагами
    for (let bIndex = Game.bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = Game.bullets[bIndex];
        for (let eIndex = Game.enemies.length - 1; eIndex >= 0; eIndex--) {
            const enemy = Game.enemies[eIndex];
            const params = ENEMY_PARAMS[enemy.type];
            const hitDistance = enemy.type === 'boss' ? 70 : (params.width + params.height) / 4;
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            if (Math.sqrt(dx * dx + dy * dy) < hitDistance) {
                Game.bullets.splice(bIndex, 1);
                enemy.health--;
                Game.createHitFlash(bullet.x, bullet.y);
                
                if (enemy.health <= 0) {
                    Game.createExplosion(enemy.x, enemy.y);
                    Game.enemies.splice(eIndex, 1);
                    s.score += enemy.scoreValue;
                }
                break;
            }
        }
    }
    
    // Столкновения с игроком
    if (s.invulnerable <= 0) {
        for (let bIndex = Game.enemyBullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = Game.enemyBullets[bIndex];
            const dx = bullet.x - Game.player.x;
            const dy = bullet.y - Game.player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 25) {
                Game.enemyBullets.splice(bIndex, 1);
                if (Game.takeDamage()) {
                    Game.gameOver();
                    return;
                }
            }
        }
        
        for (let eIndex = Game.enemies.length - 1; eIndex >= 0; eIndex--) {
            const enemy = Game.enemies[eIndex];
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
            }
        }
    }
};

// === БЕСКОНЕЧНЫЕ ВОЛНЫ ДЛЯ АРКАДЫ ===
Game.generateEndlessWaves = function(currentScore) {
    const diffLevel = Math.floor(currentScore / 30) + 4;
    return Game.generateWavesForLevel(diffLevel);
};

Game.levelComplete = function() {
    const s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    s.coinsEarned = s.score * 2;
    Game.playerData.coins += s.coinsEarned;
    
    if (!Game.playerData.levelsCompleted.includes(s.level)) {
        Game.playerData.levelsCompleted.push(s.level);
    }
    if (s.level >= Game.playerData.maxLevelUnlocked) {
        Game.playerData.maxLevelUnlocked = Math.min(20, s.level + 1);
    }
    
    Game.savePlayerData();
    Game.showLevelCompleteScreen();
};

Game.gameOver = function() {
    const s = Game.state;
    s.currentState = Game.STATE.GAME_OVER;
    Game.createExplosion(Game.player.x, Game.player.y, true);
    
    s.coinsEarned = s.mode === 'arcade' ? Math.floor(s.score / 2) : Math.floor(s.score * 1.5);
    Game.playerData.coins += s.coinsEarned;
    Game.savePlayerData();
    
    if (s.mode === 'arcade') Game.submitLeaderboardScore(s.score);
    
    setTimeout(() => {
        Game.state.shakeAmount = 0;
        Game.particles.length = 0;
        Game.showDeathScreen();
    }, 1500);
};

Game.draw = function() {
    const ctx = Game.ctx;
    ctx.save();
    if (Game.state.shakeAmount > 0) {
        ctx.translate(
            (Math.random() - 0.5) * Game.state.shakeAmount,
            (Math.random() - 0.5) * Game.state.shakeAmount
        );
    }
    
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
    
    Game.stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    Game.bullets.forEach(bullet => {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(bullet.x - 2, bullet.y - 6, 4, 12);
        ctx.shadowBlur = 0;
    });
    
    Game.enemyBullets.forEach(bullet => {
        const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, -6, 4, 12);
        ctx.shadowBlur = 0;
        ctx.restore();
    });
    
    Game.enemies.forEach(enemy => Game.drawEnemy(enemy));
    
    Game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    if (Game.state.currentState === Game.STATE.ARCADE || Game.state.currentState === Game.STATE.CAMPAIGN) {
        Game.drawPlayer(Game.player.x, Game.player.y, Game.player.rotation, Game.player.flameOffset);
    }
    
    if (Game.state.announcementTimer > 0 && 
        (Game.state.currentState === Game.STATE.ARCADE || 
         Game.state.currentState === Game.STATE.CAMPAIGN ||
         Game.state.currentState === Game.STATE.GAME_OVER)) {
        const alpha = Math.min(1, Game.state.announcementTimer / 30);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillText(Game.state.waveAnnouncement, Game.canvas.width / 2, 100);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    ctx.restore();
};

Game.gameLoop = function() {
    Game.update();
    Game.draw();
    Game.updateUI();
    requestAnimationFrame(Game.gameLoop);
};

// === ПОЛНЫЙ СБРОС ===
Game.resetAllAnimations = function() {
    Game.particles.length = 0;
    Game.bullets.length = 0;
    Game.enemyBullets.length = 0;
    Game.enemies.length = 0;
    Game.state.shakeAmount = 0;
    Game.state.invulnerable = 0;
    Game.state.announcementTimer = 0;
    Game.state.waveState = 'IDLE';
    Game.state.currentWave = 0;
};

Game.clearEntities = function() {
    Game.bullets.length = 0;
    Game.enemyBullets.length = 0;
    Game.enemies.length = 0;
    Game.particles.length = 0;
};

Game.startGame = function(mode) {
    const s = Game.state;
    Game.resetAllAnimations();
    
    s.mode = mode;
    s.score = 0;
    s.hp = s.maxHp;
    s.coinsEarned = 0;
    
    if (mode === 'arcade') {
        s.currentState = Game.STATE.ARCADE;
        s.levelWaves = Game.generateEndlessWaves(0);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    } else {
        s.level = Game.playerData.maxLevelUnlocked;
        s.currentState = Game.STATE.CAMPAIGN;
        s.levelWaves = Game.getWavesForLevel(s.level);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    }
    
    Game.resetPlayer();
    Game.hideAllScreens();
    document.body.style.cursor = 'none';
    
    console.log(`Игра начата. Всего волн: ${s.totalWaves}`);
    
    setTimeout(() => {
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            Game.startWave(0);
        }
    }, 1000);
};

Game.startCampaignFromLevel = function(level) {
    const s = Game.state;
    Game.resetAllAnimations();
    
    s.mode = 'campaign';
    s.level = level;
    s.score = 0;
    s.hp = s.maxHp;
    s.coinsEarned = 0;
    s.currentState = Game.STATE.CAMPAIGN;
    
    s.levelWaves = Game.getWavesForLevel(level);
    s.totalWaves = s.levelWaves.length;
    s.currentWave = 0;
    
    Game.resetPlayer();
    Game.hideAllScreens();
    document.body.style.cursor = 'none';
    
    console.log(`Кампания: Уровень ${level}, всего волн: ${s.totalWaves}`);
    
    setTimeout(() => {
        if (s.currentState === Game.STATE.CAMPAIGN) {
            Game.startWave(0);
        }
    }, 1000);
};

Game.nextLevel = function() {
    const next = Math.min(20, Game.state.level + 1);
    Game.playerData.maxLevelUnlocked = Math.max(Game.playerData.maxLevelUnlocked, next);
    Game.savePlayerData();
    Game.startCampaignFromLevel(next);
};