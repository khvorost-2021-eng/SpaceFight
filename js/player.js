Game.drawPlayer = function(x, y, rotation, flameOffset) {
    const ctx = Game.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    if (Game.state.invulnerable > 0 && Math.floor(Game.state.invulnerable * 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    if (Game.ships.player) {
        const scale = 1.4;
        const w = 60 * scale;
        const h = 70 * scale;
        ctx.drawImage(Game.ships.player, -w/2, -h/2, w, h);
    }
    
    const neonColor = '#88ccff';
    for (let i = -1; i <= 1; i += 2) {
        const engineX = i * 2;
        const engineY = 20;
        const flameLength = 10 + flameOffset * 6;
        
        const flameGradient = ctx.createLinearGradient(engineX, engineY + 8, engineX, engineY + 8 + flameLength);
        flameGradient.addColorStop(0, neonColor);
        flameGradient.addColorStop(0.3, '#ff8800');
        flameGradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
        
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(engineX - 1.5, engineY + 8);
        ctx.lineTo(engineX + 1.5, engineY + 8);
        ctx.lineTo(engineX + 0.5, engineY + 8 + flameLength);
        ctx.lineTo(engineX - 0.5, engineY + 8 + flameLength);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
};

Game.updatePlayer = function() {
    const s = Game.state;
    const p = Game.player;
    const m = Game.mouse;
    
    s.playerVX = p.x - s.lastPlayerX;
    s.playerVY = p.y - s.lastPlayerY;
    s.lastPlayerX = p.x;
    s.lastPlayerY = p.y;
    
    const dx = m.x - p.x;
    const dy = m.y - p.y;
    
    const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
    const angleDiff = targetAngle - p.rotation;
    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    
    p.targetRotation = normalizedDiff * 0.3;
    p.rotation += (p.targetRotation - p.rotation) * 0.1;
    
    p.x += dx * 0.1;
    p.y += dy * 0.1;
    
    p.flameOffset = Math.sin(Date.now() * p.flameSpeed) * 0.5 + 0.5;
    
    if (s.invulnerable > 0) {
        s.invulnerable -= 0.016;
    }
};

Game.takeDamage = function() {
    Game.state.hp--;
    Game.state.invulnerable = 2;
    
    if (Game.state.hp <= 0) {
        return true;
    }
    return false;
};

Game.resetPlayer = function() {
    Game.player.x = Game.canvas.width / 2;
    Game.player.y = Game.canvas.height / 2;
    Game.player.rotation = 0;
    Game.state.lastPlayerX = Game.player.x;
    Game.state.lastPlayerY = Game.player.y;
    Game.state.playerVX = 0;
    Game.state.playerVY = 0;
};