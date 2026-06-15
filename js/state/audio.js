// ==========================================
// АУДИО СИСТЕМА (Web Audio API)
// ==========================================

Game.audioCtx = null;
Game.bgMusic = null;
Game.bgMusicGain = null;
Game.masterGain = null;
Game.isAudioInitialized = false;

Game.initAudio = function() {
    if (Game.isAudioInitialized) return;
    try {
        Game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        Game.masterGain = Game.audioCtx.createGain();
        Game.masterGain.gain.value = 0.5;
        Game.masterGain.connect(Game.audioCtx.destination);
        Game.bgMusicGain = Game.audioCtx.createGain();
        Game.bgMusicGain.gain.value = 0.15;
        Game.bgMusicGain.connect(Game.masterGain);
        Game.startBackgroundMusic();
        Game.isAudioInitialized = true;
    } catch (e) {
        console.error('Audio init error:', e);
    }
};

Game.startBackgroundMusic = function() {
    if (!Game.audioCtx) return;
    const playNote = (freq, startTime, duration, type = 'sine') => {
        const osc = Game.audioCtx.createOscillator();
        const gain = Game.audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(Game.bgMusicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
    };
    const loop = () => {
        if (!Game.audioCtx) return;
        const now = Game.audioCtx.currentTime;
        playNote(55, now, 2, 'sawtooth');
        playNote(55, now + 2, 2, 'sawtooth');
        playNote(65.41, now + 4, 2, 'sawtooth');
        playNote(73.42, now + 6, 2, 'sawtooth');
        playNote(220, now, 0.5, 'sine');
        playNote(261.63, now + 0.5, 0.5, 'sine');
        playNote(329.63, now + 1, 0.5, 'sine');
        playNote(392, now + 1.5, 0.5, 'sine');
        playNote(440, now + 2, 1, 'sine');
        playNote(392, now + 3, 0.5, 'sine');
        playNote(329.63, now + 3.5, 0.5, 'sine');
        playNote(293.66, now + 4, 1, 'sine');
        playNote(261.63, now + 5, 1, 'sine');
        playNote(220, now + 6, 2, 'sine');
        Game.bgMusic = setTimeout(loop, 8000);
    };
    loop();
};

Game.stopBackgroundMusic = function() {
    if (Game.bgMusic) {
        clearTimeout(Game.bgMusic);
        Game.bgMusic = null;
    }
};

Game.playShootSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator();
    const gain = Game.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(Game.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
};

Game.playDroneShootSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator();
    const gain = Game.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(Game.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
};

Game.playHealSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator();
    const gain = Game.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(Game.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
};

Game.playHitSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator();
    const gain = Game.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 150;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(Game.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
};

Game.playExplosionSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc1 = Game.audioCtx.createOscillator();
    const gain1 = Game.audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(Game.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    const bufferSize = Game.audioCtx.sampleRate * 0.3;
    const buffer = Game.audioCtx.createBuffer(1, bufferSize, Game.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
    }
    const noise = Game.audioCtx.createBufferSource();
    const noiseGain = Game.audioCtx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    noise.connect(noiseGain);
    noiseGain.connect(Game.masterGain);
    noise.start(now);
};

Game.playPlayerExplosionSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc1 = Game.audioCtx.createOscillator();
    const gain1 = Game.audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(20, now + 1);
    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 1);
    osc1.connect(gain1);
    gain1.connect(Game.masterGain);
    osc1.start(now);
    osc1.stop(now + 1);
};

Game.playDamageSound = function() {
    if (!Game.audioCtx) return;
    const now = Game.audioCtx.currentTime;
    const osc = Game.audioCtx.createOscillator();
    const gain = Game.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.1);
    osc.frequency.setValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(Game.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
};

console.log('✅ state/audio.js загружен');