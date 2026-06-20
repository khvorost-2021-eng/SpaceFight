// ==========================================
// ЖИВОЙ ФОН МЕНЮ: ЗВЁЗДЫ + СИЛУЭТЫ ДРОНОВ
// ==========================================

const menuBgCanvas = document.getElementById('menuBg');
const menuBgCtx = menuBgCanvas ? menuBgCanvas.getContext('2d') : null;

let menuParallaxX = 0, menuParallaxY = 0;
let targetParallaxX = 0, targetParallaxY = 0;

// === ПАРАЛЛАКС ===
window.triggerMenuParallax = function(direction) {
    if (direction === 'left') {
        targetParallaxX = -50;
        targetParallaxY = (Math.random() - 0.5) * 20;
    } else if (direction === 'right') {
        targetParallaxX = 50;
        targetParallaxY = (Math.random() - 0.5) * 20;
    } else {
        targetParallaxX = (Math.random() - 0.5) * 60;
        targetParallaxY = (Math.random() - 0.5) * 30;
    }
    setTimeout(() => {
        targetParallaxX = 0;
        targetParallaxY = 0;
    }, 2000);
};

// === ЗВЁЗДЫ ===
let menuStars = [];

function initMenuStars() {
    if (!menuBgCanvas) return;
    menuStars = [];
    const W = menuBgCanvas.width, H = menuBgCanvas.height;
    for (let i = 0; i < 250; i++) {
        menuStars.push({
            x: Math.random() * W, y: Math.random() * H,
            size: Math.random() * 2.5 + 0.3,
            baseBrightness: Math.random() * 0.7 + 0.2,
            twinkleSpeed: Math.random() * 4 + 0.5,
            twinklePhase: Math.random() * Math.PI * 2,
            depth: Math.random() * 0.7 + 0.2
        });
    }
}

// === СИЛУЭТЫ ДРОНОВ ===
let bgDrones = [];

function initBgDrones() {
    if (!menuBgCanvas) return;
    bgDrones = [];
    const W = menuBgCanvas.width, H = menuBgCanvas.height;
    const types = ['defender', 'interceptor', 'heavy', 'healer'];
    for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.6 + 0.2;
        bgDrones.push({
            x: Math.random() * W, y: Math.random() * H,
            rotation: Math.random() * Math.PI * 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 30 + 25,
            type: types[Math.floor(Math.random() * types.length)],
            rotSpeed: (Math.random() - 0.5) * 0.03,
            depth: 0.8
        });
    }
}

// === RESIZE ===
function resizeMenuBg() {
    if (!menuBgCanvas) return;
    menuBgCanvas.width = window.innerWidth;
    menuBgCanvas.height = window.innerHeight;
    initMenuStars();
    initBgDrones();
}

if (menuBgCanvas) {
    resizeMenuBg();
    window.addEventListener('resize', resizeMenuBg);
}

// === ОТРИСОВКА ФОНА ===
function drawMenuBackground() {
    if (document.body.classList.contains('in-game')) return;
    if (!menuBgCtx || !menuBgCanvas) return;

    const W = menuBgCanvas.width, H = menuBgCanvas.height;
    const time = Date.now() * 0.001;

    menuParallaxX += (targetParallaxX - menuParallaxX) * 0.04;
    menuParallaxY += (targetParallaxY - menuParallaxY) * 0.04;

    // Градиентный фон
    const bgGrad = menuBgCtx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
    bgGrad.addColorStop(0, '#050a1a');
    bgGrad.addColorStop(0.5, '#020510');
    bgGrad.addColorStop(1, '#000005');
    menuBgCtx.fillStyle = bgGrad;
    menuBgCtx.fillRect(0, 0, W, H);

    // Звёзды
    menuStars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.6;
        const brightness = star.baseBrightness * twinkle;
        const px = star.x + menuParallaxX * star.depth;
        const py = star.y + menuParallaxY * star.depth;

        menuBgCtx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        menuBgCtx.fillRect(px, py, star.size, star.size);

        if (star.size > 1.5 && brightness > 0.6) {
            menuBgCtx.strokeStyle = `rgba(180, 220, 255, ${brightness * 0.4})`;
            menuBgCtx.lineWidth = 0.5;
            menuBgCtx.beginPath();
            menuBgCtx.moveTo(px - star.size * 2.5, py);
            menuBgCtx.lineTo(px + star.size * 2.5, py);
            menuBgCtx.moveTo(px, py - star.size * 2.5);
            menuBgCtx.lineTo(px, py + star.size * 2.5);
            menuBgCtx.stroke();
        }
    });

    // Силуэты дронов
    bgDrones.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.rotation += d.rotSpeed;

        if (d.x < -80) d.x = W + 80;
        if (d.x > W + 80) d.x = -80;
        if (d.y < -80) d.y = H + 80;
        if (d.y > H + 80) d.y = -80;

        const img = Game.droneImages && Game.droneImages[d.type];
        if (img && img.complete && img.naturalWidth > 0) {
            menuBgCtx.save();
            menuBgCtx.globalAlpha = 0.18;
            menuBgCtx.translate(
                d.x + menuParallaxX * d.depth,
                d.y + menuParallaxY * d.depth
            );
            menuBgCtx.rotate(d.rotation);
            menuBgCtx.drawImage(img, -d.size/2, -d.size/2, d.size, d.size);
            menuBgCtx.restore();
        }
    });

    // Обновляем превью дронов
    if (window.activeDronePreviews && window.activeDronePreviews.length > 0) {
        if (typeof updateDronePreviews === 'function') {
            updateDronePreviews();
        }
    }
}

// 🔧 НЕМЕДЛЕННАЯ первая отрисовка (убирает чёрный экран)
// Вызываем синхронно ДО setInterval, чтобы фон был готов мгновенно
if (menuBgCtx && menuBgCanvas) {
    drawMenuBackground();
    // Убираем класс loading → интерфейс плавно появляется вместе с фоном
    document.body.classList.remove('loading');
}

// Запуск цикла фона (30 FPS достаточно для декора)
setInterval(drawMenuBackground, 33);
console.log('✅ menu-background/background.js загружен');