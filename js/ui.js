/** Dutch HUD helpers — CoD-style FPS museum shooter */

const els = {
  score: document.getElementById('score'),
  hp: document.getElementById('hp'),
  kills: document.getElementById('kills'),
  overlay: document.getElementById('overlay'),
  startBtn: document.getElementById('start-btn'),
  restartBtn: document.getElementById('restart-btn'),
  endMsg: document.getElementById('end-msg'),
  damageFlash: document.getElementById('damage-flash'),
  hitMarker: document.getElementById('hit-marker'),
  tips: document.getElementById('control-tips'),
  aimBanner: document.getElementById('aim-banner'),
  clickPlay: document.getElementById('click-to-play'),
};

export function setScore(n) {
  els.score.textContent = String(n);
}

export function setHp(n) {
  els.hp.textContent = String(Math.max(0, Math.ceil(n)));
  els.hp.classList.toggle('low', n <= 30);
}

export function setKills(n) {
  els.kills.textContent = String(n);
}

export function showOverlay(show) {
  els.overlay.classList.toggle('hidden', !show);
}

export function showStart() {
  els.startBtn.classList.remove('hidden');
  els.restartBtn.classList.add('hidden');
  els.endMsg.classList.add('hidden');
  els.endMsg.textContent = '';
  showOverlay(true);
  document.body.classList.remove('playing');
  hideClickToPlay();
}

export function showGameOver(won, score, kills) {
  els.startBtn.classList.add('hidden');
  els.restartBtn.classList.remove('hidden');
  els.endMsg.classList.remove('hidden');
  els.endMsg.textContent = won
    ? `Gewonnen! Score ${score} — ${kills} protestanten gestopt.`
    : `Game over. Score ${score} — ${kills} uitgeschakeld.`;
  showOverlay(true);
  document.body.classList.remove('playing');
  hideClickToPlay();
}

export function hideOverlayPlaying() {
  showOverlay(false);
  document.body.classList.add('playing');
  if (els.aimBanner) {
    els.aimBanner.classList.remove('fade');
    clearTimeout(els.aimBanner._fadeTimer);
    els.aimBanner._fadeTimer = setTimeout(() => {
      els.aimBanner.classList.add('fade');
    }, 10000);
  }
}

export function showClickToPlay() {
  if (!els.clickPlay) return;
  els.clickPlay.classList.remove('hidden');
}

export function hideClickToPlay() {
  if (!els.clickPlay) return;
  els.clickPlay.classList.add('hidden');
}

export function flashDamage() {
  els.damageFlash.classList.add('on');
  setTimeout(() => els.damageFlash.classList.remove('on'), 120);
}

export function flashHit() {
  els.hitMarker.classList.add('on');
  setTimeout(() => els.hitMarker.classList.remove('on'), 100);
}

/** On-screen control tips that fade after `seconds` */
export function showControlTips(seconds = 10) {
  if (!els.tips) return;
  els.tips.classList.remove('hidden', 'fade-out');
  els.tips.classList.add('visible');
  clearTimeout(els.tips._fadeTimer);
  els.tips._fadeTimer = setTimeout(() => {
    els.tips.classList.add('fade-out');
    setTimeout(() => {
      els.tips.classList.remove('visible', 'fade-out');
      els.tips.classList.add('hidden');
    }, 700);
  }, seconds * 1000);
}

export function onStart(cb) {
  els.startBtn.addEventListener('click', cb);
}

export function onRestart(cb) {
  els.restartBtn.addEventListener('click', cb);
}
