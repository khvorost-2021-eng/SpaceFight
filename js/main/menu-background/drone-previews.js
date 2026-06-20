// ==========================================
// СИСТЕМА ПРЕВЬЮ ДРОНОВ В ПРОКАЧКЕ
// ==========================================

window.activeDronePreviews = [];

// === РЕГИСТРАЦИЯ ПРЕВЬЮ ===
window.registerDronePreview = function(canvas, droneId, droneType) {
    const existing = window.activeDronePreviews.find(p => p.canvas === canvas);
    if (existing) {
        existing.droneId = droneId;
        existing.droneType = droneType;
        existing.waypoints = generateWaypoints(canvas.width, canvas.height);
        return existing;
    }

    const preview = {
        canvas, ctx: canvas.getContext('2d'),
        droneId, droneType,

        state: 'patrol',
        stateTimer: 0,
        hoverPhase: 0,

        x: canvas.width / 2, y: canvas.height / 2,
        rotation: -Math.PI / 2, targetRotation: -Math.PI / 2,
        scale: 1.0, targetScale: 1.0,
        shakeAmount: 0,

        waypoints: generateWaypoints(canvas.width, canvas.height),
        currentWaypoint: 0,
        waypointSpeed: 1.8 + Math.random() * 1.2,

        hoverTarget: null,
        hoverOrbitAngle: Math.random() * Math.PI * 2,
        hoverRadius: 70,

        shootTimer: 0,
        bullets: [],
        fakeTargets: generateFakeTargets(canvas),
        currentTarget: null,
        targetSwitchTimer: 0,

        flash: 0,
        particles: [],
        glowIntensity: 0,
        upgradeEffect: null,
        upgradeCenterX: 0,
        upgradeCenterY: 0
    };

    window.activeDronePreviews.push(preview);
    return preview;
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function generateWaypoints(W, H) {
    const points = [];
    const count = 5 + Math.floor(Math.random() * 4);
    const margin = 40;
    for (let i = 0; i < count; i++) {
        points.push({
            x: margin + Math.random() * (W - margin * 2),
            y: margin + Math.random() * (H - margin * 2)
        });
    }
    return points;
}

function generateFakeTargets(canvas) {
    const targets = [];
    const W = canvas.width, H = canvas.height;
    const margin = 20;
    for (let i = 0; i < 5; i++) {
        targets.push({
            x: margin + Math.random() * (W - margin * 2),
            y: margin + Math.random() * (H - margin * 2),
            life: Math.random() * 100 + 50
        });
    }
    return targets;
}

window.unregisterDronePreview = function(canvas) {
    window.activeDronePreviews = window.activeDronePreviews.filter(p => p.canvas !== canvas);
};

window.clearAllDronePreviews = function() {
    window.activeDronePreviews = [];
};

// === HOVER: подлёт к кнопке ===
window.setDronePreviewHover = function(canvas, targetX, targetY) {
    const preview = window.activeDronePreviews.find(p => p.canvas === canvas);
    if (preview && preview.state !== 'upgrade') {
        preview.state = 'hover';
        preview.stateTimer = 0;
        preview.hoverPhase = 0;
        preview.hoverTarget = { x: targetX, y: targetY };
        preview.hoverOrbitAngle = Math.random() * Math.PI * 2;
        preview.hoverRadius = 70;
    }
};

window.clearDronePreviewHover = function(canvas) {
    const preview = window.activeDronePreviews.find(p => p.canvas === canvas);
    if (preview && preview.state === 'hover') {
        preview.state = 'patrol';
        preview.stateTimer = 0;
        preview.hoverTarget = null;
    }
};

// === UPGRADE: быстрая анимация улучшения ===
window.triggerDronePreviewUpgrade = function(canvas, upgradeType) {
    const preview = window.activeDronePreviews.find(p => p.canvas === canvas);
    if (!preview) return;

    preview.state = 'upgrade';
    preview.stateTimer = 0;
    preview.flash = 1.0;
    preview.glowIntensity = 1.0;

    preview.upgradeCenterX = preview.canvas.width / 2;
    preview.upgradeCenterY = preview.canvas.height / 2;

    preview.upgradeEffect = {
        type: upgradeType || 'hp',
        timer: 0,
        phase: 0
    };

    playUpgradeSound();
};

// === ЗВУК УЛУЧШЕНИЯ ===
function playUpgradeSound() {
    if (!Game.audioCtx) {
        if (typeof Game.initAudio === 'function') Game.initAudio();
        if (!Game.audioCtx) return;
    }
    try {
        const now = Game.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const osc = Game.audioCtx.createOscillator();
            const gain = Game.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = now + i * 0.07;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            osc.connect(gain);
            gain.connect(Game.masterGain || Game.audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });

        const shimmer = Game.audioCtx.createOscillator();
        const shimmerGain = Game.audioCtx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.value = 2000;
        shimmerGain.gain.setValueAtTime(0, now + 0.2);
        shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.25);
        shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(Game.masterGain || Game.audioCtx.destination);
        shimmer.start(now + 0.2);
        shimmer.stop(now + 0.5);
    } catch (e) {}
}

// === ГЛАВНОЕ ОБНОВЛЕНИЕ ПРЕВЬЮ ===
function updateDronePreviews() {
    window.activeDronePreviews.forEach(preview => {
        const ctx = preview.ctx;
        if (!ctx) return;
        const W = preview.canvas.width, H = preview.canvas.height;
        const time = Date.now() * 0.001;

        ctx.clearRect(0, 0, W, H);

        const upgrades = (Game.playerData.upgrades && Game.playerData.upgrades.drones && Game.playerData.upgrades.drones[preview.droneId]) || {};
        const fireRateLevel = upgrades.fireRate || 0;
        const speedMult = 1 + fireRateLevel * 0.25;

        preview.stateTimer++;

        if (preview.state === 'patrol') {
            updatePatrolState(preview, W, H, speedMult, time);
        } else if (preview.state === 'hover') {
            updateHoverState(preview, time);
        } else if (preview.state === 'upgrade') {
            updateUpgradeState(preview, W, H, time);
        }

        const rotDiff = preview.targetRotation - preview.rotation;
        const normalizedRotDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
        preview.rotation += normalizedRotDiff * 0.15;

        preview.scale += (preview.targetScale - preview.scale) * 0.1;
        preview.shakeAmount *= 0.85;
        if (preview.shakeAmount < 0.5) preview.shakeAmount = 0;

        updateShooting(preview, W, H, fireRateLevel);
        drawPreviewScene(ctx, preview, W, H, time);
    });
}

// 🔧 PATROL: БЕСКОНЕЧНЫЙ полёт с жёсткими границами
function updatePatrolState(preview, W, H, speedMult, time) {
    // 🔧 СТРАХОВКА 1: Гарантируем наличие waypoints
    if (!preview.waypoints || preview.waypoints.length === 0) {
        preview.waypoints = generateWaypoints(W, H);
        preview.currentWaypoint = 0;
    }

    // 🔧 СТРАХОВКА 2: currentWaypoint не должен выходить за пределы
    if (preview.currentWaypoint >= preview.waypoints.length) {
        preview.currentWaypoint = 0;
    }

    const target = preview.waypoints[preview.currentWaypoint];
    const dx = target.x - preview.x;
    const dy = target.y - preview.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = preview.waypointSpeed * speedMult * 0.6;

    // Покачивание перпендикулярно движению
    const perpX = -dy / (dist || 1);
    const perpY = dx / (dist || 1);
    const wobble = Math.sin(time * 3 + preview.currentWaypoint) * 15;

    const moveX = (dx / (dist || 1)) * speed + perpX * wobble * 0.05;
    const moveY = (dy / (dist || 1)) * speed + perpY * wobble * 0.05;

    preview.x += moveX;
    preview.y += moveY;

    // Поворот по направлению движения
    preview.targetRotation = Math.atan2(dy, dx) + Math.PI / 2;

    // Переключение цели для стрельбы
    preview.targetSwitchTimer++;
    if (!preview.currentTarget || preview.targetSwitchTimer > 60) {
        preview.currentTarget = preview.fakeTargets[Math.floor(Math.random() * preview.fakeTargets.length)];
        preview.targetSwitchTimer = 0;
    }

    // Достигли waypoint — переключаем на следующий
    if (dist < 25) {
        preview.currentWaypoint = (preview.currentWaypoint + 1) % preview.waypoints.length;
        // Периодически регенерируем waypoints для разнообразия
        if (Math.random() < 0.15) {
            preview.waypoints = generateWaypoints(W, H);
            preview.currentWaypoint = 0;
        }
    }

    // 🔧 ЖЁСТКОЕ ОГРАНИЧЕНИЕ: дрон ВСЕГДА остаётся в пределах canvas
    const margin = 40;
    
    if (preview.x < margin) {
        preview.x = margin + 5;
        preview.currentWaypoint = (preview.currentWaypoint + 1) % preview.waypoints.length;
    }
    if (preview.x > W - margin) {
        preview.x = W - margin - 5;
        preview.currentWaypoint = (preview.currentWaypoint + 1) % preview.waypoints.length;
    }
    if (preview.y < margin) {
        preview.y = margin + 5;
        preview.currentWaypoint = (preview.currentWaypoint + 1) % preview.waypoints.length;
    }
    if (preview.y > H - margin) {
        preview.y = H - margin - 5;
        preview.currentWaypoint = (preview.currentWaypoint + 1) % preview.waypoints.length;
    }

    // 🔧 СТРАХОВКА 3: если дрон всё равно застрял — полная регенерация
    if (preview.x < 10 || preview.x > W - 10 || preview.y < 10 || preview.y > H - 10) {
        preview.waypoints = generateWaypoints(W, H);
        preview.currentWaypoint = 0;
        preview.x = W / 2;
        preview.y = H / 2;
    }
}

// === HOVER: разнообразное поведение ===
function updateHoverState(preview, time) {
    if (!preview.hoverTarget) {
        preview.state = 'patrol';
        return;
    }

    const t = preview.stateTimer;
    const phase = Math.floor(t / 60) % 5;
    preview.hoverPhase = phase;

    let targetX, targetY;

    if (phase === 0) {
        preview.hoverOrbitAngle += 0.08;
        preview.hoverRadius = 50;
        targetX = preview.hoverTarget.x + Math.cos(preview.hoverOrbitAngle) * preview.hoverRadius;
        targetY = preview.hoverTarget.y + Math.sin(preview.hoverOrbitAngle) * preview.hoverRadius;
    } else if (phase === 1) {
        preview.hoverOrbitAngle += 0.01;
        preview.hoverRadius = 35;
        targetX = preview.hoverTarget.x + Math.cos(preview.hoverOrbitAngle) * preview.hoverRadius;
        targetY = preview.hoverTarget.y + Math.sin(preview.hoverOrbitAngle) * preview.hoverRadius;
    } else if (phase === 2) {
        preview.hoverOrbitAngle += 0.05;
        preview.hoverRadius = 90;
        targetX = preview.hoverTarget.x + Math.cos(preview.hoverOrbitAngle) * preview.hoverRadius;
        targetY = preview.hoverTarget.y + Math.sin(preview.hoverOrbitAngle) * preview.hoverRadius;
    } else if (phase === 3) {
        preview.hoverOrbitAngle += 0.12;
        const wobbleRadius = 60 + Math.sin(time * 2) * 20;
        preview.hoverRadius = wobbleRadius;
        targetX = preview.hoverTarget.x + Math.cos(preview.hoverOrbitAngle) * wobbleRadius;
        targetY = preview.hoverTarget.y + Math.sin(preview.hoverOrbitAngle) * wobbleRadius;
    } else {
        preview.hoverOrbitAngle += 0.02;
        const vibration = Math.sin(time * 15) * 3;
        preview.hoverRadius = 30;
        targetX = preview.hoverTarget.x + Math.cos(preview.hoverOrbitAngle) * preview.hoverRadius + vibration;
        targetY = preview.hoverTarget.y + Math.sin(preview.hoverOrbitAngle) * preview.hoverRadius;
    }

    const followSpeed = phase === 1 ? 0.08 : 0.15;
    preview.x += (targetX - preview.x) * followSpeed;
    preview.y += (targetY - preview.y) * followSpeed;

    if (phase === 1 || phase === 4) {
        const dx = preview.hoverTarget.x - preview.x;
        const dy = preview.hoverTarget.y - preview.y;
        preview.targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
    } else {
        const dxM = targetX - preview.x;
        const dyM = targetY - preview.y;
        if (Math.abs(dxM) > 1 || Math.abs(dyM) > 1) {
            preview.targetRotation = Math.atan2(dyM, dxM) + Math.PI / 2;
        }
    }
}

// 🔧 UPGRADE: БЫСТРАЯ анимация (1.5 секунды = 45 кадров)
function updateUpgradeState(preview, W, H, time) {
    const t = preview.stateTimer;
    const cx = preview.upgradeCenterX;
    const cy = preview.upgradeCenterY;

    if (t < 10) {
        // ФАЗА 1 (0-10 кадров = 0.33 сек): быстрый подлёт в центр
        preview.x += (cx - preview.x) * 0.25;
        preview.y += (cy - preview.y) * 0.25;
        preview.targetRotation = -Math.PI / 2;
        preview.targetScale = 1.0;

    } else if (t < 25) {
        // ФАЗА 2 (10-25 кадров = 0.5 сек): ВСПЫШКА + scale-up + тряска
        preview.x = cx + (Math.random() - 0.5) * preview.shakeAmount;
        preview.y = cy + (Math.random() - 0.5) * preview.shakeAmount;
        preview.targetScale = 2.5;
        preview.shakeAmount = 10;

        // Вспышка и частицы в начале фазы
        if (t === 12) {
            preview.flash = 1.0;
            spawnUpgradeParticles(preview, 40);
        }

    } else if (t < 45) {
        // ФАЗА 3 (25-45 кадров = 0.67 сек): короткий специфичный эффект
        preview.x = cx;
        preview.y = cy;
        preview.targetScale = 2.5;
        preview.shakeAmount = 2;

        if (preview.upgradeEffect) {
            preview.upgradeEffect.timer++;
            updateUpgradeEffect(preview, time);
        }

    } else {
        // ФАЗА 4 (45+ кадров): немедленный возврат к патрулю
        preview.state = 'patrol';
        preview.stateTimer = 0;
        preview.upgradeEffect = null;
        preview.targetScale = 1.0;
        preview.waypoints = generateWaypoints(preview.canvas.width, preview.canvas.height);
        preview.currentWaypoint = 0;
    }

    preview.glowIntensity *= 0.97;
}

// === СПЕЦИФИЧНЫЕ ЭФФЕКТЫ ПО ТИПУ УЛУЧШЕНИЯ ===
function updateUpgradeEffect(preview, time) {
    if (!preview.upgradeEffect) return;
    const t = preview.upgradeEffect.timer;
    const type = preview.upgradeEffect.type;

    if (type === 'hp') {
        if (t % 15 === 0 && t < 90) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 1.5 + 1;
                preview.particles.push({
                    x: preview.x, y: preview.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    life: 1, decay: 0.015,
                    size: Math.random() * 6 + 4,
                    color: '#ff3366',
                    isHeart: true
                });
            }
        }
        preview.glowIntensity = 0.5 + Math.sin(t * 0.3) * 0.3;
    } else if (type === 'damage') {
        if (t % 8 === 0 && t < 90) {
            for (let side = -1; side <= 1; side += 2) {
                const gunX = preview.x + Math.cos(preview.rotation + Math.PI/2 * side) * 20;
                const gunY = preview.y + Math.sin(preview.rotation + Math.PI/2 * side) * 20;
                for (let i = 0; i < 4; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3 + 2;
                    preview.particles.push({
                        x: gunX, y: gunY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 0.8, decay: 0.03,
                        size: Math.random() * 2 + 1,
                        color: '#ffaa00',
                        isSpark: true
                    });
                }
            }
        }
    } else if (type === 'fireRate') {
        if (t % 12 === 0 && t < 90) {
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 30 + Math.random() * 20;
                preview.particles.push({
                    x: preview.x + Math.cos(angle) * dist,
                    y: preview.y + Math.sin(angle) * dist,
                    vx: 0, vy: 0,
                    life: 1, decay: 0.04,
                    size: 3,
                    color: '#ffff00',
                    isLightning: true,
                    angle: angle
                });
            }
        }
    } else if (type === 'healInterval') {
        if (t % 20 === 0 && t < 90) {
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 1 + 0.5;
                preview.particles.push({
                    x: preview.x, y: preview.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    life: 1, decay: 0.015,
                    size: 5,
                    color: '#00ff88',
                    isPlus: true
                });
            }
        }
        preview.glowIntensity = 0.4 + Math.sin(t * 0.4) * 0.3;
    }
}

function spawnUpgradeParticles(preview, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        preview.particles.push({
            x: preview.x, y: preview.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1, decay: 0.015 + Math.random() * 0.01,
            size: Math.random() * 4 + 2,
            color: preview.droneType.color || '#0ff',
            isUpgrade: true
        });
    }
    for (let i = 0; i < 3; i++) {
        preview.particles.push({
            x: preview.x, y: preview.y, vx: 0, vy: 0,
            life: 1, decay: 0.02, size: 10 + i * 15,
            color: preview.droneType.color || '#0ff',
            isRing: true, ringDelay: i * 0.1
        });
    }
}

// === СТРЕЛЬБА ИЗ НОСА ===
function updateShooting(preview, W, H, fireRateLevel) {
    if (preview.state === 'upgrade') return;
    if (preview.droneType.healInterval) return;

    const shootInterval = Math.max(20, 60 - fireRateLevel * 10);
    preview.shootTimer++;

    if (preview.shootTimer >= shootInterval && preview.currentTarget && preview.state === 'patrol') {
        preview.shootTimer = 0;

        // 🔧 ПРАВИЛЬНАЯ ФОРМУЛА ДЛЯ НОСА ДРОНА
        // rotation = 0 когда дрон смотрит вверх
        // rotation = PI/2 когда смотрит вправо
        // rotation = -PI/2 когда смотрит влево
        const noseOffset = 25;
        
        // Вычисляем позицию носа относительно центра дрона
        const noseX = preview.x + Math.sin(preview.rotation) * noseOffset;
        const noseY = preview.y - Math.cos(preview.rotation) * noseOffset;

        // Направление к цели
        const dx = preview.currentTarget.x - preview.x;
        const dy = preview.currentTarget.y - preview.y;
        const angle = Math.atan2(dy, dx);
        const bulletSpeed = 5;

        preview.bullets.push({
            x: noseX,      // 🔧 ИЗ НОСА
            y: noseY,      // 🔧 ИЗ НОСА
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed,
            rotation: angle + Math.PI / 2,
            life: 1,
            color: preview.droneType.color || '#0ff'
        });
    }

    // Обновление пуль
    for (let i = preview.bullets.length - 1; i >= 0; i--) {
        const b = preview.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life -= 0.02;

        if (b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) {
            // Вспышка при попадании в границу
            if (b.x >= 0 && b.x <= W && b.y >= 0 && b.y <= H) {
                for (let j = 0; j < 4; j++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 1.5 + 0.5;
                    preview.particles.push({
                        x: b.x, y: b.y,
                        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                        life: 0.6, decay: 0.05,
                        size: Math.random() * 2 + 1, color: b.color
                    });
                }
            }
            preview.bullets.splice(i, 1);
        }
    }
}

// === ОТРИСОВКА СЦЕНЫ ===
function drawPreviewScene(ctx, preview, W, H, time) {
    // Аура хилера
    if (preview.droneType.healInterval && preview.state !== 'upgrade') {
        ctx.save();
        const pulseSize = 30 + Math.sin(time * 3) * 6;
        const gradient = ctx.createRadialGradient(preview.x, preview.y, 0, preview.x, preview.y, pulseSize);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(preview.x, preview.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Upgrade glow
    if (preview.glowIntensity > 0.05) {
        ctx.save();
        const glowSize = 60 * preview.scale;
        const gradient = ctx.createRadialGradient(preview.x, preview.y, 0, preview.x, preview.y, glowSize);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${preview.glowIntensity * 0.6})`);
        gradient.addColorStop(0.5, hexToRGBA(preview.droneType.color || '#0ff', preview.glowIntensity * 0.4));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(preview.x, preview.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Пули
    preview.bullets.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.globalAlpha = Math.min(1, b.life * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-2, -6, 4, 12);
        ctx.restore();
    });

    // Дрон
    const img = Game.droneImages && Game.droneImages[preview.droneId];
    ctx.save();
    ctx.translate(
        preview.x + (Math.random() - 0.5) * preview.shakeAmount,
        preview.y + (Math.random() - 0.5) * preview.shakeAmount
    );
    ctx.rotate(preview.rotation);
    ctx.scale(preview.scale, preview.scale);

    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -25, -30, 50, 60);
    } else {
        ctx.fillStyle = preview.droneType.color || '#0ff';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(13, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-13, 0);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Вспышка
    if (preview.flash > 0) {
        ctx.save();
        ctx.globalAlpha = preview.flash * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        preview.flash -= 0.05;
        if (preview.flash < 0) preview.flash = 0;
    }

    // Сердечко при HP upgrade
    if (preview.upgradeEffect && preview.upgradeEffect.type === 'hp') {
        drawHeartAura(ctx, preview, time);
    }

    // Частицы
    drawParticles(ctx, preview);
}

function drawHeartAura(ctx, preview, time) {
    if (!preview.upgradeEffect) return;
    const t = preview.upgradeEffect.timer;
    const alpha = Math.max(0, 1 - t / 110);
    const heartScale = 1 + Math.sin(t * 0.2) * 0.15;

    ctx.save();
    ctx.translate(preview.x, preview.y - 60);
    ctx.scale(heartScale * 1.5, heartScale * 1.5);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(0, 0, -10, -5, -10, -10);
    ctx.bezierCurveTo(-10, -15, -5, -18, 0, -13);
    ctx.bezierCurveTo(5, -18, 10, -15, 10, -10);
    ctx.bezierCurveTo(10, -5, 0, 0, 0, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('+1', 0, 25);

    ctx.restore();
}

function drawParticles(ctx, preview) {
    for (let i = preview.particles.length - 1; i >= 0; i--) {
        const p = preview.particles[i];

        if (p.isRing) {
            if (p.ringDelay > 0) { p.ringDelay -= 0.016; continue; }
            p.size += 2;
            p.life -= p.decay;
            ctx.save();
            ctx.globalAlpha = p.life * 0.8;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (p.isHeart) {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.97; p.vy *= 0.97;
            p.life -= p.decay;
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.scale(p.size / 6, p.size / 6);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.bezierCurveTo(0, 0, -10, -5, -10, -10);
            ctx.bezierCurveTo(-10, -15, -5, -18, 0, -13);
            ctx.bezierCurveTo(5, -18, 10, -15, 10, -10);
            ctx.bezierCurveTo(10, -5, 0, 0, 0, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (p.isLightning) {
            p.life -= p.decay;
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            let lx = p.x, ly = p.y;
            ctx.moveTo(lx, ly);
            const dx = preview.x - lx;
            const dy = preview.y - ly;
            const steps = 4;
            for (let s = 1; s <= steps; s++) {
                const t = s / steps;
                const ox = (Math.random() - 0.5) * 10 * (1 - t);
                const oy = (Math.random() - 0.5) * 10 * (1 - t);
                ctx.lineTo(lx + dx * t + ox, ly + dy * t + oy);
            }
            ctx.stroke();
            ctx.restore();
        } else if (p.isPlus) {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.97; p.vy *= 0.97;
            p.life -= p.decay;
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.translate(p.x, p.y);
            ctx.fillRect(-p.size/4, -p.size, p.size/2, p.size * 2);
            ctx.fillRect(-p.size, -p.size/4, p.size * 2, p.size/2);
            ctx.restore();
        } else {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.95; p.vy *= 0.95;
            p.life -= p.decay;
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (p.life <= 0) preview.particles.splice(i, 1);
    }
}

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

console.log('✅ menu-background/drone-previews.js загружен');