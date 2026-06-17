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

var currentShopTab = 'skins';

// === ГЛАВНАЯ ФУНКЦИЯ ПОКАЗА МАГАЗИНА ===
Game.showShopScreen = function() {
    console.log('🛒 [showShopScreen] Вызван');
    Game.state.currentState = Game.STATE.SHOP;

    var shopCoins = document.getElementById('shopCoins');
    if (shopCoins) shopCoins.textContent = '\u041C\u043E\u043D\u0435\u0442\u044B: ' + Game.playerData.coins;

    if (typeof window.switchView === 'function') {
        window.switchView('shop');
    }

    renderShopTab('skins');
    document.body.style.cursor = 'default';
};

// === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ===
function renderShopTab(tab) {
    console.log('\uD83D\uDD04 [renderShopTab] ' + tab);
    currentShopTab = tab;

    var content = document.getElementById('shopContent');
    if (!content) {
        console.error('\u274C #shopContent \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D');
        return;
    }
    content.innerHTML = '';

    document.querySelectorAll('.shop-tab').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'skins') {
        renderSkinsTab(content);
    } else if (tab === 'drones') {
        renderDronesTab(content);
    }
}

// === ВКЛАДКА СКИНОВ ===
function renderSkinsTab(content) {
    var grid = document.createElement('div');
    grid.className = 'shop-grid';

    Game.SKINS.forEach(function(skin) {
        var card = document.createElement('div');
        card.className = 'shop-card';

        var isOwned = Game.playerData.skins.indexOf(skin.id) !== -1;
        var isSelected = Game.playerData.selectedSkin === skin.id;

        if (isSelected) card.classList.add('selected');
        else if (isOwned) card.classList.add('owned');
        else if (skin.price > 0) card.classList.add('locked');

        var preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        preview.innerHTML = '<div style="font-size:32px;color:#0ff;">\uD83D\uDE80</div>';

        var name = document.createElement('div');
        name.className = 'shop-card-name';
        name.textContent = skin.name;

        var btn = document.createElement('button');
        if (isSelected) {
            btn.textContent = LANG.selected;
            btn.disabled = true;
        } else if (isOwned) {
            btn.textContent = LANG.select;
            btn.onclick = function() {
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
    console.log('  \u2705 \u0421\u043A\u0438\u043D\u044B \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u0430\u043D\u044B: ' + Game.SKINS.length);
}

// === ВКЛАДКА ДРОНОВ ===
function renderDronesTab(content) {
    if (!Game.DRONE_TYPES) {
        console.error('  \u274C Game.DRONE_TYPES \u043D\u0435 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D');
        return;
    }

    var droneList = Object.values(Game.DRONE_TYPES);
    console.log('  \uD83D\uDCCB \u0414\u0440\u043E\u043D\u043E\u0432 \u043D\u0430\u0439\u0434\u0435\u043D\u043E: ' + droneList.length);

    var grid = document.createElement('div');
    grid.className = 'shop-grid';

    droneList.forEach(function(droneType) {
        var card = document.createElement('div');
        card.className = 'shop-card';

        var isOwned = Game.playerData.drones.indexOf(droneType.id) !== -1;
        var canAfford = Game.playerData.coins >= droneType.price;

        if (isOwned) card.classList.add('owned');

        var preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        preview.innerHTML = '<div style="font-size:32px;color:#0ff;">\uD83D\uDEF8</div>';

        var name = document.createElement('div');
        name.className = 'shop-card-name';
        name.textContent = droneType.name;

        var desc = document.createElement('div');
        desc.className = 'shop-card-desc';
        desc.textContent = droneType.description || '';

        var stats = document.createElement('div');
        stats.className = 'shop-card-stats';
        var statsHtml = '<div>\u2764\uFE0F HP: ' + droneType.hp + '</div>';
        statsHtml += '<div>\u2694\uFE0F \u0423\u0440\u043E\u043D: ' + droneType.damage.toFixed(1) + '</div>';
        if (droneType.fireRate > 0) {
            statsHtml += '<div>\u26A1 \u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C: ' + (Math.round(60 / droneType.fireRate * 10) / 10).toFixed(1) + '/\u0441</div>';
        }
        if (droneType.accuracy > 0) {
            statsHtml += '<div>\uD83C\uDFAF \u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C: ' + Math.round(droneType.accuracy * 100) + '%</div>';
        }
        if (droneType.healInterval) {
            statsHtml += '<div>\uD83D\uDC9A \u041B\u0435\u0447\u0435\u043D\u0438\u0435: 1 HP / ' + (droneType.healInterval / 60) + '\u0441</div>';
        }
        if (droneType.volley) {
            statsHtml += '<div>\uD83D\uDCA5 \u0417\u0430\u043B\u043F: ' + droneType.volley + ' \u043F\u0443\u043B\u044C</div>';
        }
        stats.innerHTML = statsHtml;

        var price = document.createElement('div');
        price.className = 'shop-card-price';

        var btn = document.createElement('button');
        if (isOwned) {
            price.textContent = '\u2713 ' + LANG.owned;
            btn.textContent = LANG.owned;
            btn.disabled = true;
        } else {
            price.textContent = '\uD83D\uDCB0 ' + droneType.price;
            btn.textContent = canAfford ? LANG.buy : '\u041D\u0443\u0436\u043D\u043E ' + droneType.price;
            btn.disabled = !canAfford;
            btn.onclick = function() {
                if (Game.playerData.coins >= droneType.price) {
                    Game.playerData.coins -= droneType.price;
                    Game.playerData.drones.push(droneType.id);
                    Game.savePlayerData();
                    var el = document.getElementById('shopCoins');
                    if (el) el.textContent = '\u041C\u043E\u043D\u0435\u0442\u044B: ' + Game.playerData.coins;
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
    console.log('  \u2705 \u0414\u0440\u043E\u043D\u044B \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u0430\u043D\u044B: ' + droneList.length);
}

// === ЭКСПОРТ — ОБЯЗАТЕЛЬНО ЧЕРЕЗ window ===
window.renderShopTab = renderShopTab;
window.renderShopTabInternal = renderShopTab;
Game.renderShopTab = renderShopTab;

console.log('\u2705 ui/shop.js \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D');