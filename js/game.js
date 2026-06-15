Game.createExplosion = function(x, y, isPlayer) {
    isPlayer = isPlayer || false;
    const count = isPlayer ? 80 : 25;
    const size = isPlayer ? 8 : 3;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isPlayer ? 10 : 5) + 2;
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
        Game.state.shakeAmount = 25;
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

// === ЛОГИКА ДРОНОВ ===
Game.updateDrones = function() {
    const player = Game.player;
    
    Game.drones.forEach(drone => {
        if (!drone.alive) return;
        
        const type = drone.type;
        
        drone.orbitAngle += type.orbitSpeed;
        const targetX = player.x + Math.cos(drone.orbitAngle) * type.orbitRadius;
        const targetY = player.y + Math.sin(drone.orbitAngle) * type.orbitRadius;
        
        drone.x += (targetX - drone.x) * 0.15;
        drone.y += (targetY - drone.y) * 0.15;
        
        if (type.priority !== 'none') {
            const target = findDroneTarget(drone);
            if (target) {
                const dx = target.x - drone.x;
                const dy = target.y - drone.y;
                const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
                const diff = targetAngle - drone.rotation;
                const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
                drone.rotation += normalized * 0.15;
            }
        } else {
            const dx = player.x - drone.x;
            const dy = player.y - drone.y;
            const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const diff = targetAngle - drone.rotation;
            const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
            drone.rotation += normalized * 0.1;
        }
        
        if (type.fireRate > 0) {
            drone.shootTimer++;
            if (drone.shootTimer >= type.fireRate) {
                const target = findDroneTarget(drone);
                if (target) {
                    droneShoot(drone, target);
                    drone.shootTimer = 0;
                }
            }
        }
        
        if (type.healInterval) {
            drone.healTimer++;
            if (drone.healTimer >= type.healInterval) {
                if (Game.state.hp < Game.state.maxHp) {
                    Game.healPlayer(type.healAmount);
                    drone.healTimer = 0;
                }
            }
        }
        
        if (drone.damageFlash > 0) {
            drone.damageFlash--;
        }
    });
};

function findDroneTarget(drone) {
    const enemies = Game.enemies;
    if (enemies.length === 0) return null;
    
    const type = drone.type;
    
    if (type.priority === 'fast') {
        const fastEnemies = enemies.filter(e => e.type === 'fast');
        if (fastEnemies.length > 0) {
            return findClosest(drone, fastEnemies);
        }
    }
    
    return findClosest(drone, enemies);
}

function findClosest(from, targets) {
    let closest = null;
    let closestDist = Infinity;
    
    targets.forEach(t => {
        const dx = t.x - from.x;
        const dy = t.y - from.y;
        const dist = dx * dx + dy * dy;
        if (dist < closestDist) {
            closestDist = dist;
            closest = t;
        }
    });
    
    return closest;
}

function droneShoot(drone, target) {
    const type = drone.type;
    
    // Проверка точности — шанс промаха
    if (Math.random() > type.accuracy) {
        const dx = target.x - drone.x;
        const dy = target.y - drone.y;
        const baseAngle = Math.atan2(dy, dx);
        const missAngle = baseAngle + (Math.random() - 0.5) * 2.5;
        
        Game.playDroneShootSound();
        Game.bullets.push({
            x: drone.x,
            y: drone.y,
            vx: Math.cos(missAngle) * type.bulletSpeed,
            vy: Math.sin(missAngle) * type.bulletSpeed,
            width: 4, height: 12,
            damage: type.damage,
            isDrone: true,
            droneColor: type.color
        });
        return;
    }
    
    const dx = target.x - drone.x;
    const dy = target.y - drone.y;
    const angle = Math.atan2(dy, dx);
    
    Game.playDroneShootSound();
    
    if (type.volley && type.volley > 1) {
        const spread = 0.25;
        for (let i = 0; i < type.volley; i++) {
            const offset = (i - (type.volley - 1) / 2) * spread / type.volley;
            const a = angle + offset;
            Game.bullets.push({
                x: drone.x,
                y: drone.y,
                vx: Math.cos(a) * type.bulletSpeed,
                vy: Math.sin(a) * type.bulletSpeed,
                width: 4, height: 12,
                damage: type.damage,
                isDrone: true,
                droneColor: type.color
            });
        }
    } else {
        Game.bullets.push({
            x: drone.x,
            y: drone.y,
            vx: Math.cos(angle) * type.bulletSpeed,
            vy: Math.sin(angle) * type.bulletSpeed,
            width: 4, height: 12,
            damage: type.damage,
            isDrone: true,
            droneColor: type.color
        });
    }
}

// === ИСПРАВЛЕННАЯ ОТРИСОВКА ДРОНОВ (без зелёных кругов) ===
Game.drawDrones = function() {
    const ctx = Game.ctx;
    
    Game.drones.forEach(drone => {
        if (!drone.alive) return;
        
        const img = Game.droneImages[drone.id];
        
        // === 1. СПРАЙТ (отдельный save/restore) ===
        ctx.save();
        ctx.translate(drone.x, drone.y);
        ctx.rotate(drone.rotation);
        
        if (drone.damageFlash > 0 && Math.floor(drone.damageFlash / 3) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 1.0;
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, -30, -35, 60, 70);
        } else {
            // Fallback: ромб цвета дрона
            ctx.fillStyle = drone.type.color || '#00ffff';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(15, 0);
            ctx.lineTo(0, 20);
            ctx.lineTo(-15, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // === 2. HP-бар (отдельный save/restore) ===
        if (drone.hp < drone.maxHp) {
            ctx.save();
            ctx.globalAlpha = 1.0;
            const w = 30;
            const pct = drone.hp / drone.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(drone.x - w/2, drone.y - 45, w, 3);
            ctx.fillStyle = pct > 0.5 ? '#0f0' : pct > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(drone.x - w/2, drone.y - 45, w * pct, 3);
            ctx.restore();
        }
        
        // === 3. Пульсар хилера (отдельный save/restore) ===
        if (drone.type.healInterval && drone.healTimer > drone.type.healInterval * 0.8) {
            ctx.save();
            const pulseAlpha = Math.min(0.4, 
                (drone.healTimer - drone.type.healInterval * 0.8) / (drone.type.healInterval * 0.2) * 0.4
            );
            ctx.globalAlpha = pulseAlpha;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(drone.x, drone.y, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
};

// === ГЛАВНЫЙ UPDATE ===
Game.update = function() {
    const s = Game.state;
    
    for (let i = Game.particles.length - 1; i >= 0; i--) {
        const p = Game.particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1;
        p.life -= p.decay;
        if (p.life <= 0) Game.particles.splice(i, 1);
    }
    s.shakeAmount *= 0.9;
    if (s.shakeAmount < 0.1) s.shakeAmount = 0;
    
    if (s.announcementTimer > 0) s.announcementTimer--;
    
    // === DYING ===
    if (s.currentState === Game.STATE.DYING) {
        s.deathAnimationTimer++;
        Game.updateEnemies();
        Game.updateDrones();
        
        Game.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > Game.canvas.height) {
                star.y = 0;
                star.x = Math.random() * Game.canvas.width;
            }
        });
        
        if (s.deathAnimationTimer === 60) {
            const fade = document.getElementById('deathFadeOverlay');
            if (fade) fade.classList.add('active');
        }
        
        if (s.deathAnimationTimer === 90) {
            const text = document.getElementById('gameOverText');
            if (text) {
                text.textContent = LANG.gameOver;
                text.classList.remove('hidden');
                text.classList.remove('fade-out');
                text.offsetHeight;
                text.classList.add('active');
            }
        }
        
        if (s.deathAnimationTimer >= s.deathAnimationDuration) {
            s.currentState = Game.STATE.GAME_OVER;
            Game.showDeathScreen();
        }
        
        return;
    }
    
    if (s.currentState !== Game.STATE.ARCADE && s.currentState !== Game.STATE.CAMPAIGN) {
        return;
    }
    
    Game.updatePlayer();
    Game.updateDrones();
    
    Game.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > Game.canvas.height) {
            star.y = 0;
            star.x = Math.random() * Game.canvas.width;
        }
    });
    
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const b = Game.bullets[i];
        if (b.vx === undefined) {
            b.y -= 10;
            if (b.y < -20) {
                Game.bullets.splice(i, 1);
                continue;
            }
        } else {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < -50 || b.x > Game.canvas.width + 50 ||
                b.y < -50 || b.y > Game.canvas.height + 50) {
                Game.bullets.splice(i, 1);
                continue;
            }
        }
    }
    
    Game.updateEnemies();
    Game.checkWaveComplete();
    
    if (s.waveState === 'CLEARED') {
        s.waveTimer++;
        if (s.waveTimer > 120) {
            const nextWaveIndex = s.currentWave;
            if (nextWaveIndex >= s.totalWaves) {
                if (s.mode === 'campaign') {
                    Game.levelComplete();
                } else {
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
    
    // Коллизии пуль с врагами
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
    
    // Коллизии вражеских пуль с игроком и дронами
    if (s.invulnerable <= 0) {
        for (let bIndex = Game.enemyBullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = Game.enemyBullets[bIndex];
            let hitSomething = false;
            
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
    
    // Коллизии врагов с игроком и дронами
    for (let eIndex = Game.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = Game.enemies[eIndex];
        
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
};

Game.generateEndlessWaves = function(currentScore) {
    const diffLevel = Math.floor(currentScore / 30) + 4;
    return Game.generateWavesForLevel(diffLevel);
};

Game.levelComplete = function() {
    const s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;
    s.coinsEarned = s.score * 2;
    Game.playerData.coins += s.coinsEarned;
    
    const levelBonusXP = s.level * 50;
    s.xpEarned = (s.xpEarned || 0) + levelBonusXP;
    Game.addXP(levelBonusXP);
    
    if (!Game.playerData.levelsCompleted.includes(s.level)) {
        Game.playerData.levelsCompleted.push(s.level);
    }
    if (s.level >= Game.playerData.maxLevelUnlocked) {
        Game.playerData.maxLevelUnlocked = Math.min(20, s.level + 1);
    }
    
    // Обновляем лучший счёт
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }
    Game.savePlayerData();
    Game.showLevelCompleteScreen();
};

Game.gameOver = function() {
    const s = Game.state;
    s.currentState = Game.STATE.DYING;
    s.deathAnimationTimer = 0;
    s.isPlayerDead = true;
    Game.player.visible = false;
    
    Game.createExplosion(Game.player.x, Game.player.y, true);
    Game.playPlayerExplosionSound();
    s.shakeAmount = 25;
    
    s.coinsEarned = s.mode === 'arcade' ? Math.floor(s.score / 2) : Math.floor(s.score * 1.5);
    Game.playerData.coins += s.coinsEarned;
    
    // Обновляем лучший счёт
    if (s.score > (Game.playerData.totalScore || 0)) {
        Game.playerData.totalScore = s.score;
    }
    Game.savePlayerData();
    
    if (s.mode === 'arcade') Game.submitLeaderboardScore(s.score);
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
        ctx.save();
        if (bullet.vx !== undefined) {
            const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(angle);
            ctx.fillStyle = bullet.droneColor || '#ff00ff';
            ctx.shadowColor = bullet.droneColor || '#ff00ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(-2, -6, 4, 12);
        } else {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.fillRect(bullet.x - 2, bullet.y - 6, 4, 12);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
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
    
    Game.drawDrones();
    
    Game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    const showPlayer = (Game.state.currentState === Game.STATE.ARCADE || 
                        Game.state.currentState === Game.STATE.CAMPAIGN) &&
                       Game.player.visible;
    if (showPlayer) {
        Game.drawPlayer(Game.player.x, Game.player.y, Game.player.rotation, Game.player.flameOffset);
    }
    
    if (Game.state.announcementTimer > 0 && 
        (Game.state.currentState === Game.STATE.ARCADE || 
         Game.state.currentState === Game.STATE.CAMPAIGN ||
         Game.state.currentState === Game.STATE.DYING)) {
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

Game.resetWorld = function() {
    Game.particles.length = 0;
    Game.bullets.length = 0;
    Game.enemyBullets.length = 0;
    Game.enemies.length = 0;
    Game.drones.length = 0;
    Game.state.shakeAmount = 0;
    Game.state.invulnerable = 0;
    Game.state.announcementTimer = 0;
    Game.state.waveState = 'IDLE';
    Game.state.currentWave = 0;
    Game.state.deathAnimationTimer = 0;
    Game.state.isPlayerDead = false;
    Game.player.visible = true;
    Game.hideDeathOverlays();
};

Game.resetAllAnimations = function() {
    Game.resetWorld();
};

// === СТАРТ ИГРЫ (ИСПОЛЬЗУЕТ ТОЛЬКО ВЫБРАННЫХ ДРОНОВ) ===
function actuallyStartGame(mode, level) {
    const s = Game.state;
    
    Game.resetAllAnimations();
    Game.initAudio();
    
    // НЕ делаем автоматический выбор — используем то, что игрок выбрал в Снаряжении
    
    s.mode = mode;
    s.score = 0;
    s.hp = s.maxHp;
    s.coinsEarned = 0;
    s.xpEarned = 0;
    
    if (mode === 'arcade') {
        s.currentState = Game.STATE.ARCADE;
        s.levelWaves = Game.generateEndlessWaves(0);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    } else {
        s.level = level || Game.playerData.maxLevelUnlocked;
        s.currentState = Game.STATE.CAMPAIGN;
        s.levelWaves = Game.getWavesForLevel(s.level);
        s.totalWaves = s.levelWaves.length;
        s.currentWave = 0;
    }
    
    Game.resetPlayer();
    Game.spawnDrones(); // Берёт только selectedDrones
    Game.hideAllScreens();
    document.body.style.cursor = 'none';
    
    console.log(`Игра начата. Волн: ${s.totalWaves}, Дронов: ${Game.drones.length}`);
    
    setTimeout(() => {
        if (s.currentState === Game.STATE.ARCADE || s.currentState === Game.STATE.CAMPAIGN) {
            Game.startWave(0);
        }
    }, 1000);
}

Game.startGame = function(mode) {
    actuallyStartGame(mode);
};

Game.startCampaignFromLevel = function(level) {
    actuallyStartGame('campaign', level);
};

Game.nextLevel = function() {
    const next = Math.min(20, Game.state.level + 1);
    Game.playerData.maxLevelUnlocked = Math.max(Game.playerData.maxLevelUnlocked, next);
    Game.savePlayerData();
    Game.startCampaignFromLevel(next);
};