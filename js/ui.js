Game.transitionTo = function(targetId, onMiddle) {
    const screens = document.querySelectorAll('.screen');
    const current = Array.from(screens).find(s => !s.classList.contains('hidden'));
    const target = document.getElementById(targetId);
    
    if (!current || current === target) {
        screens.forEach(s => s.classList.add('hidden'));
        target.classList.remove('hidden');
        target.classList.remove('fade-out');
        if (onMiddle) onMiddle();
        Game.animateButtons(target);
        return;
    }
    
    current.classList.add('fade-out');
    
    setTimeout(() => {
        current.classList.add('hidden');
        current.classList.remove('fade-out');
        
        target.classList.remove('hidden');
        target.classList.add('fade-out');
        target.offsetHeight;
        
        if (onMiddle) onMiddle();
        Game.animateButtons(target);
        
        setTimeout(() => {
            target.classList.remove('fade-out');
        }, 20);
    }, 300);
};

Game.animateButtons = function(screen) {
    if (!screen) return;
    const buttons = screen.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        // Пропускаем кнопки навигации по уровням (они всегда видимы)
        if (btn.classList.contains('nav-arrow')) return;
        btn.style.animation = 'none';
        btn.offsetHeight;
        btn.style.animation = `buttonAppear 400ms ease-out ${i * 50}ms forwards`;
    });
};

Game.hideAllScreens = function() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('fade-out');
    });
};

Game.updateUI = function() {
    const s = Game.state;
    const inGame = s.currentState === Game.STATE.ARCADE || 
                   s.currentState === Game.STATE.CAMPAIGN ||
                   s.currentState === Game.STATE.DYING;
    
    if (inGame) {
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('score').textContent = `Счёт: ${s.score}`;
        document.getElementById('coinsDisplay').textContent = `Монеты: ${Game.playerData.coins}`;
        
        const hpContainer = document.getElementById('hpContainer');
        hpContainer.innerHTML = '';
        for (let i = 0; i < s.maxHp; i++) {
            const heart = document.createElement('div');
            heart.className = `hp-heart ${i >= s.hp ? 'empty' : ''}`;
            hpContainer.appendChild(heart);
        }
        
        let info = s.mode === 'campaign' ? `Уровень ${s.level}` : 'Аркада';
        info += ` | Волна ${s.currentWave}/${s.totalWaves}`;
        const aliveCount = Game.enemies.length;
        if (aliveCount > 0) info += ` | Врагов: ${aliveCount}`;
        const aliveDrones = Game.drones.filter(d => d.alive).length;
        const maxSlots = Game.getMaxDroneSlots();
        info += ` | 🛸 ${aliveDrones}/${maxSlots}`;
        info += ` | Ур.${Game.playerData.playerLevel}`;
        document.getElementById('levelDisplay').textContent = info;
    } else {
        document.getElementById('ui').classList.add('hidden');
    }
};

Game.showMainMenu = function() {
    Game.resetWorld();
    Game.hideDeathOverlays();
    
    document.getElementById('menuCoins').textContent = `Монеты: ${Game.playerData.coins}`;
    const menuLevel = document.getElementById('menuLevel');
    if (menuLevel) {
        const rank = Game.getRank(Game.playerData.playerLevel);
        menuLevel.textContent = `${rank.icon} ${Game.playerData.pilotName} — Ур. ${Game.playerData.playerLevel}`;
    }
    
    Game.transitionTo('mainMenu', () => {
        Game.state.currentState = Game.STATE.MENU;
        document.body.style.cursor = 'default';
    });
};

// === ВЫБОР УРОВНЯ С ПАГИНАЦИЕЙ ===
Game.LEVELS_PER_PAGE = 10;
Game.currentLevelPage = 1;

Game.getTotalLevels = function() {
    // Максимум доступных уровней (можно расширять)
    return Math.max(20, Game.playerData.maxLevelUnlocked + 5);
};

Game.showLevelSelect = function() {
    Game.currentLevelPage = 1;
    Game.transitionTo('levelSelectScreen', () => {
        Game.state.currentState = Game.STATE.LEVEL_SELECT;
        Game.renderLevelPage(Game.currentLevelPage);
        document.body.style.cursor = 'default';
    });
};

Game.renderLevelPage = function(pageNum) {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    const startLevel = (pageNum - 1) * Game.LEVELS_PER_PAGE + 1;
    const endLevel = Math.min(startLevel + Game.LEVELS_PER_PAGE - 1, totalLevels);
    
    // Индикатор страницы
    const indicator = document.getElementById('levelPageIndicator');
    if (indicator) {
        indicator.textContent = `${LANG.page} ${pageNum} / ${totalLevels > Game.LEVELS_PER_PAGE ? totalPages : 1}`;
    }
    
    // Обновляем состояние стрелок
    const prevBtn = document.getElementById('levelPrevBtn');
    const nextBtn = document.getElementById('levelNextBtn');
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= totalPages;
    
    // Рендерим ровно 10 карточек (2 ряда по 5)
    for (let i = 0; i < Game.LEVELS_PER_PAGE; i++) {
        const levelNum = startLevel + i;
        const card = document.createElement('div');
        card.className = 'level-card';
        
        if (levelNum > totalLevels) {
            // Пустая карточка (заглушка, чтобы сетка не ломалась)
            card.classList.add('locked');
            card.style.visibility = 'hidden';
            grid.appendChild(card);
            continue;
        }
        
        const isCompleted = Game.playerData.levelsCompleted.includes(levelNum);
        const isUnlocked = levelNum <= Game.playerData.maxLevelUnlocked;
        const isCurrent = levelNum === Game.playerData.maxLevelUnlocked;
        const isBoss = levelNum % 5 === 0;
        
        if (isCompleted) card.classList.add('completed');
        else if (isCurrent) card.classList.add('current');
        else if (!isUnlocked) card.classList.add('locked');
        
        card.style.animationDelay = `${i * 30}ms`;
        
        // Номер уровня
        const numberDiv = document.createElement('div');
        numberDiv.textContent = isUnlocked ? levelNum : '🔒';
        card.appendChild(numberDiv);
        
        // Подпись "БОСС" для босс-уровней
        if (isBoss) {
            const subtitle = document.createElement('div');
            subtitle.className = 'level-card-subtitle';
            subtitle.textContent = LANG.bossLevel;
            card.appendChild(subtitle);
        }
        
        // Галочка для пройденных
        if (isCompleted) {
            const check = document.createElement('div');
            check.style.cssText = 'position:absolute;top:5px;right:8px;font-size:18px;color:#00ff66;text-shadow:0 0 5px #00ff66;';
            check.textContent = '✓';
            card.appendChild(check);
        }
        
        if (isUnlocked) {
            card.addEventListener('click', () => {
                Game.startCampaignFromLevel(levelNum);
            });
        }
        
        grid.appendChild(card);
    }
};

Game.levelPagePrev = function() {
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    if (Game.currentLevelPage > 1) {
        Game.currentLevelPage--;
        Game.renderLevelPage(Game.currentLevelPage);
    }
};

Game.levelPageNext = function() {
    const totalLevels = Game.getTotalLevels();
    const totalPages = Math.ceil(totalLevels / Game.LEVELS_PER_PAGE);
    if (Game.currentLevelPage < totalPages) {
        Game.currentLevelPage++;
        Game.renderLevelPage(Game.currentLevelPage);
    }
};

// === ЭКРАН ПРОФИЛЯ ===
Game.showProfileScreen = function() {
    Game.transitionTo('profileScreen', () => {
        Game.state.currentState = Game.STATE.MENU; // Остаёмся в меню-подобном состоянии
        Game.renderProfile();
        document.body.style.cursor = 'default';
    });
};

Game.renderProfile = function() {
    const content = document.getElementById('profileContent');
    content.innerHTML = '';
    
    const pd = Game.playerData;
    const rank = Game.getRank(pd.playerLevel);
    const nextRank = Game.getNextRank(pd.playerLevel);
    const xp = Game.getXPProgress();
    
    // === ШАПКА ПРОФИЛЯ ===
    const header = document.createElement('div');
    header.className = 'profile-header';
    
    const top = document.createElement('div');
    top.className = 'profile-top';
    
    const identity = document.createElement('div');
    identity.className = 'profile-identity';
    
    const avatar = document.createElement('div');
    avatar.className = 'profile-avatar';
    avatar.textContent = rank.icon;
    
    const nameRank = document.createElement('div');
    nameRank.className = 'profile-name-rank';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'profile-name';
    nameEl.textContent = pd.pilotName;
    nameEl.title = LANG.editName;
    nameEl.onclick = () => {
        const newName = prompt(LANG.editName, pd.pilotName);
        if (newName && newName.trim()) {
            pd.pilotName = newName.trim().slice(0, 20);
            Game.savePlayerData();
            Game.renderProfile();
        }
    };
    
    const rankEl = document.createElement('div');
    rankEl.className = 'profile-rank';
    rankEl.textContent = `${LANG.rank}: ${rank.name}`;
    
    nameRank.appendChild(nameEl);
    nameRank.appendChild(rankEl);
    
    identity.appendChild(avatar);
    identity.appendChild(nameRank);
    
    const levelBadge = document.createElement('div');
    levelBadge.className = 'profile-level-badge';
    levelBadge.innerHTML = `
        <div class="profile-level-label">${LANG.playerLevel}</div>
        <div class="profile-level-value">${pd.playerLevel}</div>
    `;
    
    top.appendChild(identity);
    top.appendChild(levelBadge);
    header.appendChild(top);
    
    // XP секция
    const xpSection = document.createElement('div');
    xpSection.className = 'profile-xp-section';
    
    const xpHeader = document.createElement('div');
    xpHeader.className = 'profile-xp-header';
    
    const xpLeft = document.createElement('span');
    xpLeft.textContent = nextRank 
        ? `До ранга "${LANG.ranks[nextRank.key]}": ${xp.needed - xp.current} XP`
        : '🏆 Максимальный ранг достигнут!';
    
    const xpRight = document.createElement('span');
    xpRight.textContent = `${xp.current} / ${xp.needed} XP`;
    
    xpHeader.appendChild(xpLeft);
    xpHeader.appendChild(xpRight);
    
    const xpBar = document.createElement('div');
    xpBar.className = 'profile-xp-bar';
    
    const xpFill = document.createElement('div');
    xpFill.className = 'profile-xp-fill';
    xpFill.style.width = `${xp.percent}%`;
    xpBar.appendChild(xpFill);
    
    xpSection.appendChild(xpHeader);
    xpSection.appendChild(xpBar);
    header.appendChild(xpSection);
    
    content.appendChild(header);
    
    // === СТАТИСТИКА ===
    const statsSection = document.createElement('div');
    statsSection.className = 'profile-section';
    
    const statsTitle = document.createElement('div');
    statsTitle.className = 'profile-section-title';
    statsTitle.textContent = `📊 ${LANG.statistics}`;
    statsSection.appendChild(statsTitle);
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'profile-stats-grid';
    
    const stats = [
        { label: LANG.coins, value: pd.coins, cls: 'gold' },
        { label: LANG.levelsCompleted, value: `${pd.levelsCompleted.length} / ${Game.getTotalLevels()}`, cls: 'green' },
        { label: 'Всего XP', value: pd.xp, cls: '' },
        { label: 'Дронов куплено', value: pd.drones.length, cls: '' },
        { label: LANG.droneSlots, value: `${Game.getMaxDroneSlots()} / 5`, cls: '' },
        { label: 'Лучший счёт', value: pd.totalScore || 0, cls: 'gold' }
    ];
    
    stats.forEach(s => {
        const stat = document.createElement('div');
        stat.className = 'profile-stat';
        stat.innerHTML = `
            <div class="profile-stat-label">${s.label}</div>
            <div class="profile-stat-value ${s.cls}">${s.value}</div>
        `;
        statsGrid.appendChild(stat);
    });
    
    statsSection.appendChild(statsGrid);
    content.appendChild(statsSection);
    
    // === СНАРЯЖЕНИЕ (слоты дронов) ===
    const gearSection = document.createElement('div');
    gearSection.className = 'profile-section';
    
    const gearTitle = document.createElement('div');
    gearTitle.className = 'profile-section-title';
    gearTitle.textContent = `🛸 ${LANG.gear}`;
    gearSection.appendChild(gearTitle);
    
    const slotsGrid = document.createElement('div');
    slotsGrid.className = 'slots-grid';
    
    Game.SLOT_CONFIG.forEach((slotConfig, idx) => {
        const card = document.createElement('div');
        card.className = 'slot-card';
        
        const isUnlocked = pd.slotsUnlocked[idx];
        const equippedDroneId = pd.selectedDrones[idx];
        const equippedDrone = equippedDroneId ? Game.DRONE_TYPES[equippedDroneId] : null;
        
        if (isUnlocked) {
            card.classList.add('unlocked');
            if (equippedDrone) card.classList.add('equipped');
        } else {
            card.classList.add('locked');
        }
        
        const number = document.createElement('div');
        number.className = 'slot-number';
        number.textContent = isUnlocked ? (idx + 1) : '🔒';
        card.appendChild(number);
        
        const preview = document.createElement('div');
        preview.className = 'slot-drone-preview';
        if (isUnlocked && equippedDrone && Game.droneImages[equippedDrone.id]) {
            const img = document.createElement('img');
            img.src = Game.droneImages[equippedDrone.id].src;
            preview.appendChild(img);
        } else if (isUnlocked) {
            preview.classList.add('empty');
            preview.textContent = '—';
        } else {
            preview.classList.add('empty');
            preview.textContent = '🔒';
        }
        card.appendChild(preview);
        
        const status = document.createElement('div');
        status.className = 'slot-status';
        if (!isUnlocked) {
            status.textContent = LANG.slotLocked;
        } else if (equippedDrone) {
            status.innerHTML = `<strong>${equippedDrone.name}</strong><br>${LANG.equipped}`;
        } else {
            status.textContent = LANG.notEquipped;
        }
        card.appendChild(status);
        
        // Клик по открытому слоту — выбор дрона
        if (isUnlocked) {
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                showDronePickerForProfile(idx);
            };
        }
        
        // Кнопка "Снять"
        if (isUnlocked && equippedDrone) {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Снять';
            removeBtn.style.background = '#aa3333';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                pd.selectedDrones.splice(idx, 1);
                Game.savePlayerData();
                Game.renderProfile();
            };
            card.appendChild(removeBtn);
        }
        
        // Кнопка открытия слота
        if (!isUnlocked) {
            const btn = document.createElement('button');
            const canUnlock = Game.canUnlockSlot(idx);
            const hasLevel = pd.playerLevel >= slotConfig.requiredLevel;
            const hasCoins = pd.coins >= slotConfig.price;
            
            if (slotConfig.price === 0) {
                btn.textContent = LANG.free;
                btn.disabled = true;
            } else {
                btn.textContent = canUnlock ? `${LANG.unlockSlot} (${slotConfig.price} 💰)` : `${slotConfig.price} 💰`;
                btn.disabled = !canUnlock;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (Game.unlockSlot(idx)) {
                        Game.renderProfile();
                    }
                };
            }
            
            card.appendChild(btn);
            
            const req = document.createElement('div');
            req.className = 'slot-requirements';
            const parts = [];
            if (!hasLevel) parts.push(`ур. ${slotConfig.requiredLevel}`);
            if (!hasCoins && slotConfig.price > 0) parts.push(`${slotConfig.price} 💰`);
            if (parts.length > 0) {
                req.classList.add('unmet');
                req.textContent = `Нужно: ${parts.join(', ')}`;
            } else if (canUnlock) {
                req.classList.add('met');
                req.textContent = '✓ Готово к открытию';
            }
            card.appendChild(req);
        }
        
        slotsGrid.appendChild(card);
    });
    
    gearSection.appendChild(slotsGrid);
    
    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:15px; font-size:13px; color:#888; text-align:center;';
    hint.textContent = '💡 Кликни по открытому слоту чтобы выбрать дрона';
    gearSection.appendChild(hint);
    
    content.appendChild(gearSection);
};

// Окно выбора дрона для профиля
function showDronePickerForProfile(slotIndex) {
    const modal = document.createElement('div');
    modal.className = 'screen';
    modal.style.background = 'rgba(0, 0, 20, 0.95)';
    modal.style.zIndex = '2000';
    
    const menu = document.createElement('div');
    menu.className = 'menu';
    
    const title = document.createElement('h1');
    title.style.fontSize = '28px';
    title.textContent = `Выбери дрона для слота ${slotIndex + 1}`;
    menu.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    
    // Опция "Пусто"
    const emptyCard = document.createElement('div');
    emptyCard.className = 'shop-card';
    emptyCard.innerHTML = `
        <div class="shop-card-preview empty" style="font-size:32px;color:#555;">—</div>
        <div class="shop-card-name">Пусто</div>
        <div class="shop-card-desc">Оставить слот свободным</div>
    `;
    emptyCard.onclick = () => {
        if (Game.playerData.selectedDrones[slotIndex]) {
            Game.playerData.selectedDrones.splice(slotIndex, 1);
            Game.savePlayerData();
        }
        document.body.removeChild(modal);
        Game.renderProfile();
    };
    grid.appendChild(emptyCard);
    
    const ownedDrones = Game.playerData.drones || [];
    const selectedDrones = Game.playerData.selectedDrones || [];
    
    ownedDrones.forEach(droneId => {
        const droneType = Game.DRONE_TYPES[droneId];
        if (!droneType) return;
        
        const usedInOtherSlot = selectedDrones.some((id, idx) => id === droneId && idx !== slotIndex);
        
        const card = document.createElement('div');
        card.className = 'shop-card';
        if (usedInOtherSlot) card.classList.add('locked');
        
        const preview = document.createElement('div');
        preview.className = 'shop-card-preview';
        if (Game.droneImages[droneId]) {
            const img = document.createElement('img');
            img.src = Game.droneImages[droneId].src;
            preview.appendChild(img);
        }
        
        const name = document.createElement('div');
        name.className = 'shop-card-name';
        name.textContent = droneType.name;
        
        const desc = document.createElement('div');
        desc.className = 'shop-card-desc';
        if (usedInOtherSlot) {
            desc.textContent = '⚠ Уже в другом слоте';
            desc.style.color = '#ff6666';
        } else {
            desc.textContent = droneType.description;
        }
        
        card.appendChild(preview);
        card.appendChild(name);
        card.appendChild(desc);
        
        if (!usedInOtherSlot) {
            card.onclick = () => {
                if (Game.playerData.selectedDrones[slotIndex]) {
                    Game.playerData.selectedDrones.splice(slotIndex, 1);
                }
                while (Game.playerData.selectedDrones.length < slotIndex) {
                    Game.playerData.selectedDrones.push(null);
                }
                Game.playerData.selectedDrones.splice(slotIndex, 0, droneId);
                Game.playerData.selectedDrones = Game.playerData.selectedDrones.filter(id => id);
                Game.savePlayerData();
                document.body.removeChild(modal);
                Game.renderProfile();
            };
        }
        
        grid.appendChild(card);
    });
    
    if (ownedDrones.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'grid-column:1/-1; text-align:center; color:#888; padding:30px;';
        emptyMsg.textContent = 'У тебя нет купленных дронов. Загляни в Магазин → Дроны!';
        grid.appendChild(emptyMsg);
    }
    
    menu.appendChild(grid);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.style.opacity = '1';
    cancelBtn.style.transform = 'none';
    cancelBtn.onclick = () => document.body.removeChild(modal);
    menu.appendChild(cancelBtn);
    
    modal.appendChild(menu);
    document.body.appendChild(modal);
}

Game.hideDeathOverlays = function() {
    const fade = document.getElementById('deathFadeOverlay');
    const text = document.getElementById('gameOverText');
    if (fade) fade.classList.remove('active');
    if (text) {
        text.classList.remove('active');
        text.classList.add('hidden');
        text.classList.remove('fade-out');
    }
};

Game.showDeathScreen = function() {
    const s = Game.state;
    document.getElementById('deathScore').textContent = `Счёт: ${s.score}`;
    document.getElementById('deathCoins').textContent = `Получено монет: ${s.coinsEarned}`;
    const deathXP = document.getElementById('deathXP');
    if (deathXP) deathXP.textContent = `Получено опыта: ${s.xpEarned || 0}`;
    Game.hideDeathOverlays();
    Game.transitionTo('deathScreen', () => {
        document.body.style.cursor = 'default';
    });
};

Game.showLevelCompleteScreen = function() {
    const s = Game.state;
    document.getElementById('levelCompleteInfo').innerHTML = 
        `Уровень ${s.level} пройден!<br>Получено монет: ${s.coinsEarned}<br>Получено опыта: ${s.xpEarned || 0}`;
    Game.transitionTo('levelCompleteScreen', () => {
        document.body.style.cursor = 'default';
    });
};