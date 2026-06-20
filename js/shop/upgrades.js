// ==========================================
// ВКЛАДКА "ПРОКАЧКА" — КОРАБЛЬ + ДРОНЫ
// ==========================================

function renderUpgradesTab(content) {
    const wrapper = document.createElement('div');
    wrapper.className = 'upgrades-wrapper';

    // Секция корабля
    wrapper.appendChild(renderShipUpgradesSection());

    // Секция дронов (с под-вкладками)
    wrapper.appendChild(renderDroneUpgradesSection());

    content.appendChild(wrapper);
}

// === СЕКЦИЯ КОРАБЛЯ ===
function renderShipUpgradesSection() {
    const section = document.createElement('div');
    section.className = 'profile-section';

    const title = document.createElement('div');
    title.className = 'profile-section-title';
    title.textContent = '🚀 Корабль';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'profile-stats-grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';

    Object.keys(Game.SHIP_UPGRADES).forEach(key => {
        const upgrade = Game.SHIP_UPGRADES[key];
        const currentLevel = (Game.playerData.upgrades && Game.playerData.upgrades[key]) || 0;
        grid.appendChild(createShipUpgradeCard(key, upgrade, currentLevel));
    });

    section.appendChild(grid);
    return section;
}

function createShipUpgradeCard(key, upgrade, currentLevel) {
    const card = document.createElement('div');
    card.className = 'shop-card';
    const isMaxed = currentLevel >= upgrade.max;
    if (isMaxed) card.classList.add('owned');

    const icon = document.createElement('div');
    icon.className = 'shop-card-preview';
    icon.innerHTML = `<div style="font-size:42px;">${upgrade.icon}</div>`;

    const name = document.createElement('div');
    name.className = 'shop-card-name';
    name.textContent = upgrade.name;

    const desc = document.createElement('div');
    desc.className = 'shop-card-desc';
    desc.textContent = `${upgrade.description} (Ур. ${currentLevel}/${upgrade.max})`;

    const btn = document.createElement('button');
    btn.className = 'shop-btn';
    if (isMaxed) {
        btn.textContent = '✓ МАКС';
        btn.disabled = true;
    } else {
        const price = Game.getUpgradePrice(upgrade.basePrice, currentLevel);
        const canAfford = Game.playerData.coins >= price;
        btn.textContent = canAfford ? `Улучшить — ${price} 💰` : `Нужно ${price} 💰`;
        btn.disabled = !canAfford;
        btn.onclick = () => {
            if (Game.playerData.coins >= price) {
                Game.playerData.coins -= price;
                if (!Game.playerData.upgrades) Game.playerData.upgrades = {};
                Game.playerData.upgrades[key] = currentLevel + 1;
                Game.savePlayerData();
                updateShopCoins();
                renderShopTab('upgrades');
            }
        };
    }

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(btn);
    return card;
}

// === СЕКЦИЯ ДРОНОВ ===
function renderDroneUpgradesSection() {
    const section = document.createElement('div');
    section.className = 'profile-section';

    const title = document.createElement('div');
    title.className = 'profile-section-title';
    title.textContent = '🛸 Дроны';
    section.appendChild(title);

    // Под-вкладки для каждого типа дрона
    const tabs = document.createElement('div');
    tabs.className = 'drone-tabs';

    const droneTypes = ['defender', 'interceptor', 'heavy', 'healer'];
    const currentTab = typeof getCurrentDroneTab === 'function' ? getCurrentDroneTab() : 'defender';

    droneTypes.forEach(id => {
        const type = Game.DRONE_TYPES[id];
        if (!type) return;
        const isOwned = Game.playerData.drones && Game.playerData.drones.includes(id);

        const tab = document.createElement('button');
        tab.className = 'drone-tab';
        tab.style.setProperty('--drone-color', type.color);
        tab.style.setProperty('--drone-color-rgb', hexToRgb(type.color));
        if (!isOwned) tab.classList.add('locked');
        if (currentTab === id) tab.classList.add('active');
        tab.innerHTML = `<span style="font-size:18px;">${getDroneIcon(id)}</span> ${type.name}`;
        tab.onclick = () => {
            setCurrentDroneTab(id);
            renderShopTab('upgrades');
        };
        tabs.appendChild(tab);
    });
    section.appendChild(tabs);

    // Контент активной вкладки
    const droneContent = document.createElement('div');
    droneContent.className = 'drone-upgrade-content';
    renderDroneUpgradePanel(droneContent, currentTab);
    section.appendChild(droneContent);

    return section;
}

// === ПАНЕЛЬ ПРОКАЧКИ КОНКРЕТНОГО ДРОНА ===
function renderDroneUpgradePanel(container, droneId) {
    const type = Game.DRONE_TYPES[droneId];
    if (!type) return;
    const isOwned = Game.playerData.drones && Game.playerData.drones.includes(droneId);

    const card = document.createElement('div');
    card.className = 'drone-preview-card';
    card.style.setProperty('--drone-color', type.color);
    card.style.position = 'relative';
    card.style.overflow = 'visible';

    // Заголовок
    const header = document.createElement('div');
    header.className = 'drone-preview-header';
    header.innerHTML = `
        <div class="drone-preview-title">${getDroneIcon(droneId)} ${type.name}</div>
        <div class="drone-preview-desc">${type.description || ''}</div>
    `;
    card.appendChild(header);

    // Карточка со статистикой
    const statsCard = document.createElement('div');
    statsCard.className = 'drone-stats-card';
    statsCard.style.minHeight = '100px';
    statsCard.style.padding = '20px';
    statsCard.style.position = 'relative';

    const stats = document.createElement('div');
    stats.className = 'drone-preview-stats';
    const upgrades = (Game.playerData.upgrades && Game.playerData.upgrades.drones && Game.playerData.upgrades.drones[droneId]) || {};
    const hpVal = type.hp + (upgrades.hp || 0);
    const dmgVal = type.damage + ((upgrades.damage || 0) * 0.1);
    stats.innerHTML = `
        <span>❤️ HP: ${hpVal}</span>
        ${type.damage > 0 ? `<span>⚔️ Урон: ${dmgVal.toFixed(2)}</span>` : ''}
        ${type.fireRate > 0 ? `<span>⚡ Скор: ${(60 / type.fireRate).toFixed(1)}/с</span>` : ''}
        ${type.healInterval ? `<span>💚 Лечение: 1 HP/${(type.healInterval / 60).toFixed(0)}с</span>` : ''}
    `;
    statsCard.appendChild(stats);
    card.appendChild(statsCard);

    // Canvas для превью (поверх всех элементов)
    const canvas = document.createElement('canvas');
    canvas.className = 'drone-preview-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    card.appendChild(canvas);

    // Регистрация превью
    if (isOwned && typeof window.registerDronePreview === 'function') {
        setTimeout(() => {
            const rect = card.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            window.registerDronePreview(canvas, droneId, type);
        }, 100);
    }

    // Список улучшений
    if (isOwned) {
        const list = document.createElement('div');
        list.className = 'drone-upgrade-list';
        list.style.position = 'relative';
        list.style.zIndex = '5';

        const droneUpgConfig = Game.DRONE_UPGRADES[droneId];
        if (droneUpgConfig) {
            Object.keys(droneUpgConfig.upgrades).forEach(key => {
                list.appendChild(createDroneUpgradeRow(droneId, key, type, canvas));
            });
        }
        card.appendChild(list);
    } else {
        const hint = document.createElement('div');
        hint.className = 'drone-upgrade-hint';
        hint.style.position = 'relative';
        hint.style.zIndex = '5';
        hint.textContent = '⚠ Купи этого дрона во вкладке "Дроны", чтобы открывать улучшения';
        card.appendChild(hint);
    }

    container.appendChild(card);
}

// === СТРОКА УЛУЧШЕНИЯ ДРОНА ===
function createDroneUpgradeRow(droneId, key, type, previewCanvas) {
    const droneUpgConfig = Game.DRONE_UPGRADES[droneId];
    if (!droneUpgConfig || !droneUpgConfig.upgrades[key]) return document.createElement('div');
    const cfg = droneUpgConfig.upgrades[key];

    const upgrades = (Game.playerData.upgrades && Game.playerData.upgrades.drones && Game.playerData.upgrades.drones[droneId]) || {};
    const currentLevel = upgrades[key] || 0;
    const isMaxed = currentLevel >= cfg.max;
    const price = Game.getUpgradePrice(cfg.basePrice, currentLevel);
    const canAfford = Game.playerData.coins >= price;

    const row = document.createElement('div');
    row.className = 'drone-upgrade-row';
    row.style.setProperty('--drone-color', type.color);
    if (isMaxed) row.classList.add('maxed');

    const info = document.createElement('div');
    info.className = 'drone-upgrade-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'drone-upgrade-name';
    nameEl.textContent = `${cfg.name} (Ур. ${currentLevel}/${cfg.max})`;

    const descEl = document.createElement('div');
    descEl.className = 'drone-upgrade-desc';
    descEl.textContent = cfg.desc || cfg.description;

    const bar = document.createElement('div');
    bar.className = 'drone-upgrade-bar';
    const fill = document.createElement('div');
    fill.className = 'drone-upgrade-bar-fill';
    fill.style.width = `${(currentLevel / cfg.max) * 100}%`;
    bar.appendChild(fill);

    info.appendChild(nameEl);
    info.appendChild(descEl);
    info.appendChild(bar);
    row.appendChild(info);

    const btn = document.createElement('button');
    btn.className = 'drone-upgrade-btn shop-btn';
    btn.style.setProperty('--drone-color', type.color);

    if (isMaxed) {
        btn.textContent = '✓ МАКС';
        btn.disabled = true;
        btn.classList.add('maxed');
    } else {
        btn.textContent = canAfford ? `${price} 💰` : `🔒 ${price}`;
        btn.disabled = !canAfford;

        // HOVER — дрон подлетает к кнопке
        btn.addEventListener('mouseenter', () => {
            if (btn.disabled) return;
            const rect = btn.getBoundingClientRect();
            const canvasRect = previewCanvas.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2 - canvasRect.left;
            const targetY = rect.top + rect.height / 2 - canvasRect.top;
            if (typeof window.setDronePreviewHover === 'function') {
                window.setDronePreviewHover(previewCanvas, targetX, targetY);
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (typeof window.clearDronePreviewHover === 'function') {
                window.clearDronePreviewHover(previewCanvas);
            }
        });

        // 🔧 КЛИК — покупка с анимацией (1500мс задержка для короткой анимации)
        btn.onclick = () => {
            if (Game.playerData.coins >= price) {
                Game.playerData.coins -= price;
                if (!Game.playerData.upgrades.drones) Game.playerData.upgrades.drones = {};
                if (!Game.playerData.upgrades.drones[droneId]) Game.playerData.upgrades.drones[droneId] = {};
                Game.playerData.upgrades.drones[droneId][key] = currentLevel + 1;
                Game.savePlayerData();
                updateShopCoins();

                if (typeof window.triggerDronePreviewUpgrade === 'function') {
                    window.triggerDronePreviewUpgrade(previewCanvas, key);
                }

                const card = previewCanvas.closest('.drone-preview-card');
                if (card) {
                    card.classList.add('flash');
                    setTimeout(() => card.classList.remove('flash'), 600);
                }

                // 🔧 ИСПРАВЛЕНО: сокращено с 4000мс до 1500мс
                // Анимация длится ~1.5 секунды (45 кадров × 33мс)
                setTimeout(() => renderShopTab('upgrades'), 1500);
            }
        };
    }

    row.appendChild(btn);
    return row;
}

console.log('✅ shop/upgrades.js загружен');