Game.showSkinsScreen = function() {
    Game.transitionTo('skinsScreen', () => {
        Game.state.currentState = Game.STATE.SKINS;
        const grid = document.getElementById('skinsGrid');
        grid.innerHTML = '';
        
        Game.SKINS.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'skin-card';
            
            const isOwned = Game.playerData.skins.includes(skin.id);
            const isSelected = Game.playerData.selectedSkin === skin.id;
            
            if (isSelected) card.classList.add('selected');
            if (!isOwned && skin.price > 0) card.classList.add('locked');
            
            let priceText;
            if (isSelected) priceText = 'Выбран';
            else if (isOwned) priceText = 'Выбрать';
            else if (skin.price > 0) priceText = `${skin.price} монет`;
            else priceText = 'Бесплатно';
            
            card.innerHTML = `<div class="skin-name">${skin.name}</div><div class="skin-price">${priceText}</div>`;
            card.addEventListener('click', () => {
                if (isOwned) {
                    Game.playerData.selectedSkin = skin.id;
                    Game.savePlayerData();
                    Game.showSkinsScreen();
                }
            });
            grid.appendChild(card);
        });
        document.body.style.cursor = 'default';
    });
};