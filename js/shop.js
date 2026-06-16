// ==========================================
// МАГАЗИН: СКИНЫ И ДРОНЫ
// ==========================================
Game.SKINS = [
    { id: 'standard', name: 'Стандартный', price: 0, color: '#00ffff' },
    { id: 'red', name: 'Красный (Скоро)', price: 100, color: '#ff0000' },
    { id: 'green', name: 'Зелёный (Скоро)', price: 150, color: '#00ff00' },
    { id: 'purple', name: 'Фиолетовый (Скоро)', price: 200, color: '#aa00ff' },
    { id: 'gold', name: 'Золотой (Скоро)', price: 500, color: '#ffd700' }
];

let currentShopTab = 'skins';

Game.showShopScreen = function() {
    Game.state.currentState = Game.STATE.SHOP;
    const shopCoins = document.getElementById('shopCoins');
    if (shopCoins) shopCoins.textContent = `Монеты: ${Game.playerData.coins}`;
    
    // Показываем shopView через switchView
    if (typeof window.switchView === 'function') {
        window.switchView('shop');
    }
    
    // Рендерим содержимое
    renderShopTab(currentShopTab);
    document.body.style.cursor = 'default';
};

function updateShopCoins() {
    const el = document.getElementById('shopCoins');
    if (el) el.textContent = `Монеты: ${Game.playerData.coins}`;
}

function renderShopTab(tab) {
    currentShopTab = tab;
    const content = document.getElementById('shopContent');
    if (!content) {
        console.warn('⚠️ #shopContent не найден');
        return;
    }
    content.innerHTML = '';

    document.querySelectorAll('.shop-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'skins') {
        renderSkinsTab(content);
    } else if (tab === 'drones') {
        renderDronesTab(content);
    }
}

function renderSkinsTab(content) {
    const grid = document.createElement('div');
    grid.className = 'shop-grid';

    Game.SKINS.forEach(skin => {
        const card = document.createElement('div');
        card.className = 'shop-card';

        const isOwned = Game.playerData.skins.includes(skin.id);
        const isSelected = Game.playerData.selectedSkin === skin.id;

        if (isSelected) card.classList.add('selected');
        else if (isOwned) card.classList.add('owned');
        else if (!isOwned && skin.price > 0) card.classList.add('locked');

        const preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        if (Game.shipsLoaded && Game.ships.player) {
            const img = document.createElement('img');
            img.src = Game.ships.player.src;
            preview.appendChild(img);
        } else {
            preview.innerHTML = '<div style="font-size:32px;color:#0ff;">🚀</div>';
        }

        const name = document.createElement('div');
        name.className = 'shop-card-name';
        name.textContent = skin.name;

        const btn = document.createElement('button');
        if (isSelected) {
            btn.textContent = LANG.selected;
            btn.disabled = true;
        } else if (isOwned) {
            btn.textContent = LANG.select;
            btn.onclick = () => {
                Game.playerData.selectedSkin = skin.id;
                Game.savePlayerData();
                renderShopTab('skins');
            };
        } else {
            btn.textContent = LANG.soon;
            btn.disabled = true;
        }

        card.appendChild(preview);
        card.appendChild(name);
        card.appendChild(btn);
        grid.appendChild(card);
    });

    content.appendChild(grid);

    if (!Game.shipsLoaded) {
        const checkShips = setInterval(() => {
            if (Game.shipsLoaded) {
                clearInterval(checkShips);
                if (currentShopTab === 'skins') renderShopTab('skins');
            }
        }, 100);
    }
}

function renderDronesTab(content) {
    const grid = document.createElement('div');
    grid.className = 'shop-grid';

    Object.values(Game.DRONE_TYPES).forEach(droneType => {
        const card = document.createElement('div');
        card.className = 'shop-card';

        const isOwned = Game.playerData.drones.includes(droneType.id);
        const canAfford = Game.playerData.coins >= droneType.price;

        if (isOwned) card.classList.add('owned');

        const preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        if (Game.droneImages[droneType.id]) {
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
        desc.textContent = droneType.description;

        const stats = document.createElement('div');
        stats.className = 'shop-card-stats';
        stats.innerHTML = `
            <div>❤️ HP: ${droneType.hp}</div>
            <div>⚔️ Урон: ${droneType.damage.toFixed(1)}</div>
            ${droneType.fireRate > 0 ? `<div>⚡ Скорость: ${(Math.round(60 / droneType.fireRate * 10) / 10).toFixed(1)}/с</div>` : ''}
            ${droneType.accuracy > 0 ? `<div>🎯 Точность: ${Math.round(droneType.accuracy * 100)}%</div>` : ''}
            ${droneType.healInterval ? `<div>💚 Лечение: 1 HP / ${droneType.healInterval / 60}с</div>` : ''}
            ${droneType.volley ? `<div>💥 Залп: ${droneType.volley} пуль</div>` : ''}
        `;

        const price = document.createElement('div');
        price.className = 'shop-card-price';

        const btn = document.createElement('button');
        if (isOwned) {
            price.textContent = '✓ ' + LANG.owned;
            btn.textContent = LANG.owned;
            btn.disabled = true;
        } else {
            price.textContent = `💰 ${droneType.price}`;
            btn.textContent = canAfford ? LANG.buy : `Нужно ${droneType.price}`;
            btn.disabled = !canAfford;
            btn.onclick = () => {
                if (Game.playerData.coins >= droneType.price) {
                    Game.playerData.coins -= droneType.price;
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

// 🔧 Экспорт для вызова из разных мест
window.renderShopTabInternal = renderShopTab;
Game.renderShopTab = renderShopTab;

console.log('✅ ui/shop.js загружен');