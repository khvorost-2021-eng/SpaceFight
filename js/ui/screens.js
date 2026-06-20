// ==========================================
// ЭКРАНЫ СМЕРТИ И ПОБЕДЫ
// ==========================================

Game.showDeathScreen = function() {
    var s = Game.state;
    s.currentState = Game.STATE.GAME_OVER;
    console.log('\uD83D\uDC80 \u041F\u043E\u043A\u0430\u0437 \u044D\u043A\u0440\u0430\u043D\u0430 \u0441\u043C\u0435\u0440\u0442\u0438');

    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');

    var sidebar = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (sidebar) { sidebar.style.display = 'none'; sidebar.style.visibility = 'hidden'; }
    if (mainContent) { mainContent.style.display = 'none'; mainContent.style.visibility = 'hidden'; }

    var uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');

    var deathScore = document.getElementById('deathScore');
    var deathCoins = document.getElementById('deathCoins');
    var deathXP = document.getElementById('deathXP');

    if (deathScore) deathScore.textContent = '\u0421\u0447\u0451\u0442: ' + s.score;
    if (deathCoins) deathCoins.textContent = '\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043C\u043E\u043D\u0435\u0442: ' + s.coinsEarned;
    if (deathXP) deathXP.textContent = '\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043E\u043F\u044B\u0442\u0430: ' + (s.xpEarned || 0);

    if (typeof Game.hideDeathOverlays === 'function') Game.hideDeathOverlays();

    var deathScreen = document.getElementById('deathScreen');
    if (deathScreen) {
        deathScreen.classList.remove('hidden');
        deathScreen.classList.remove('fade-out');
        deathScreen.style.display = 'flex';
        deathScreen.style.visibility = 'visible';
        deathScreen.style.opacity = '1';
        deathScreen.style.pointerEvents = 'auto';
        deathScreen.style.zIndex = '2000';
    }

    // 🔧 ИСПРАВЛЕНО: addEventListener вместо onclick (не конфликтует с button-bindings.js)
    var menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.style.pointerEvents = 'auto';
        menuBtn.style.zIndex = '2001';
        
        // Удаляем старые обработчики через клонирование
        var newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        menuBtn = newMenuBtn;
        
        if (s.mode === 'campaign') {
            menuBtn.textContent = '\uD83D\uDDFA\uFE0F \u0412 \u0443\u0440\u043E\u0432\u043D\u0438';
            menuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('\uD83D\uDDFA\uFE0F \u041A\u043B\u0438\u043A: \u0412 \u0443\u0440\u043E\u0432\u043D\u0438');
                
                var ds = document.getElementById('deathScreen');
                if (ds) {
                    ds.classList.add('hidden');
                    ds.style.display = 'none';
                    ds.style.visibility = 'hidden';
                    ds.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showLevelSelect);
            });
        } else {
            menuBtn.textContent = '\uD83C\uDFE0 \u0412 \u043C\u0435\u043D\u044E';
            menuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('\uD83C\uDFE0 \u041A\u043B\u0438\u043A: \u0412 \u043C\u0435\u043D\u044E');
                
                var ds = document.getElementById('deathScreen');
                if (ds) {
                    ds.classList.add('hidden');
                    ds.style.display = 'none';
                    ds.style.visibility = 'hidden';
                    ds.style.pointerEvents = 'none';
                }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showMainMenu);
            });
        }
    }

    // Кнопка "Заново" — тоже через addEventListener
    var restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.style.pointerEvents = 'auto';
        restartBtn.style.zIndex = '2001';
        
        var newRestartBtn = restartBtn.cloneNode(true);
        restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
        restartBtn = newRestartBtn;
        
        restartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('\uD83D\uDD04 \u041A\u043B\u0438\u043A: \u0417\u0430\u043D\u043E\u0432\u043E');
            
            var mode = Game.state.mode;
            var level = Game.state.level || 1;
            
            var ds = document.getElementById('deathScreen');
            if (ds) {
                ds.classList.add('hidden');
                ds.style.display = 'none';
                ds.style.visibility = 'hidden';
                ds.style.pointerEvents = 'none';
            }
            document.body.classList.remove('showing-overlay');
            
            if (mode === 'arcade') safeCall(Game.startGame, 'arcade');
            else safeCall(Game.startCampaignFromLevel, level);
        });
    }

    document.body.style.cursor = 'default';
    console.log('\u2705 \u042D\u043A\u0440\u0430\u043D \u0441\u043C\u0435\u0440\u0442\u0438 \u043F\u043E\u043A\u0430\u0437\u0430\u043D');
};

Game.showLevelCompleteScreen = function() {
    var s = Game.state;
    s.currentState = Game.STATE.LEVEL_COMPLETE;

    if (typeof clearGameWorld === 'function') clearGameWorld();

    document.body.classList.remove('in-game');
    document.body.classList.add('showing-overlay');

    var sidebar = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';

    var uiEl = document.getElementById('ui');
    if (uiEl) uiEl.classList.add('hidden');

    var info = document.getElementById('levelCompleteInfo');
    if (info) {
        info.innerHTML = '\u0423\u0440\u043E\u0432\u0435\u043D\u044C ' + s.level + ' \u043F\u0440\u043E\u0439\u0434\u0435\u043D!<br>\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043C\u043E\u043D\u0435\u0442: ' + s.coinsEarned + '<br>\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043E\u043F\u044B\u0442\u0430: ' + (s.xpEarned || 0);
    }

    var nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        if (s.mode === 'campaign') {
            nextLevelBtn.classList.remove('hidden');
            nextLevelBtn.style.display = '';
        } else {
            nextLevelBtn.classList.add('hidden');
            nextLevelBtn.style.display = 'none';
        }
    }

    var completeScreen = document.getElementById('levelCompleteScreen');
    if (completeScreen) {
        completeScreen.classList.remove('hidden');
        completeScreen.classList.add('active');
        completeScreen.style.display = 'flex';
        completeScreen.style.visibility = 'visible';
        completeScreen.style.opacity = '1';
        completeScreen.style.pointerEvents = 'auto';
        completeScreen.style.zIndex = '2000';
    }

    // 🔧 ИСПРАВЛЕНО: addEventListener вместо onclick
    var levelCompleteMenuBtn = document.getElementById('levelCompleteMenuBtn');
    if (levelCompleteMenuBtn) {
        var newBtn = levelCompleteMenuBtn.cloneNode(true);
        levelCompleteMenuBtn.parentNode.replaceChild(newBtn, levelCompleteMenuBtn);
        levelCompleteMenuBtn = newBtn;
        
        if (s.mode === 'campaign') {
            levelCompleteMenuBtn.textContent = '\uD83D\uDDFA\uFE0F \u0412 \u0443\u0440\u043E\u0432\u043D\u0438';
            levelCompleteMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var lcs = document.getElementById('levelCompleteScreen');
                if (lcs) { lcs.classList.add('hidden'); lcs.style.display = 'none'; }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showLevelSelect);
            });
        } else {
            levelCompleteMenuBtn.textContent = '\uD83C\uDFE0 \u0412 \u043C\u0435\u043D\u044E';
            levelCompleteMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var lcs = document.getElementById('levelCompleteScreen');
                if (lcs) { lcs.classList.add('hidden'); lcs.style.display = 'none'; }
                document.body.classList.remove('showing-overlay');
                safeCall(Game.showMainMenu);
            });
        }
    }

    // Кнопка "Следующий уровень"
    if (nextLevelBtn) {
        var newNextBtn = nextLevelBtn.cloneNode(true);
        nextLevelBtn.parentNode.replaceChild(newNextBtn, nextLevelBtn);
        newNextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var lcs = document.getElementById('levelCompleteScreen');
            if (lcs) { lcs.classList.add('hidden'); lcs.style.display = 'none'; }
            document.body.classList.remove('showing-overlay');
            safeCall(Game.nextLevel);
        });
    }

    document.body.style.cursor = 'default';
};

console.log('\u2705 ui/screens.js \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D');