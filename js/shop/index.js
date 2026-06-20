// ==========================================
// ГЛАВНЫЙ ФАЙЛ МАГАЗИНА
// ==========================================

// === ПОКАЗ ЭКРАНА МАГАЗИНА ===
Game.showShopScreen = function() {
    Game.state.currentState = Game.STATE.SHOP;

    if (typeof window.switchView === 'function') {
        window.switchView('shop');
    }

    const shopCoins = document.getElementById('shopCoins');
    if (shopCoins) shopCoins.textContent = `💰 Монеты: ${Game.playerData.coins}`;

    // Открываем вкладку "Прокачка" по умолчанию
    if (typeof setCurrentDroneTab === 'function') {
        setCurrentDroneTab('defender');
    }
    renderShopTab('upgrades');

    document.body.style.cursor = 'default';

    if (typeof window.triggerMenuParallax === 'function') {
        window.triggerMenuParallax();
    }
};

console.log('✅ shop/index.js загружен');