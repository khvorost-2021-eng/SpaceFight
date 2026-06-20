// ==========================================
// ВКЛАДКА "ЦВЕТА" — ВЫБОР ЦВЕТА КОРАБЛЯ
// ==========================================

function renderColorsTab(content) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';

    const info = document.createElement('div');
    info.style.cssText = 'text-align: center; font-size: 16px; color: #88ccff;';
    info.textContent = '🎨 Выбери цвет своего корабля. Все цвета бесплатные!';
    wrapper.appendChild(info);

    const grid = document.createElement('div');
    grid.className = 'shop-grid';

    Object.keys(Game.SHIP_COLORS).forEach(key => {
        const colorObj = Game.SHIP_COLORS[key];
        const isSelected = Game.playerData.shipColor === key;

        const card = document.createElement('div');
        card.className = 'shop-card';
        if (isSelected) card.classList.add('selected');

        const preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        preview.style.background = `radial-gradient(circle, ${colorObj.color} 0%, rgba(0,0,0,0.8) 100%)`;
        preview.style.boxShadow = `0 0 25px ${colorObj.color}`;
        card.appendChild(preview);

        const name = document.createElement('div');
        name.className = 'shop-card-name';
        name.style.color = colorObj.color;
        name.textContent = colorObj.name;
        card.appendChild(name);

        const btn = document.createElement('button');
        btn.className = 'shop-btn';
        if (isSelected) {
            btn.textContent = '✓ Выбран';
            btn.disabled = true;
        } else {
            btn.textContent = 'Выбрать';
            btn.onclick = () => {
                Game.playerData.shipColor = key;
                Game.savePlayerData();
                renderShopTab('colors');
            };
        }
        card.appendChild(btn);
        grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    content.appendChild(wrapper);
}

console.log('✅ shop/colors.js загружен');