// ==========================================
// СИСТЕМА ПЕРЕХОДОВ МЕЖДУ ЭКРАНАМИ
// ==========================================

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

// 🔧 УСИЛЕННАЯ очистка death-анимаций
Game.hideDeathOverlays = function() {
    const fade = document.getElementById('deathFadeOverlay');
    const text = document.getElementById('gameOverText');

    if (fade) {
        fade.classList.remove('active');
        fade.style.opacity = '0';
        fade.style.pointerEvents = 'none';
    }

    if (text) {
        text.classList.remove('active');
        text.classList.add('hidden');
        text.classList.remove('fade-out');
        text.style.opacity = '0';
        text.style.transform = 'translate(-50%, -50%) scale(0.5)';
        text.style.pointerEvents = 'none';
    }
};

console.log('✅ ui/transitions.js загружен');