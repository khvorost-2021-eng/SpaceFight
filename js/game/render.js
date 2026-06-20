// ==========================================
// ОТРИСОВКА И ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
// ==========================================

// 🔧 МАСШТАБИРОВАНИЕ ВРЕМЕНИ
// Оригинальная игра работала на 165Hz с requestAnimationFrame
// setInterval(16ms) = 62.5 FPS
// DT = 165 / 62.5 = 2.64 — коэффициент для сохранения скоростей
const FIXED_DT_MS = 16;
const DT = 165 / (1000 / FIXED_DT_MS);  // 2.64
window.DT = DT;  // экспортируем для других модулей

function drawHealerAura(ctx, drone, time) {
    const type = drone.type;
    const color = type.color;
    const healProgress = drone.healTimer / type.healInterval;
    ctx.save();
    const glowPulse = 0.3 + Math.sin(time * 2) * 0.1;
    const gradient = ctx.createRadialGradient(
        drone.x, drone.y, 10,
        drone.x, drone.y, 40
    );
    gradient.addColorStop(0, `rgba(0, 255, 136, ${glowPulse * 0.3})`);
    gradient.addColorStop(0.5, `rgba(0, 255, 136, ${glowPulse * 0.15})`);
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drone.x, drone.y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
        const angle = time * 1.5 + (i * Math.PI * 2 / particleCount);
        const radius = 28 + Math.sin(time * 2 + i) * 3;
        const px = drone.x + Math.cos(angle) * radius;
        const py = drone.y + Math.sin(angle) * radius;
        const alpha = 0.6 + Math.sin(time * 3 + i) * 0.2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(px - 1, py - 4, 2, 8);
        ctx.fillRect(px - 4, py - 1, 8, 2);
    }
    ctx.restore();

    if (healProgress > 0.7) {
        ctx.save();
        const ringAlpha = (healProgress - 0.7) / 0.3;
        const ringRadius = 35;
        ctx.globalAlpha = ringAlpha * 0.8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * ((healProgress - 0.7) / 0.3));
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, ringRadius, startAngle, endAngle);
        ctx.stroke();
        const dotX = drone.x + Math.cos(endAngle) * ringRadius;
        const dotY = drone.y + Math.sin(endAngle) * ringRadius;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

Game.drawDrones = function() {
    const ctx = Game.ctx;
    const time = Date.now() * 0.001;
    Game.drones.forEach(drone => {
        if (!drone.alive) return;
        const img = Game.droneImages[drone.id];
        if (drone.type.healInterval) drawHealerAura(ctx, drone, time);

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

        if (drone.hp < drone.maxHp) {
            ctx.save();
            ctx.globalAlpha = 1.0;
            const w = 30;
            const pct = drone.hp / drone.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(drone.x - w / 2, drone.y - 45, w, 3);
            ctx.fillStyle = pct > 0.5 ? '#0f0' : pct > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(drone.x - w / 2, drone.y - 45, w * pct, 3);
            ctx.restore();
        }
    });
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
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        if (p.isPlus) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.life * Math.PI * 2);
            const size = p.size;
            ctx.fillRect(-size / 4, -size, size / 2, size * 2);
            ctx.fillRect(-size, -size / 4, size * 2, size / 2);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
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
        const isMobile = window.innerWidth <= 768;
        const fontSize = isMobile ? 26 : 48;
        const yPos = isMobile ? 50 : 100;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = isMobile ? 12 : 20;
        ctx.fillText(Game.state.waveAnnouncement, Game.canvas.width / 2, yPos);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    ctx.restore();
};

// === ОБНОВЛЕНИЕ С DT ===
Game.update = function() {
    const s = Game.state;

    // Частицы
    for (let i = Game.particles.length - 1; i >= 0; i--) {
        const p = Game.particles[i];
        p.x += p.vx * DT;
        p.y += p.vy * DT;
        p.vy += 0.1 * DT;
        p.life -= p.decay * DT;
        if (p.life <= 0) Game.particles.splice(i, 1);
    }

    s.shakeAmount *= Math.pow(0.9, DT);
    if (s.shakeAmount < 0.1) s.shakeAmount = 0;

    if (s.announcementTimer > 0) s.announcementTimer -= DT;

    // DYING состояние
    if (s.currentState === Game.STATE.DYING) {
        s.deathAnimationTimer += DT;
        Game.updateEnemies();
        Game.updateDrones();

        Game.stars.forEach(star => {
            star.y += star.speed * DT;
            if (star.y > Game.canvas.height) {
                star.y = 0;
                star.x = Math.random() * Game.canvas.width;
            }
        });

        if (s.deathAnimationTimer >= 60 && s.deathAnimationTimer - DT < 60) {
            const fade = document.getElementById('deathFadeOverlay');
            if (fade) fade.classList.add('active');
        }

        if (s.deathAnimationTimer >= 90 && s.deathAnimationTimer - DT < 90) {
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
        star.y += star.speed * DT;
        if (star.y > Game.canvas.height) {
            star.y = 0;
            star.x = Math.random() * Game.canvas.width;
        }
    });

    // Пули игрока
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const b = Game.bullets[i];
        if (b.vx === undefined) {
            b.y -= 10 * DT;
            if (b.y < -20) {
                Game.bullets.splice(i, 1);
                continue;
            }
        } else {
            b.x += b.vx * DT;
            b.y += b.vy * DT;
            if (b.x < -50 || b.x > Game.canvas.width + 50 ||
                b.y < -50 || b.y > Game.canvas.height + 50) {
                Game.bullets.splice(i, 1);
                continue;
            }
        }
    }

    // Вражеские пули
    for (let i = Game.enemyBullets.length - 1; i >= 0; i--) {
        const b = Game.enemyBullets[i];
        b.x += b.vx * DT;
        b.y += b.vy * DT;
        if (b.x < -50 || b.x > Game.canvas.width + 50 ||
            b.y < -50 || b.y > Game.canvas.height + 50) {
            Game.enemyBullets.splice(i, 1);
        }
    }

    Game.updateEnemies();
    Game.checkWaveComplete();

    // Переход к следующей волне
    if (s.waveState === 'CLEARED') {
        s.waveTimer += DT;
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

    checkBulletEnemyCollisions();
    checkEnemyBulletPlayerCollisions();
    checkEnemyCollisions();
};

// Цикл запускается через setInterval в init.js каждые 16ms
Game.gameLoop = function() {
    Game.update();
    Game.draw();
    Game.updateUI();
};

console.log('✅ game/render.js загружен (DT = ' + DT.toFixed(2) + ')');