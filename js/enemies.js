import * as THREE from 'three';

const ORANGE = 0xff6a00;
const ORANGE_BRIGHT = 0xff8c1a;
const BLACK = 0x1a1a1a;
const VEST = 0xff5e00;
const SKIN = 0xc4a882;
const PAINT_COLORS = [0xff3300, 0x2244cc, 0xffee00, 0x00cc55, 0xff00aa, 0xff8800, 0x00e5ff];

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

/**
 * Readable XR-style protestor — clearer silhouette, orange vest glow, banner.
 */
export function createProtestor() {
  const root = new THREE.Group();
  root.name = 'protestor';

  const matBlack = std(BLACK, { roughness: 0.85 });
  const matOrange = std(ORANGE, { roughness: 0.55, emissive: 0xcc4400, emissiveIntensity: 0.4 });
  const matVest = std(VEST, { roughness: 0.5, emissive: 0xaa3300, emissiveIntensity: 0.5 });
  const matSkin = std(SKIN, { roughness: 0.75 });
  const matBoot = std(0x111111, { roughness: 0.9 });
  const matHood = std(ORANGE_BRIGHT, { roughness: 0.6, emissive: 0xbb3300, emissiveIntensity: 0.25 });

  function limb(rTop, rBot, h, material) {
    return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8), material);
  }

  // Legs
  const legL = limb(0.07, 0.085, 0.55, matBlack);
  legL.position.set(-0.14, 0.36, 0);
  root.add(legL);
  const legR = limb(0.07, 0.085, 0.55, matBlack);
  legR.position.set(0.14, 0.36, 0);
  root.add(legR);
  // Boots
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28), matBoot);
  bootL.position.set(-0.14, 0.07, 0.04);
  root.add(bootL);
  const bootR = bootL.clone();
  bootR.position.x = 0.14;
  root.add(bootR);

  // Hips / torso (rounded)
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.22, 10), matBlack);
  hips.position.y = 0.72;
  root.add(hips);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.55, 10), matBlack);
  torso.position.y = 1.1;
  root.add(torso);

  // Hi-vis vest shell
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.25, 0.5, 10), matVest);
  vest.position.y = 1.12;
  root.add(vest);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 16), matOrange);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 1.28;
  root.add(stripe);
  const stripe2 = stripe.clone();
  stripe2.position.y = 0.98;
  root.add(stripe2);
  // Reflective X
  const x1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.42, 0.04),
    std(0xffee88, { emissive: 0xffaa00, emissiveIntensity: 0.55 })
  );
  x1.position.set(0, 1.12, 0.26);
  x1.rotation.z = 0.5;
  root.add(x1);
  const x2 = x1.clone();
  x2.rotation.z = -0.5;
  root.add(x2);

  // Arms
  const armL = limb(0.055, 0.065, 0.5, matBlack);
  armL.position.set(-0.38, 1.05, 0);
  armL.rotation.z = 0.2;
  root.add(armL);
  const armR = limb(0.055, 0.065, 0.5, matBlack);
  armR.position.set(0.38, 1.05, 0.05);
  armR.rotation.z = -0.25;
  root.add(armR);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), matSkin);
  handL.position.set(-0.42, 0.78, 0.02);
  root.add(handL);
  const handR = handL.clone();
  handR.position.set(0.45, 0.8, 0.12);
  root.add(handR);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), matSkin);
  head.position.y = 1.58;
  root.add(head);
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), matBlack);
  mask.position.set(0, 1.52, 0.04);
  mask.rotation.x = 0.15;
  root.add(mask);
  const eyeMat = std(0xffcc44, { emissive: 0xffaa00, emissiveIntensity: 0.9 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), eyeMat);
  eyeL.position.set(-0.06, 1.58, 0.14);
  root.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;
  root.add(eyeR);

  // Hood
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65), matHood);
  hood.position.set(0, 1.68, -0.02);
  root.add(hood);
  const hoodBack = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), matHood);
  hoodBack.position.set(0, 1.55, -0.12);
  root.add(hoodBack);

  // Banner
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 6), std(0x5a4030, { roughness: 0.8 }));
  pole.position.set(0.55, 1.35, 0.1);
  root.add(pole);
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.38, 0.04),
    std(ORANGE_BRIGHT, { roughness: 0.55, emissive: 0xcc4400, emissiveIntensity: 0.35 })
  );
  banner.position.set(0.55, 1.88, 0.1);
  root.add(banner);
  const bannerText = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.03), std(0x111111, { roughness: 0.9 }));
  bannerText.position.set(0.55, 1.92, 0.13);
  root.add(bannerText);

  // Soft read halo
  let haloGeo;
  try {
    haloGeo = new THREE.CapsuleGeometry(0.42, 1.1, 4, 8);
  } catch (e) {
    haloGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.7, 10);
  }
  const halo = new THREE.Mesh(
    haloGeo,
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.06, depthWrite: false })
  );
  halo.position.y = 1.0;
  root.add(halo);

  root.userData.hitRadius = 0.82;
  root.userData.height = 1.85;
  return root;
}

export function createPaintBlob(color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 8),
    new THREE.MeshStandardMaterial({
      color: color ?? PAINT_COLORS[0],
      roughness: 0.35,
      metalness: 0.1,
      emissive: color ?? PAINT_COLORS[0],
      emissiveIntensity: 0.25,
    })
  );
  return mesh;
}

/** Bigger, more readable paint-splat burst */
export function spawnPaintSplat(scene, position, color) {
  const parts = [];
  const n = 10 + Math.floor(Math.random() * 6);
  const c = color ?? PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
  for (let i = 0; i < n; i++) {
    const size = 0.1 + Math.random() * 0.18;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 6, 5),
      new THREE.MeshStandardMaterial({
        color: c,
        transparent: true,
        opacity: 0.95,
        roughness: 0.4,
        emissive: c,
        emissiveIntensity: 0.35,
      })
    );
    mesh.position.copy(position);
    mesh.position.x += (Math.random() - 0.5) * 0.35;
    mesh.position.y += (Math.random() - 0.5) * 0.35;
    mesh.position.z += (Math.random() - 0.5) * 0.35;
    scene.add(mesh);
    parts.push({
      mesh,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 5.5,
        1.5 + Math.random() * 4,
        (Math.random() - 0.5) * 5.5
      ),
      life: 0.45 + Math.random() * 0.4,
    });
  }
  // Flat splat disc on impact feel
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.35 + Math.random() * 0.25, 10),
    new THREE.MeshStandardMaterial({
      color: c,
      transparent: true,
      opacity: 0.7,
      roughness: 0.9,
      side: THREE.DoubleSide,
      emissive: c,
      emissiveIntensity: 0.2,
    })
  );
  disc.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
  disc.position.copy(position);
  disc.position.y = Math.max(0.05, position.y - 0.3);
  scene.add(disc);
  parts.push({
    mesh: disc,
    vel: new THREE.Vector3(0, 0, 0),
    life: 0.7,
  });
  return parts;
}

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.projectiles = [];
    this.splats = [];
    this.spawns = [];
    this.wave = 0;
    this.maxWaves = 5;
    this.alive = 0;
    this.totalKills = 0;
    this._spawnCooldown = 0;
    this._waveClearDelay = 0;
    this._pendingWave = false;
  }

  setSpawns(spawns) {
    this.spawns = spawns.map((v) => v.clone());
  }

  getAliveTargets() {
    return this.enemies
      .filter((e) => e.alive)
      .map((e) => ({ position: e.mesh.position, alive: true }));
  }

  clearAll() {
    for (const e of this.enemies) this.scene.remove(e.mesh);
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    for (const s of this.splats) this.scene.remove(s.mesh);
    this.enemies = [];
    this.projectiles = [];
    this.splats = [];
    this.alive = 0;
    this.wave = 0;
    this.totalKills = 0;
    this._spawnCooldown = 0;
    this._waveClearDelay = 0;
    this._pendingWave = false;
  }

  startWaves() {
    this.clearAll();
    this.wave = 0;
    this._pendingWave = true;
    this._waveClearDelay = 0.5;
  }

  enemiesPerWave(wave) {
    return Math.min(this.spawns.length, 3 + wave + Math.floor(wave / 2));
  }

  spawnWave() {
    this.wave += 1;
    const count = this.enemiesPerWave(this.wave);
    let idxs;
    if (this.wave === 1) {
      // Prefer plaza / entrance (high Z) so Start → immediate action
      idxs = [...Array(this.spawns.length).keys()]
        .sort((a, b) => this.spawns[b].z - this.spawns[a].z)
        .slice(0, count);
    } else {
      idxs = shuffledIndices(this.spawns.length).slice(0, count);
    }
    for (const i of idxs) {
      this.spawnAt(this.spawns[i]);
    }
    this._pendingWave = false;
  }

  spawnAt(pos) {
    const mesh = createProtestor();
    mesh.position.set(pos.x, 0, pos.z);
    this.scene.add(mesh);
    const enemy = {
      mesh,
      hp: 2 + Math.floor(this.wave / 2),
      maxHp: 2 + Math.floor(this.wave / 2),
      throwTimer: 1.2 + Math.random() * 1.8,
      stunTimer: 0,
      bobPhase: Math.random() * Math.PI * 2,
      alive: true,
      scoreValue: 100 + this.wave * 25,
    };
    this.enemies.push(enemy);
    this.alive += 1;
    return enemy;
  }

  rayHit(origin, dir, maxDist = 60) {
    let best = null;
    let bestDist = maxDist;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const center = e.mesh.position.clone();
      center.y = 1.05;
      const to = center.clone().sub(origin);
      const t = to.dot(dir);
      if (t < 0 || t > bestDist) continue;
      const closest = origin.clone().addScaledVector(dir, t);
      const dist = closest.distanceTo(center);
      if (dist < e.mesh.userData.hitRadius + 0.25) {
        bestDist = t;
        best = { enemy: e, distance: t };
      }
    }
    return best;
  }

  damageEnemy(enemy, amount = 1) {
    if (!enemy.alive) return false;
    enemy.hp -= amount;
    const hitPos = enemy.mesh.position.clone();
    hitPos.y = 1.25;
    const col = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    this.splats.push(...spawnPaintSplat(this.scene, hitPos, col));

    enemy.mesh.traverse((c) => {
      if (c.isMesh && c.material && c.material.color && !c.material.transparent) {
        const orig = c.material.color.getHex();
        c.material.color.setHex(0xffffff);
        if (c.material.emissive) c.material.emissive.setHex(0xffffff);
        setTimeout(() => {
          if (c.material) {
            c.material.color.setHex(orig);
          }
        }, 70);
      }
    });
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
      return true;
    }
    return false;
  }

  killEnemy(enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;
    this.alive = Math.max(0, this.alive - 1);
    this.totalKills += 1;
    const p = enemy.mesh.position.clone();
    p.y = 1.0;
    this.splats.push(...spawnPaintSplat(this.scene, p, ORANGE));
    this.splats.push(...spawnPaintSplat(this.scene, p, 0x222222));
    this.scene.remove(enemy.mesh);
  }

  throwPaint(enemy, targetPos) {
    const color = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    const mesh = createPaintBlob(color);
    const start = enemy.mesh.position.clone();
    start.y = 1.4;
    mesh.position.copy(start);
    this.scene.add(mesh);

    const aim = targetPos.clone();
    aim.y = 1.5;
    const vel = aim.sub(start);
    const dist = vel.length();
    vel.normalize();
    const speed = Math.min(14, 8 + dist * 0.35);
    vel.multiplyScalar(speed);
    vel.y += 2.2 + Math.random() * 1.5;

    this.projectiles.push({
      mesh,
      vel,
      life: 3.5,
      damage: 12 + this.wave * 2,
      radius: 0.3,
    });
  }

  stunNear(playerPos, radius = 14, duration = 1.4) {
    let n = 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(playerPos.x - e.mesh.position.x, playerPos.z - e.mesh.position.z);
      if (d > radius) continue;
      e.stunTimer = Math.max(e.stunTimer || 0, duration);
      e.throwTimer = Math.max(e.throwTimer, duration + 0.3);
      e.mesh.traverse((c) => {
        if (c.isMesh && c.material && c.material.color) {
          c.userData._preStun = c.material.color.getHex();
          c.material.color.offsetHSL(0, 0, 0.2);
        }
      });
      n += 1;
    }
    return n;
  }

  update(dt, playerPos) {
    let playerHit = 0;

    if (this._pendingWave) {
      this._waveClearDelay -= dt;
      if (this._waveClearDelay <= 0) this.spawnWave();
    }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        e.bobPhase += dt * 1.2;
        e.mesh.position.y = Math.sin(e.bobPhase) * 0.02;
        e.mesh.rotation.y += dt * 0.8;
        if (e.stunTimer <= 0) {
          e.stunTimer = 0;
          e.mesh.traverse((c) => {
            if (c.isMesh && c.material && c.material.color && c.userData._preStun != null) {
              c.material.color.setHex(c.userData._preStun);
              delete c.userData._preStun;
            }
          });
        }
        continue;
      }
      e.bobPhase += dt * 3;
      e.mesh.position.y = Math.sin(e.bobPhase) * 0.04;

      const dx = playerPos.x - e.mesh.position.x;
      const dz = playerPos.z - e.mesh.position.z;
      e.mesh.rotation.y = Math.atan2(dx, dz);

      e.throwTimer -= dt;
      if (e.throwTimer <= 0) {
        const dist = Math.hypot(dx, dz);
        if (dist < 28) {
          this.throwPaint(e, playerPos);
        }
        e.throwTimer = Math.max(0.9, 2.4 - this.wave * 0.2) + Math.random() * 1.2;
      }
    }

    const gravity = 9.5;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.vel.y -= gravity * dt;
      p.mesh.position.x += p.vel.x * dt;
      p.mesh.position.y += p.vel.y * dt;
      p.mesh.position.z += p.vel.z * dt;
      p.life -= dt;

      const toPlayer = playerPos.clone().sub(p.mesh.position);
      const hitY = Math.abs(toPlayer.y - 0.1) < 1.2;
      const hitXZ = Math.hypot(toPlayer.x, toPlayer.z) < p.radius + 0.4;
      if (hitY && hitXZ && p.mesh.position.y > 0.3) {
        playerHit += p.damage;
        this.splats.push(
          ...spawnPaintSplat(this.scene, p.mesh.position.clone(), p.mesh.material.color.getHex())
        );
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life <= 0 || p.mesh.position.y < -0.5) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.splats.length - 1; i >= 0; i--) {
      const s = this.splats[i];
      s.vel.y -= 14 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.life -= dt;
      if (s.mesh.material) {
        s.mesh.material.opacity = Math.max(0, s.life * 2);
      }
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        if (s.mesh.material) s.mesh.material.dispose();
        this.splats.splice(i, 1);
      }
    }

    this.enemies = this.enemies.filter((e) => e.alive);

    let allDone = false;
    let cleared = false;
    if (!this._pendingWave && this.alive === 0 && this.wave > 0) {
      if (this.wave >= this.maxWaves) {
        allDone = true;
      } else {
        cleared = true;
        this._pendingWave = true;
        this._waveClearDelay = 1.6;
      }
    }

    return { playerHit, waveCleared: cleared, allDone, killScore: 0, wave: this.wave, alive: this.alive };
  }
}

function shuffledIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
