// ==========================================
// ЛОГИКА ДРОНОВ-ПОМОЩНИКОВ
// ==========================================

Game.updateDrones = function() {
    const player = Game.player;
    Game.drones.forEach(drone => {
        if (!drone.alive) return;
        const type = drone.type;

        // Орбитальное движение с DT
        drone.orbitAngle += type.orbitSpeed * DT;
        const targetX = player.x + Math.cos(drone.orbitAngle) * type.orbitRadius;
        const targetY = player.y + Math.sin(drone.orbitAngle) * type.orbitRadius;
        drone.x += (targetX - drone.x) * 0.15 * DT;
        drone.y += (targetY - drone.y) * 0.15 * DT;

        // Поворот с DT
        if (type.priority !== 'none') {
            const target = findDroneTarget(drone);
            if (target) {
                const dx = target.x - drone.x;
                const dy = target.y - drone.y;
                const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
                const diff = targetAngle - drone.rotation;
                const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
                drone.rotation += normalized * 0.15 * DT;
            }
        } else {
            const dx = player.x - drone.x;
            const dy = player.y - drone.y;
            const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const diff = targetAngle - drone.rotation;
            const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
            drone.rotation += normalized * 0.1 * DT;
        }

        // Стрельба с DT
        if (type.fireRate > 0) {
            drone.shootTimer += DT;
            if (drone.shootTimer >= type.fireRate) {
                const target = findDroneTarget(drone);
                if (target) {
                    droneShoot(drone, target);
                    drone.shootTimer = 0;
                }
            }
        }

        // Хил с DT
        if (type.healInterval) {
            drone.healTimer += DT;
            if (drone.healTimer >= type.healInterval) {
                if (Game.state.hp < Game.state.maxHp) {
                    spawnHealParticles(drone.x, drone.y, player.x, player.y);
                    setTimeout(() => {
                        if (Game.state.currentState === Game.STATE.ARCADE ||
                            Game.state.currentState === Game.STATE.CAMPAIGN) {
                            Game.healPlayer(type.healAmount);
                        }
                    }, 400);
                    drone.healTimer = 0;
                }
            }
        }

        if (drone.damageFlash > 0) {
            drone.damageFlash -= DT;
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
    if (Math.random() > type.accuracy) {
        const dx = target.x - drone.x;
        const dy = target.y - drone.y;
        const baseAngle = Math.atan2(dy, dx);
        const missAngle = baseAngle + (Math.random() - 0.5) * 2.5;
        Game.playDroneShootSound();
        Game.bullets.push({
            x: drone.x, y: drone.y,
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
                x: drone.x, y: drone.y,
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
            x: drone.x, y: drone.y,
            vx: Math.cos(angle) * type.bulletSpeed,
            vy: Math.sin(angle) * type.bulletSpeed,
            width: 4, height: 12,
            damage: type.damage,
            isDrone: true,
            droneColor: type.color
        });
    }
}

console.log('✅ game/drones.js загружен (с DT)');