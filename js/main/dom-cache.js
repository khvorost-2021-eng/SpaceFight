// ==========================================
// КЭШ DOM ЭЛЕМЕНТОВ
// ==========================================

window.DOM = {
    arcadeBtn: null,
    levelPrevBtn: null,
    levelNextBtn: null,
    restartBtn: null,
    menuBtn: null,
    deathScreen: null,
    nextLevelBtn: null,
    levelCompleteMenuBtn: null,
    levelCompleteScreen: null,
    pauseScreen: null,
    mobilePauseBtn: null,
    pauseResumeBtn: null,
    pauseMenuBtn: null,
    mainMenu: null,
    sidebar: null,
    mainContent: null,
    ui: null
};

window.cacheDOMElements = function() {
    DOM.arcadeBtn = document.getElementById('arcadeBtn');
    DOM.levelPrevBtn = document.getElementById('levelPrevBtn');
    DOM.levelNextBtn = document.getElementById('levelNextBtn');
    DOM.restartBtn = document.getElementById('restartBtn');
    DOM.menuBtn = document.getElementById('menuBtn');
    DOM.nextLevelBtn = document.getElementById('nextLevelBtn');
    DOM.levelCompleteMenuBtn = document.getElementById('levelCompleteMenuBtn');
    DOM.deathScreen = document.getElementById('deathScreen');
    DOM.levelCompleteScreen = document.getElementById('levelCompleteScreen');
    DOM.pauseScreen = document.getElementById('pauseScreen');
    DOM.mobilePauseBtn = document.getElementById('mobilePauseBtn');
    DOM.pauseResumeBtn = document.getElementById('pauseResumeBtn');
    DOM.pauseMenuBtn = document.getElementById('pauseMenuBtn');
    DOM.mainMenu = document.getElementById('mainMenu');
    DOM.sidebar = document.querySelector('.sidebar');
    DOM.mainContent = document.querySelector('.main-content');
    DOM.ui = document.getElementById('ui');
};

console.log('✅ main/dom-cache.js загружен');