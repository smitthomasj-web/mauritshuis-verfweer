import * as THREE from 'three';
import { resolveCollision } from './world.js';

// ── Tunables (CoD-like feel) ──────────────────────────────────────────
const MOUSE_SENS = 0.0022;        // raw look scale when pointer-locked
const MOUSE_SENS_FREE = 0.0024;   // clientX/Y deltas (unlocked / remote desktop)
const MOUSE_SMOOTH = 0;          // 0 = raw, no lag
const SPEED = 4.4;
const SPRINT_MULT = 1.55;
const ADS_MOVE_MULT = 0.55;
const ACCEL = 18;
const DECEL = 22;
const RADIUS = 0.38;
const EYE = 1.65;
const MAX_HP = 100;
const JUMP_VEL = 5.2;
const GRAVITY = 18;
const FOV_HIP = 68;
const FOV_ADS = 52;
const FOV_SPRINT_KICK = 3.5;
const FOV_LERP = 10;

/** Shotgun */
const PUMP_TIME = 0.48;
const RELOAD_TIME = 1.05;
const MAG_SIZE = 6;
const PELLET_COUNT = 10;
const SPREAD_HIP = 0.095;
const SPREAD_ADS = 0.032;
const RANGE = 34;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.15,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

function box(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z);
  return m;
}

function cyl(rTop, rBot, h, color, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 10), mat(color, opts));
  m.position.set(x, y, z);
  return m;
}

function createShotgun() {
  const root = new THREE.Group();
  root.name = 'shotgun';

  // Remington/Mossberg-style pump-action — FPS viewmodel
  const wood = mat(0x6b3f24, { roughness: 0.72, metalness: 0.02 });
  const woodDark = mat(0x4a2a16, { roughness: 0.78, metalness: 0.02 });
  const woodGrain = mat(0x8a5530, { roughness: 0.65, metalness: 0.04 });
  const steel = mat(0x3a3a42, { roughness: 0.32, metalness: 0.88 });
  const steelDark = mat(0x1a1a1e, { roughness: 0.28, metalness: 0.92 });
  const steelBlue = mat(0x2a2e38, { roughness: 0.25, metalness: 0.95 });
  const steelLite = mat(0x5a5a64, { roughness: 0.35, metalness: 0.8 });
  const brass = mat(0xc9a227, { roughness: 0.35, metalness: 0.75, emissive: 0x332200, emissiveIntensity: 0.08 });
  const blackPoly = mat(0x121214, { roughness: 0.55, metalness: 0.2 });
  const skin = mat(0xe0a878, { roughness: 0.75, metalness: 0.0 });
  const skinShadow = mat(0xc48a5a, { roughness: 0.8 });

  function addMesh(geo, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    root.add(m);
    return m;
  }

  // ——— Stock (walnut, extends toward camera / +Z) ———
  addMesh(new THREE.BoxGeometry(0.085, 0.095, 0.28), wood, 0.0, -0.06, 0.28);
  addMesh(new THREE.BoxGeometry(0.09, 0.12, 0.14), woodDark, 0.0, -0.09, 0.42);
  // Recoil pad
  addMesh(new THREE.BoxGeometry(0.095, 0.135, 0.035), blackPoly, 0.0, -0.085, 0.505);
  // Comb / cheek
  addMesh(new THREE.BoxGeometry(0.07, 0.04, 0.18), woodGrain, 0.0, 0.005, 0.32);
  // Pistol-grip style wrist
  const grip = addMesh(new THREE.BoxGeometry(0.07, 0.16, 0.09), woodDark, 0.0, -0.18, 0.12);
  grip.rotation.x = 0.35;
  addMesh(new THREE.BoxGeometry(0.075, 0.05, 0.08), wood, 0.0, -0.26, 0.1, 0.15, 0, 0);

  // ——— Receiver (blued steel) ———
  addMesh(new THREE.BoxGeometry(0.095, 0.12, 0.34), steelBlue, 0.0, -0.05, -0.08);
  addMesh(new THREE.BoxGeometry(0.1, 0.04, 0.34), steelDark, 0.0, 0.02, -0.08);
  // Ejection / loading port (right side)
  addMesh(new THREE.BoxGeometry(0.02, 0.055, 0.12), blackPoly, 0.055, -0.03, -0.02);
  addMesh(new THREE.BoxGeometry(0.015, 0.04, 0.09), steelLite, 0.062, -0.03, -0.02);
  // Shell loading gate underside hint
  addMesh(new THREE.BoxGeometry(0.06, 0.02, 0.08), steelDark, 0.0, -0.115, 0.02);
  // Pins / screws
  addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), brass, 0.0, -0.05, 0.06, 0, 0, Math.PI / 2);
  addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), brass, 0.0, -0.05, -0.16, 0, 0, Math.PI / 2);

  // ——— Trigger group ———
  addMesh(new THREE.BoxGeometry(0.035, 0.055, 0.1), steelDark, 0.0, -0.145, 0.02);
  const trigger = addMesh(new THREE.BoxGeometry(0.012, 0.045, 0.018), steelLite, 0.0, -0.165, 0.0);
  trigger.name = 'trigger';
  // Trigger guard (torus-ish from boxes + thin arc)
  addMesh(new THREE.TorusGeometry(0.038, 0.007, 8, 16, Math.PI), steel, 0.0, -0.175, 0.005, Math.PI / 2, 0, 0);

  // ——— Barrel (long, forward −Z) ———
  const barrel = addMesh(
    new THREE.CylinderGeometry(0.028, 0.03, 0.92, 14),
    steelDark,
    0.0, -0.02, -0.72,
    Math.PI / 2, 0, 0
  );
  barrel.name = 'barrel';
  // Ventilated rib
  addMesh(new THREE.BoxGeometry(0.018, 0.012, 0.88), steelLite, 0.0, 0.012, -0.7);
  // Rib posts
  for (let i = 0; i < 7; i++) {
    addMesh(new THREE.BoxGeometry(0.014, 0.016, 0.012), steel, 0.0, 0.004, -0.35 - i * 0.12);
  }
  // Magazine tube under barrel
  addMesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.72, 12),
    steel,
    0.0, -0.065, -0.58,
    Math.PI / 2, 0, 0
  );
  // Tube cap
  addMesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12),
    steelLite,
    0.0, -0.065, -0.96,
    Math.PI / 2, 0, 0
  );
  // Barrel band
  addMesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.035, 12),
    steelBlue,
    0.0, -0.04, -0.95,
    Math.PI / 2, 0, 0
  );

  // ——— Muzzle + bead sight ———
  addMesh(
    new THREE.CylinderGeometry(0.032, 0.034, 0.05, 14),
    steelBlue,
    0.0, -0.02, -1.2,
    Math.PI / 2, 0, 0
  );
  // Bore hole (dark)
  addMesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.04, 10),
    blackPoly,
    0.0, -0.02, -1.225,
    Math.PI / 2, 0, 0
  );
  // Front bead
  addMesh(new THREE.SphereGeometry(0.01, 8, 6), brass, 0.0, 0.028, -1.18);

  // ——— Pump forend (slides on tube) ———
  const pump = new THREE.Group();
  pump.name = 'pump';
  pump.position.set(0.0, -0.08, -0.52);
  const pumpWood = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.095, 0.28), wood);
  pump.add(pumpWood);
  const pumpRidges = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.02, 0.26), woodDark);
  pumpRidges.position.y = 0.04;
  pump.add(pumpRidges);
  for (let i = -2; i <= 2; i++) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.108, 0.035, 0.028), woodGrain);
    ridge.position.set(0, -0.01, i * 0.048);
    pump.add(ridge);
  }
  // Metal sleeve ends
  const sleeveF = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.04, 12), steel);
  sleeveF.rotation.x = Math.PI / 2;
  sleeveF.position.z = -0.15;
  pump.add(sleeveF);
  const sleeveB = sleeveF.clone();
  sleeveB.position.z = 0.15;
  pump.add(sleeveB);
  root.add(pump);

  // ——— Action slide bars (thin metal beside tube) ———
  addMesh(new THREE.BoxGeometry(0.012, 0.012, 0.35), steelLite, 0.035, -0.055, -0.35);
  addMesh(new THREE.BoxGeometry(0.012, 0.012, 0.35), steelLite, -0.035, -0.055, -0.35);

  // ——— Hands ———
  // Firing hand on grip
  addMesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), skin, 0.08, -0.22, 0.1);
  addMesh(new THREE.BoxGeometry(0.05, 0.07, 0.045), skinShadow, 0.12, -0.2, 0.12);
  // Support hand on pump
  const handL = new THREE.Group();
  handL.position.set(-0.06, -0.14, -0.52);
  handL.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.1), skin));
  const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, 0.07), skinShadow);
  fingers.position.set(0.02, -0.03, 0);
  handL.add(fingers);
  handL.name = 'supportHand';
  root.add(handL);

  // ——— Muzzle flash (hidden until shot) ———
  const flash = new THREE.Group();
  flash.name = 'muzzleFlash';
  flash.position.set(0.0, -0.02, -1.28);
  flash.visible = false;
  const flashCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.95 })
  );
  flash.add(flashCore);
  const flashSpike = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.22, 8),
    new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.85 })
  );
  flashSpike.rotation.x = -Math.PI / 2;
  flashSpike.position.z = -0.08;
  flash.add(flashSpike);
  const flashSpike2 = flashSpike.clone();
  flashSpike2.scale.set(0.7, 0.7, 0.7);
  flashSpike2.rotation.z = Math.PI / 5;
  flash.add(flashSpike2);
  root.add(flash);

  // Hip rest (ADS lerps toward center)
  root.position.set(0.28, -0.32, -0.48);
  root.rotation.set(0.05, 0.08, 0.03);
  root.userData.pump = pump;
  root.userData.pumpRestZ = -0.52;
  root.userData.supportHand = handL;
  root.userData.muzzleFlash = flash;
  root.userData.hipPos = root.position.clone();
  root.userData.hipRot = root.rotation.clone();
  root.userData.adsPos = new THREE.Vector3(0.0, -0.2, -0.36);
  root.userData.adsRot = new THREE.Euler(0.0, 0.0, 0);
  root.userData.restPos = root.userData.hipPos.clone();
  root.userData.restRot = root.userData.hipRot.clone();
  return root;
}

function createFingerHand() {
  const root = new THREE.Group();
  root.name = 'tauntHand';

  const skin = 0xe8b896;
  const skinShadow = 0xd4a07a;
  const nail = 0xf5e6d8;
  const nailShine = 0xfff8f0;

  root.add(box(0.16, 0.12, 0.14, skinShadow, 0, -0.22, 0.02));
  root.add(box(0.18, 0.06, 0.16, 0x2a2a32, 0, -0.28, 0.02));

  root.add(box(0.2, 0.28, 0.1, skin, 0, 0, 0));
  root.add(box(0.18, 0.1, 0.08, skinShadow, 0, -0.1, 0.02));
  root.add(box(0.19, 0.06, 0.09, skinShadow, 0, 0.12, 0.01));

  function finger(x, baseLen, folded) {
    const g = new THREE.Group();
    g.position.set(x, 0.14, 0.02);
    if (folded) {
      g.add(box(0.045, baseLen * 0.45, 0.05, skin, 0, baseLen * 0.2, 0.02));
      const mid = box(0.042, baseLen * 0.35, 0.048, skin, 0, baseLen * 0.15, 0.06);
      mid.rotation.x = 1.1;
      mid.position.set(0, baseLen * 0.42, 0.04);
      g.add(mid);
      const tip = box(0.038, baseLen * 0.28, 0.042, skin, 0, 0, 0);
      tip.rotation.x = 1.4;
      tip.position.set(0, baseLen * 0.28, 0.1);
      g.add(tip);
      g.add(box(0.03, 0.02, 0.012, nail, 0, baseLen * 0.22, 0.13));
    } else {
      g.add(box(0.048, 0.14, 0.052, skin, 0, 0.08, 0));
      g.add(box(0.045, 0.13, 0.048, skin, 0, 0.2, 0));
      g.add(box(0.042, 0.11, 0.045, skin, 0, 0.31, 0));
      g.add(box(0.05, 0.03, 0.04, skinShadow, 0, 0.14, 0.02));
      g.add(box(0.048, 0.025, 0.038, skinShadow, 0, 0.26, 0.02));
      g.add(box(0.036, 0.055, 0.012, nail, 0, 0.355, 0.022));
      g.add(box(0.028, 0.02, 0.008, nailShine, 0, 0.37, 0.028));
      g.name = 'middle';
    }
    root.add(g);
    return g;
  }

  finger(-0.07, 0.2, true);
  finger(0.0, 0.28, false);
  finger(0.07, 0.2, true);
  finger(0.115, 0.16, true);

  const thumb = new THREE.Group();
  thumb.position.set(-0.12, -0.02, 0.04);
  thumb.rotation.set(0.3, 0, -0.9);
  thumb.add(box(0.05, 0.12, 0.055, skin, 0, 0.06, 0));
  thumb.add(box(0.045, 0.09, 0.05, skin, 0, 0.15, 0.02));
  thumb.add(box(0.032, 0.04, 0.012, nail, 0, 0.2, 0.04));
  root.add(thumb);

  const ringGroup = new THREE.Group();
  ringGroup.name = 'davidssterRing';
  ringGroup.position.set(0.072, 0.165, 0.06);

  const goldMat = mat(0xd4af37, { emissive: 0xaa8800, emissiveIntensity: 0.35 });
  const silverMat = mat(0xc0c0c8, { emissive: 0x666688, emissiveIntensity: 0.15 });
  const starFill = mat(0xf5e6b8, { emissive: 0xccaa44, emissiveIntensity: 0.4 });
  const starStroke = mat(0x5a4010);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 10, 20), goldMat);
  band.rotation.x = Math.PI / 2;
  ringGroup.add(band);
  const bandEdge = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0045, 8, 18), silverMat);
  bandEdge.rotation.x = Math.PI / 2;
  bandEdge.position.y = 0.003;
  ringGroup.add(bandEdge);

  const starRoot = new THREE.Group();
  starRoot.position.set(0, 0.02, 0);
  starRoot.scale.setScalar(1.35);

  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), goldMat);
  disc.position.z = 0.006;
  starRoot.add(disc);

  function hexTriangle(radius, material, z, up) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2 + (up ? 0 : Math.PI);
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
    mesh.position.z = z;
    return mesh;
  }

  starRoot.add(hexTriangle(0.026, starStroke, 0.008, true));
  starRoot.add(hexTriangle(0.026, starStroke, 0.0085, false));
  starRoot.add(hexTriangle(0.022, starFill, 0.011, true));
  starRoot.add(hexTriangle(0.022, starFill, 0.0115, false));

  ringGroup.add(starRoot);
  root.add(ringGroup);

  root.position.set(0.38, -0.48, -0.45);
  root.rotation.set(-0.35, -0.25, 0.45);
  root.visible = false;
  root.userData.restPos = root.position.clone();
  root.userData.restRot = root.rotation.clone();
  return root;
}

/**
 * Classic FPS player — Call of Duty style:
 * mouse look (pointer lock OR unlocked client deltas), WASD, sprint, ADS,
 * fixed center crosshair (aim = camera center).
 */
export class Player {
  constructor(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;
    this.camera.rotation.order = 'YXZ';
    this.yaw = 0;
    this.pitch = 0;
    this._yawSmooth = 0;
    this._pitchSmooth = 0;
    this._lookDx = 0;
    this._lookDy = 0;
    this._lookLocked = false; // true = last deltas came from pointer lock
    this._lastClientX = 0;
    this._lastClientY = 0;
    this._hasLastClient = false;
    this.position = new THREE.Vector3(0, EYE, 0);
    this.velocity = new THREE.Vector3();
    this.vy = 0;
    this.grounded = true;
    this.keys = Object.create(null);
    this.hp = MAX_HP;
    this.maxHp = MAX_HP;
    this.fireTimer = 0;
    this.pumpTimer = 0;
    this.reloadTimer = 0;
    this.shells = MAG_SIZE;
    this.enabled = false;
    this.ads = false;
    this.adsAmount = 0;
    this.fovCurrent = FOV_HIP;
    this._onShoot = null;
    this._onTaunt = null;
    this._pendingReload = false;
    this._wantLock = false;
    this._escUnlock = false; // true only when Esc intentionally unlocked

    this.shotgun = createShotgun();
    this.tauntHand = createFingerHand();
    this.camera.add(this.shotgun);
    this.camera.add(this.tauntHand);

    this.recoil = 0;
    this.tauntTimer = 0;
    this.taunting = false;

    this.crosshairEl = document.getElementById('crosshair');
    this.hitMarkerEl = document.getElementById('hit-marker');
    this._raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2(0, 0);
    this._bobPhase = 0;

    this._onKeyDown = (e) => {
      this.keys[e.code] = true;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'KeyF' && this.enabled) {
        e.preventDefault();
        this.startTaunt();
      }
      if (e.code === 'KeyR' && this.enabled) {
        e.preventDefault();
        this.startReload();
      }
      if (e.code === 'Escape') {
        this._escUnlock = true;
      }
    };
    this._onKeyUp = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyF') this.endTaunt();
    };
    this._onMouseMove = (e) => {
      if (!this.enabled) return;
      const locked = document.pointerLockElement === this.dom;
      if (locked) {
        // Prefer unadjusted movement when browser provides it via pointer lock
        this._lookDx += e.movementX || 0;
        this._lookDy += e.movementY || 0;
        this._lookLocked = true;
        this._hasLastClient = false;
        return;
      }
      // Unlocked fallback (remote desktop / preview): clientX/Y deltas
      if (this._hasLastClient) {
        this._lookDx += e.clientX - this._lastClientX;
        this._lookDy += e.clientY - this._lastClientY;
        this._lookLocked = false;
      }
      this._lastClientX = e.clientX;
      this._lastClientY = e.clientY;
      this._hasLastClient = true;
    };
    this._onMouseDown = (e) => {
      if (!this.enabled) return;
      // Prefer pointer lock, but never block shoot/look if it fails or drops
      if (document.pointerLockElement !== this.dom) {
        this.requestLock();
        this._hasLastClient = false; // avoid jump after lock request
      }
      if (e.button === 0) {
        e.preventDefault();
        this.tryShoot();
      }
      if (e.button === 2) {
        e.preventDefault();
        this.ads = true;
      }
    };
    this._onMouseUp = (e) => {
      if (e.button === 2) this.ads = false;
    };
    this._onContext = (e) => e.preventDefault();
    this._onLockChange = () => {
      // Avoid a look jump when lock is gained/lost mid-drag
      this._hasLastClient = false;
      this._lookDx = 0;
      this._lookDy = 0;
      // Esc / pause handled by main.js via isLocked / consumeEscUnlock
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    this.dom.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    this.dom.addEventListener('contextmenu', this._onContext);
    document.addEventListener('pointerlockchange', this._onLockChange);
  }

  get isLocked() {
    return document.pointerLockElement === this.dom;
  }

  /** Consume Esc-unlock flag (true = intentional pause) */
  consumeEscUnlock() {
    const v = this._escUnlock;
    this._escUnlock = false;
    return v;
  }

  requestLock() {
    this._wantLock = true;
    this._escUnlock = false;
    if (document.pointerLockElement === this.dom) return;
    try {
      const p = this.dom.requestPointerLock?.({ unadjustedMovement: true });
      if (p && typeof p.catch === 'function') {
        p.catch(() => this.dom.requestPointerLock?.());
      }
    } catch (_) {
      this.dom.requestPointerLock?.();
    }
  }

  releaseLock() {
    this._wantLock = false;
    if (document.pointerLockElement) document.exitPointerLock();
  }

  onShoot(cb) {
    this._onShoot = cb;
  }

  onTaunt(cb) {
    this._onTaunt = cb;
  }

  reset(start, yaw = 0) {
    this.position.copy(start);
    this.position.y = EYE;
    this.yaw = yaw;
    this.pitch = 0;
    this._yawSmooth = yaw;
    this._pitchSmooth = 0;
    this._lookDx = 0;
    this._lookDy = 0;
    this._lookLocked = false;
    this._hasLastClient = false;
    this.velocity.set(0, 0, 0);
    this.vy = 0;
    this.grounded = true;
    this.hp = MAX_HP;
    this.fireTimer = 0;
    this.pumpTimer = 0;
    this.reloadTimer = 0;
    this.shells = MAG_SIZE;
    this.recoil = 0;
    this.tauntTimer = 0;
    this.taunting = false;
    this._pendingReload = false;
    this.ads = false;
    this.adsAmount = 0;
    this.fovCurrent = FOV_HIP;
    this.keys = Object.create(null);
    this.shotgun.visible = true;
    this.tauntHand.visible = false;
    this.shotgun.rotation.z = this.shotgun.userData.hipRot.z;
    this.syncCamera();
  }

  startReload() {
    if (this.reloadTimer > 0 || this.pumpTimer > 0 || this.shells >= MAG_SIZE) return;
    if (this.taunting) return;
    this.reloadTimer = RELOAD_TIME;
  }

  startTaunt() {
    if (!this.enabled || this.hp <= 0 || this.reloadTimer > 0) return;
    if (this.taunting) return;
    this.taunting = true;
    this.tauntTimer = 0.9;
    this.ads = false;
    this.shotgun.visible = false;
    this.tauntHand.visible = true;
    this.tauntHand.position.set(0.12, -0.28, -0.38);
    this.tauntHand.rotation.set(-0.15, 0.05, 0.15);
    this.tauntHand.scale.setScalar(1);
    if (this._onTaunt) this._onTaunt();
  }

  endTaunt() {
    if (!this.taunting && !this.tauntHand.visible) return;
    if (this.tauntTimer > 0.15) return;
    this.taunting = false;
    this.tauntHand.visible = false;
    this.shotgun.visible = true;
  }

  /** Center-screen aim ray (CoD crosshair) */
  getAimRay() {
    this._ndc.set(0, 0);
    this._raycaster.setFromCamera(this._ndc, this.camera);
    return {
      origin: this._raycaster.ray.origin.clone(),
      direction: this._raycaster.ray.direction.clone(),
    };
  }

  tryShoot() {
    if (!this.enabled || this.hp <= 0) return;
    if (this.taunting || this.pumpTimer > 0 || this.reloadTimer > 0) return;
    if (this.fireTimer > 0) return;

    if (this.shells <= 0) {
      this.startReload();
      return;
    }

    this.shells -= 1;
    this.fireTimer = 0.07;
    this.pumpTimer = PUMP_TIME;
    this.recoil = 1;

    const flash = this.shotgun.userData.muzzleFlash;
    if (flash) {
      flash.visible = true;
      flash.scale.setScalar(1.1 + Math.random() * 0.6);
      flash.rotation.z = Math.random() * Math.PI;
      clearTimeout(this._flashHide);
      this._flashHide = setTimeout(() => {
        flash.visible = false;
        flash.scale.setScalar(1);
      }, 55);
    }

    const { origin, direction } = this.getAimRay();
    const forward = direction;
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    const spread = THREE.MathUtils.lerp(SPREAD_HIP, SPREAD_ADS, this.adsAmount);
    const pellets = [];
    for (let i = 0; i < PELLET_COUNT; i++) {
      const dir = forward.clone();
      const ax = (Math.random() - 0.5) * 2 * spread;
      const ay = (Math.random() - 0.5) * 2 * spread;
      dir.addScaledVector(right, ax).addScaledVector(up, ay).normalize();
      pellets.push(dir);
    }

    if (this._onShoot) this._onShoot(origin, pellets, RANGE);

    if (this.shells <= 0) {
      this._pendingReload = true;
    }
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  syncCamera() {
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this._yawSmooth;
    this.camera.rotation.x = this._pitchSmooth;
    this.camera.fov = this.fovCurrent;
    this.camera.updateProjectionMatrix();
  }

  updateViewmodels(dt, moving) {
    const sg = this.shotgun;
    const hip = sg.userData.hipPos;
    const adsP = sg.userData.adsPos;
    const a = this.adsAmount;
    const bobAmp = moving ? 0.012 * (1 - a * 0.85) : 0.004;
    const bob = Math.sin(this._bobPhase) * bobAmp;
    const kick = this.recoil;

    const tx = THREE.MathUtils.lerp(hip.x, adsP.x, a);
    const ty = THREE.MathUtils.lerp(hip.y, adsP.y, a);
    const tz = THREE.MathUtils.lerp(hip.z, adsP.z, a);

    sg.position.set(
      tx + kick * 0.03 * (1 - a * 0.5),
      ty - kick * 0.045 + bob,
      tz + kick * 0.09
    );
    sg.rotation.x = THREE.MathUtils.lerp(sg.userData.hipRot.x, sg.userData.adsRot.x, a) - kick * 0.28;
    sg.rotation.y = THREE.MathUtils.lerp(sg.userData.hipRot.y, sg.userData.adsRot.y, a);
    sg.rotation.z = THREE.MathUtils.lerp(sg.userData.hipRot.z, sg.userData.adsRot.z, a);
    this.recoil = Math.max(0, this.recoil - dt * 4.5);

    const pump = sg.userData.pump;
    if (pump) {
      const t = this.pumpTimer > 0 ? this.pumpTimer / PUMP_TIME : 0;
      // Rack back then forward
      let slide = 0;
      if (t > 0) {
        slide = t > 0.5 ? (1 - t) * 2.0 : t * 1.5;
        slide = Math.min(1, slide);
      }
      const rest = sg.userData.pumpRestZ ?? -0.52;
      pump.position.z = rest + slide * 0.18;
      const hand = sg.userData.supportHand;
      if (hand) {
        hand.position.z = pump.position.z;
        hand.position.y = -0.14 - slide * 0.02;
      }
    }

    const flash = sg.userData.muzzleFlash;
    if (flash && flash.visible) {
      flash.rotation.z += dt * 18;
      flash.scale.multiplyScalar(Math.max(0.1, 1 - dt * 14));
    }

    if (this.tauntHand.visible) {
      const u = Math.min(1, (0.9 - this.tauntTimer) / 0.22);
      this.tauntHand.position.lerp(new THREE.Vector3(0.02, -0.08, -0.32), 0.18);
      this.tauntHand.rotation.x = -0.1;
      this.tauntHand.rotation.y = 0.05 + Math.sin(performance.now() * 0.015) * 0.03;
      this.tauntHand.rotation.z = 0.08;
      this.tauntHand.scale.setScalar(1.05 + u * 0.35);
    }

    // Crosshair ADS tighten
    if (this.crosshairEl) {
      this.crosshairEl.classList.toggle('ads', a > 0.5);
    }
  }

  update(dt, colliders, bounds) {
    if (!this.enabled || this.hp <= 0) {
      this.syncCamera();
      return;
    }

    // —— Look (lock: movementX/Y; unlocked: client deltas) ——
    let dx = this._lookDx;
    let dy = this._lookDy;
    this._lookDx = 0;
    this._lookDy = 0;
    const sens = this._lookLocked ? MOUSE_SENS : MOUSE_SENS_FREE;
    this.yaw -= dx * sens;
    this.pitch -= dy * sens;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.45, 1.45);

    if (MOUSE_SMOOTH > 0) {
      const k = 1 - Math.pow(MOUSE_SMOOTH, dt * 60);
      this._yawSmooth += (this.yaw - this._yawSmooth) * k;
      this._pitchSmooth += (this.pitch - this._pitchSmooth) * k;
    } else {
      this._yawSmooth = this.yaw;
      this._pitchSmooth = this.pitch;
    }

    // —— ADS ——
    const wantAds = this.ads && !this.taunting && this.reloadTimer <= 0;
    this.adsAmount = THREE.MathUtils.clamp(
      this.adsAmount + (wantAds ? 1 : -1) * dt * 8,
      0,
      1
    );

    this.fireTimer = Math.max(0, this.fireTimer - dt);
    this.pumpTimer = Math.max(0, this.pumpTimer - dt);
    if (this.reloadTimer > 0) {
      this.reloadTimer = Math.max(0, this.reloadTimer - dt);
      this.shotgun.rotation.z = 0.4;
      if (this.reloadTimer === 0) {
        this.shells = MAG_SIZE;
        this.shotgun.rotation.z = this.shotgun.userData.hipRot.z;
      }
    } else if (this._pendingReload && this.pumpTimer <= 0) {
      this._pendingReload = false;
      this.startReload();
    }

    if (this.tauntTimer > 0) {
      this.tauntTimer = Math.max(0, this.tauntTimer - dt);
      if (this.tauntTimer === 0 && !this.keys.KeyF) {
        this.taunting = false;
        this.tauntHand.visible = false;
        this.shotgun.visible = true;
      }
    }

    // —— Movement ——
    const forward = new THREE.Vector3(-Math.sin(this._yawSmooth), 0, -Math.cos(this._yawSmooth));
    const right = new THREE.Vector3(Math.cos(this._yawSmooth), 0, -Math.sin(this._yawSmooth));
    const wish = new THREE.Vector3();
    if (this.keys.KeyW) wish.add(forward);
    if (this.keys.KeyS) wish.sub(forward);
    if (this.keys.KeyD) wish.add(right);
    if (this.keys.KeyA) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize();

    const sprinting =
      (this.keys.ShiftLeft || this.keys.ShiftRight) &&
      this.keys.KeyW &&
      this.adsAmount < 0.3 &&
      this.grounded;
    let maxSpeed = SPEED;
    if (sprinting) maxSpeed *= SPRINT_MULT;
    maxSpeed *= THREE.MathUtils.lerp(1, ADS_MOVE_MULT, this.adsAmount);

    const target = wish.multiplyScalar(maxSpeed);
    const horiz = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
    const rate = (wish.lengthSq() > 0 ? ACCEL : DECEL) * dt;
    horiz.x += (target.x - horiz.x) * Math.min(1, rate);
    horiz.z += (target.z - horiz.z) * Math.min(1, rate);
    if (wish.lengthSq() === 0 && horiz.lengthSq() < 0.01) horiz.set(0, 0, 0);
    this.velocity.x = horiz.x;
    this.velocity.z = horiz.z;

    // Jump
    if (this.keys.Space && this.grounded) {
      this.vy = JUMP_VEL;
      this.grounded = false;
      this.keys.Space = false; // one-shot
    }
    this.vy -= GRAVITY * dt;
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.position.y += this.vy * dt;

    if (this.position.y <= EYE) {
      this.position.y = EYE;
      this.vy = 0;
      this.grounded = true;
    }

    resolveCollision(this.position, RADIUS, colliders);
    this.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.position.x));
    this.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.position.z));
    if (this.position.y < EYE) this.position.y = EYE;

    const moving = horiz.lengthSq() > 0.4;
    if (moving && this.grounded) {
      this._bobPhase += dt * (sprinting ? 14 : 10);
    }

    // FOV: hip / ADS / subtle sprint kick
    let targetFov = THREE.MathUtils.lerp(FOV_HIP, FOV_ADS, this.adsAmount);
    if (sprinting) targetFov += FOV_SPRINT_KICK;
    this.fovCurrent += (targetFov - this.fovCurrent) * Math.min(1, FOV_LERP * dt);

    this.syncCamera();
    this.updateViewmodels(dt, moving);
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    this.dom.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.dom.removeEventListener('contextmenu', this._onContext);
    document.removeEventListener('pointerlockchange', this._onLockChange);
  }
}

export const PLAYER_TUNING = {
  MOUSE_SENS,
  MOUSE_SENS_FREE,
  MOUSE_SMOOTH,
  FOV_HIP,
  FOV_ADS,
  SPREAD_HIP,
  SPREAD_ADS,
};
