// ==========================================
// СИСТЕМА ЧАСТИЦ И ВЗРЫВОВ
// ==========================================

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

// Частицы лечения (летят от дрона к игроку)
function spawnHealParticles(fromX, fromY, toX, toY) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const delay = i * 40;
        
        setTimeout(() => {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const spread = (Math.random() - 0.5) * 0.5;
            const speed = 4 + Math.random() * 2;
            
            Game.particles.push({
                x: fromX + (Math.random() - 0.5) * 10,
                y: fromY + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                size: 4 + Math.random() * 2,
                life: 1,
                decay: 0.025,
                color: '#00ff88',
                isHealParticle: true,
                isPlus: true
            });
        }, delay);
    }
}