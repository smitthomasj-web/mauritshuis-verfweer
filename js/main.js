import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { buildWorld } from './world.js';
import { Player } from './player.js';
import { EnemyManager } from './enemies.js';
import {
  setScore,
  setHp,
  setKills,
  showStart,
  showGameOver,
  hideOverlayPlaying,
  flashDamage,
  flashHit,
  onStart,
  onRestart,
  showControlTips,
  showClickToPlay,
  hideClickToPlay,
} from './ui.js';

const state = {
  score: 0,
  kills: 0,
  playing: false,
  ended: false,
  paused: false,
  awaitingRelock: false,
  hadPointerLock: false, // only treat unlock as "accidental" after a real lock
};

const clock = new THREE.Clock(false);
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x7aa3c4);
scene.fog = new THREE.Fog(0x9ebcd4, 55, 120);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.08, 160);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  alpha: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = false;
renderer.domElement.tabIndex = 0;
renderer.domElement.style.outline = 'none';
document.body.appendChild(renderer.domElement);

// —— CoD-style post stack: bloom + filmic vignette ——
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.28,
  0.55,
  0.82
);
composer.addPass(bloom);

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 0.55 },
    offset: { value: 1.15 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(offset);
      float vig = clamp(1.0 - dot(uv, uv), 0.0, 1.0);
      vig = pow(vig, 1.15);
      texel.rgb *= mix(1.0 - darkness, 1.0, vig);
      // subtle warm lift (museum gold)
      texel.rgb = mix(texel.rgb, texel.rgb * vec3(1.04, 1.01, 0.96), 0.18);
      gl_FragColor = texel;
    }
  `,
};
composer.addPass(new ShaderPass(VignetteShader));
composer.addPass(new OutputPass());

const world = buildWorld(scene);
const player = new Player(camera, renderer.domElement);
const enemies = new EnemyManager(scene);
enemies.setSpawns(world.enemySpawns);

const muzzle = new THREE.PointLight(0xffaa44, 0, 8, 2);
muzzle.position.set(0.0, -0.05, -1.15);
camera.add(muzzle);
scene.add(camera);

const tracers = [];
const ammoEl = document.getElementById('ammo');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const endMsg = document.getElementById('end-msg');
const START_LABEL = 'Start spel';

player.onShoot((origin, pellets, range) => {
  if (!state.playing || state.ended || state.paused) return;

  muzzle.intensity = 7;
  setTimeout(() => {
    muzzle.intensity = 0;
  }, 55);

  const hitEnemies = new Set();
  let anyHit = false;

  for (const dir of pellets) {
    const tip = origin.clone().addScaledVector(dir, Math.min(18, range * 0.55));
    const geo = new THREE.BufferGeometry().setFromPoints([origin.clone(), tip]);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0xffe8b0, transparent: true, opacity: 0.45 })
    );
    scene.add(line);
    tracers.push({ mesh: line, life: 0.05 });

    const hit = enemies.rayHit(origin, dir, range);
    if (hit && !hitEnemies.has(hit.enemy)) {
      hitEnemies.add(hit.enemy);
    }
    if (hit) {
      anyHit = true;
      const killed = enemies.damageEnemy(hit.enemy, 1);
      if (killed) {
        state.kills += 1;
        state.score += hit.enemy.scoreValue;
        setKills(state.kills);
        setScore(state.score);
      }
    }
  }

  if (anyHit) {
    flashHit();
    state.score += 10 * hitEnemies.size;
    setScore(state.score);
  }

  syncAmmo();
});

player.onTaunt(() => {
  if (!state.playing || state.ended || state.paused) return;
  const stunned = enemies.stunNear(player.position, 14, 1.4);
  if (stunned > 0) {
    state.score += stunned * 5;
    setScore(state.score);
  }
});

function syncAmmo() {
  if (ammoEl) {
    const reloading = player.reloadTimer > 0;
    ammoEl.textContent = reloading ? 'herladen…' : `${player.shells}/6`;
  }
}

function syncHud() {
  setScore(state.score);
  setHp(player.hp);
  setKills(state.kills);
  syncAmmo();
}

function hardReset() {
  state.score = 0;
  state.kills = 0;
  state.playing = false;
  state.ended = false;
  state.paused = false;
  state.awaitingRelock = false;
  state.hadPointerLock = false;
  hideClickToPlay();
  enemies.clearAll();
  player.reset(world.playerStart, world.playerStartYaw ?? 0);
  player.enabled = false;
  player.releaseLock();
  syncHud();
}

/** Request pointer lock without freezing gameplay if the browser denies it. */
function tryPointerLock() {
  renderer.domElement.focus({ preventScroll: true });
  player.requestLock();
}

function beginPlay() {
  hardReset();
  state.playing = true;
  state.awaitingRelock = false;
  player.enabled = true;
  player.reset(world.playerStart, world.playerStartYaw ?? 0);
  enemies.startWaves();
  startBtn.textContent = START_LABEL;
  hideOverlayPlaying();
  showControlTips(12);
  if (!clock.running) clock.start();
  else clock.start(); // reset delta baseline
  // Defer lock one frame so overlay is gone and gesture still counts
  tryPointerLock();
  requestAnimationFrame(() => tryPointerLock());
  syncAmmo();
}

function resumePlay() {
  state.paused = false;
  state.awaitingRelock = false;
  state.playing = true;
  player.enabled = true;
  startBtn.textContent = START_LABEL;
  hideOverlayPlaying();
  hideClickToPlay();
  tryPointerLock();
}

function pauseGame() {
  if (!state.playing || state.ended || state.paused) return;
  state.paused = true;
  state.playing = false;
  state.awaitingRelock = false;
  player.enabled = false;
  hideClickToPlay();
  player.releaseLock();

  startBtn.classList.remove('hidden');
  startBtn.textContent = 'Doorgaan';
  restartBtn.classList.add('hidden');
  endMsg.classList.remove('hidden');
  endMsg.textContent = `Pauze — golf ${enemies.wave}/${enemies.maxWaves}, ${enemies.alive} actief`;
  document.getElementById('overlay').classList.remove('hidden');
  document.body.classList.remove('playing');
}

function endGame(won) {
  if (state.ended) return;
  state.ended = true;
  state.playing = false;
  state.paused = false;
  state.awaitingRelock = false;
  player.enabled = false;
  hideClickToPlay();
  player.releaseLock();
  startBtn.textContent = START_LABEL;
  showGameOver(won, state.score, state.kills);
}

onStart(() => {
  if (state.paused && !state.ended) {
    resumePlay();
  } else {
    beginPlay();
  }
});

onRestart(() => beginPlay());

let escGraceUntil = 0;

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape') return;
  if (!(state.playing && !state.ended && !state.paused)) return;
  escGraceUntil = performance.now() + 250;
  player._escUnlock = true;
  e.preventDefault();
  pauseGame();
});

document.addEventListener('pointerlockchange', () => {
  if (state.ended) return;

  if (!player.isLocked) {
    if (state.paused || !state.playing) return;

    const wasEsc =
      player.consumeEscUnlock() || performance.now() < escGraceUntil;
    if (wasEsc) {
      if (!state.paused) pauseGame();
      return;
    }
    // Lock dropped (remote desktop / browser) — keep playing; look uses client deltas.
    state.awaitingRelock = false;
    hideClickToPlay();
    if (state.playing && !state.paused && !state.ended) {
      player.enabled = true;
    }
  } else {
    state.hadPointerLock = true;
    state.awaitingRelock = false;
    hideClickToPlay();
    if (state.playing && !state.paused && !state.ended) {
      player.enabled = true;
    }
  }
});

document.addEventListener('pointerlockerror', () => {
  // Browser denied lock — look still works via clientX/Y deltas
  console.warn('[Mauritshuis] Pointer lock geweigerd — muiskijken werkt zonder lock.');
});

function relockIfNeeded() {
  if (state.playing && !state.paused && !state.ended && !player.isLocked) {
    tryPointerLock();
  }
}

renderer.domElement.addEventListener('click', relockIfNeeded);
const clickPlayEl = document.getElementById('click-to-play');
if (clickPlayEl) {
  clickPlayEl.style.pointerEvents = 'auto';
  clickPlayEl.style.cursor = 'pointer';
  clickPlayEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    relockIfNeeded();
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
});

showStart();
player.reset(world.playerStart, world.playerStartYaw ?? 0);
syncAmmo();

window.addEventListener('error', (ev) => {
  console.error('[Mauritshuis] runtime error', ev.error || ev.message);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('[Mauritshuis] unhandledrejection', ev.reason);
});

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());

  for (let i = tracers.length - 1; i >= 0; i--) {
    tracers[i].life -= dt;
    if (tracers[i].life <= 0) {
      scene.remove(tracers[i].mesh);
      tracers[i].mesh.geometry.dispose();
      tracers[i].mesh.material.dispose();
      tracers.splice(i, 1);
    }
  }

  if (state.playing && !state.ended && !state.paused && !state.awaitingRelock) {
    player.update(dt, world.colliders, world.bounds);
    setHp(player.hp);
    syncAmmo();

    const result = enemies.update(dt, player.position);
    if (result.playerHit > 0) {
      const dead = player.takeDamage(result.playerHit);
      setHp(player.hp);
      flashDamage();
      if (dead) endGame(false);
    }
    if (result.allDone && !state.ended) {
      state.score += 500;
      setScore(state.score);
      endGame(true);
    }
  } else if (!state.playing && !state.paused && !state.ended) {
    const t = performance.now() * 0.00022;
    const s = world.playerStart;
    camera.position.set(s.x + Math.sin(t) * 0.35, s.y, s.z + Math.cos(t * 0.7) * 0.15);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = (world.playerStartYaw ?? 0) + Math.sin(t * 0.55) * 0.05;
    camera.rotation.x = -0.06;
    camera.fov = 68;
    camera.updateProjectionMatrix();
    player.shotgun.visible = true;
    player.tauntHand.visible = false;
  }

  composer.render();
}

animate();
