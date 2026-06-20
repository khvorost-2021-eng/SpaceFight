// ==========================================
// ВКЛАДКА "ДРОНЫ" — ПОКУПКА ДРОНОВ
// ==========================================

function renderDronesTab(content) {
    const grid = document.createElement('div');
    grid.className = 'shop-grid';

    Object.values(Game.DRONE_TYPES).forEach(droneType => {
        const card = document.createElement('div');
        card.className = 'shop-card drone-card';
        card.style.setProperty('--drone-color', droneType.color);

        const isOwned = Game.playerData.drones && Game.playerData.drones.includes(droneType.id);
        const canAfford = Game.playerData.coins >= droneType.price;
        if (isOwned) card.classList.add('owned');

        const preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        if (Game.droneImages && Game.droneImages[droneType.id]) {
            const img = document.createElement('img');
            img.src = Game.droneImages[droneType.id].src;
            preview.appendChild(img);
        } else {
            preview.innerHTML = '<div style="font-size:32px;color:#0ff;">🛸</div>';
        }

        const name = document.createElement('div');
        name.className = 'shop-card-name';
        name.textContent = droneType.name;

        const desc = document.createElement('div');
        desc.className = 'shop-card-desc';
        desc.textContent = droneType.description || '';

        const stats = document.createElement('div');
        stats.className = 'shop-card-stats';
        let html = `<div>❤️ HP: ${droneType.hp}</div>`;
        if (droneType.damage > 0) html += `<div>⚔️ Урон: ${droneType.damage.toFixed(2)}</div>`;
        if (droneType.fireRate > 0) html += `<div>⚡ Скор: ${(60 / droneType.fireRate).toFixed(1)}/с</div>`;
        if (droneType.healInterval) html += `<div>💚 Лечение</div>`;
        stats.innerHTML = html;

        const price = document.createElement('div');
        price.className = 'shop-card-price';

        const btn = document.createElement('button');
        btn.className = 'shop-btn';
        if (isOwned) {
            price.textContent = '✓ Куплено';
            btn.textContent = '✓ Куплено';
            btn.disabled = true;
        } else {
            price.textContent = `💰 ${droneType.price}`;
            btn.textContent = canAfford ? 'Купить' : `Нужно ${droneType.price}`;
            btn.disabled = !canAfford;
            btn.onclick = () => {
                if (Game.playerData.coins >= droneType.price) {
                    Game.playerData.coins -= droneType.price;
                    if (!Game.playerData.drones) Game.playerData.drones = [];
                    Game.playerData.drones.push(droneType.id);
                    Game.savePlayerData();
                    updateShopCoins();
                    renderShopTab('drones');
                }
            };
        }

        card.appendChild(preview);
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(stats);
        card.appendChild(price);
        card.appendChild(btn);
        grid.appendChild(card);
    });

    content.appendChild(grid);
}

console.log('✅ shop/drones.js загружен');