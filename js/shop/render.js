// ==========================================
// ДИСПЕТЧЕР ВКЛАДОК МАГАЗИНА
// ==========================================

let currentShopTab = 'upgrades';
let currentDroneTab = 'defender';

// === ОБНОВЛЕНИЕ СЧЁТЧИКА МОНЕТ ===
window.updateShopCoins = function() {
    const el = document.getElementById('shopCoins');
    if (el) el.textContent = `💰 Монеты: ${Game.playerData.coins}`;
};

// === ГЛАВНАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ===
window.renderShopTab = function(tab) {
    currentShopTab = tab;
    const content = document.getElementById('shopContent');
    if (!content) return;

    // Очищаем превью дронов
    if (typeof window.clearAllDronePreviews === 'function') {
        window.clearAllDronePreviews();
    }

    content.innerHTML = '';

    document.querySelectorAll('.shop-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'upgrades') {
        if (typeof renderUpgradesTab === 'function') renderUpgradesTab(content);
    } else if (tab === 'drones') {
        if (typeof renderDronesTab === 'function') renderDronesTab(content);
    } else if (tab === 'colors') {
        if (typeof renderColorsTab === 'function') renderColorsTab(content);
    }

    if (typeof window.triggerMenuParallax === 'function') {
        window.triggerMenuParallax();
    }
};

// Экспорт для обратной совместимости
window.renderShopTabInternal = window.renderShopTab;
Game.renderShopTab = window.renderShopTab;

// === СОСТОЯНИЕ АКТИВНОГО ДРОНА (для под-вкладок) ===
window.getCurrentDroneTab = function() {
    return currentDroneTab;
};

window.setCurrentDroneTab = function(id) {
    currentDroneTab = id;
};

console.log('✅ shop/render.js загружен');