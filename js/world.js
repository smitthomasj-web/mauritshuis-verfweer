import * as THREE from 'three';

/**
 * Mauritshuis FPS world — Jacob van Campen Hollands classicisme exterior +
 * curated galleries. Sandstone palace, kolossale orde, pediment, Hofvijver.
 */

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    flatShading: opts.flatShading ?? false,
  });
}

export function buildWorld(scene) {
  const colliders = [];
  const group = new THREE.Group();
  group.name = 'museum';

  // —— Palette: warm classical Hague palace ——
  const matStone = std(0xe2d2b4, { roughness: 0.82 });
  const matStoneWarm = std(0xdcc4a0, { roughness: 0.78 });
  const matStoneDark = std(0xb89a72, { roughness: 0.75 });
  const matStoneDeep = std(0x9a7e58, { roughness: 0.7 });
  const matRoof = std(0x3d4550, { roughness: 0.55, metalness: 0.15 });
  const matRoofCopper = std(0x4a5a48, { roughness: 0.6, metalness: 0.2 });
  const matGold = std(0xd4af37, { roughness: 0.35, metalness: 0.65, emissive: 0x664400, emissiveIntensity: 0.15 });
  const matGoldBright = std(0xf0d060, { roughness: 0.3, metalness: 0.7, emissive: 0xaa7700, emissiveIntensity: 0.25 });
  const matGlass = std(0x9ec8e8, { roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.42 });
  const matGlassDark = std(0x6a90b0, { roughness: 0.2, metalness: 0.4, transparent: true, opacity: 0.55 });
  const matDoor = std(0x2c1810, { roughness: 0.55, metalness: 0.1 });
  const matPavement = std(0x8e8e96, { roughness: 0.9 });
  const matPavementLight = std(0xa8a8b0, { roughness: 0.88 });
  const matGrass = std(0x4a7a3a, { roughness: 0.95 });
  const matWater = std(0x1e5a7a, { roughness: 0.08, metalness: 0.72, transparent: true, opacity: 0.82, emissive: 0x0a2030, emissiveIntensity: 0.12 });
  const matWall = std(0xf0e6d4, { roughness: 0.88 });
  const matWallAccent = std(0xe8d8c0, { roughness: 0.85 });
  const matWallGallery = std(0xe4d5bc, { roughness: 0.86 });
  const matFloor = std(0x8b6914, { roughness: 0.55, metalness: 0.08 });
  const matFloorLight = std(0xa67c2a, { roughness: 0.5, metalness: 0.1 });
  const matFloorDark = std(0x6b4e10, { roughness: 0.58 });
  const matCeil = std(0xfaf6ee, { roughness: 0.92 });
  const matTrim = std(0xc4a574, { roughness: 0.6, metalness: 0.15 });
  const matFrame = std(0x3a2414, { roughness: 0.45, metalness: 0.2 });
  const matFrameGold = std(0xc9a227, { roughness: 0.32, metalness: 0.7, emissive: 0x553300, emissiveIntensity: 0.12 });
  const matPillar = std(0xf2e8d8, { roughness: 0.7 });
  const matLamp = std(0xffe8a0, { roughness: 0.4, emissive: 0xffcc66, emissiveIntensity: 0.7 });
  const matRug = std(0x7a2222, { roughness: 0.95 });
  const matRugGold = std(0xc9a040, { roughness: 0.7, metalness: 0.25 });
  const matRed = std(0xc8102e, { roughness: 0.55 });
  const matWhite = std(0xf8f8f4, { roughness: 0.7 });
  const matBlue = std(0x21468b, { roughness: 0.55 });
  const matVelvet = std(0x5a1a1a, { roughness: 0.92 });
  const matChair = std(0x4a3020, { roughness: 0.6 });
  const matPedestal = std(0xe8dcc8, { roughness: 0.65 });
  const matSkyHint = std(0xb8d4f0, { roughness: 1 });

  const paintPalettes = [
    [0x1a3a6e, 0xd4a84b, 0xf2e8c8, 0x2a1a0a],
    [0x8b4513, 0x2d1a0a, 0xc4a070, 0x1a1008],
    [0x2d5a27, 0xa8c878, 0xf0e8d0, 0x1a2a10],
    [0x5c1a1a, 0xd48050, 0xe8d0b0, 0x2a1008],
    [0x4a3060, 0xc8a0d0, 0xe8e0f0, 0x1a1020],
    [0x2a4a6a, 0x80b0d0, 0xf0f4f8, 0x0a1520],
    [0x3a2a1a, 0xc9a227, 0xf5ecd8, 0x1a1208],
    [0x1a1a2e, 0xf5d76e, 0xe8e0d0, 0x0a0a14],
  ];

  function addBox(w, h, d, x, y, z, mat, solid = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add(mesh);
    if (solid) {
      colliders.push({
        min: new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
        max: new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2),
      });
    }
    return mesh;
  }

  function wallAlongX(x0, x1, z, y0, y1, doorGaps = [], mat = matWall) {
    const h = y1 - y0;
    const cy = (y0 + y1) / 2;
    const t = 0.28;
    const gaps = [...doorGaps].sort((a, b) => a.x - b.x);
    let cursor = x0;
    const segs = [];
    for (const g of gaps) {
      const gl = g.x - g.width / 2;
      const gr = g.x + g.width / 2;
      if (gl > cursor + 0.05) segs.push([cursor, gl]);
      addBox(g.width, y1 - 3.15, t, g.x, (3.15 + y1) / 2, z, mat);
      cursor = Math.max(cursor, gr);
    }
    if (cursor < x1 - 0.05) segs.push([cursor, x1]);
    for (const [a, b] of segs) {
      addBox(b - a, h, t, (a + b) / 2, cy, z, mat);
    }
  }

  function wallAlongZ(z0, z1, x, y0, y1, doorGaps = [], mat = matWall) {
    const h = y1 - y0;
    const cy = (y0 + y1) / 2;
    const t = 0.28;
    const gaps = [...doorGaps].sort((a, b) => a.z - b.z);
    let cursor = z0;
    const segs = [];
    for (const g of gaps) {
      const gl = g.z - g.width / 2;
      const gr = g.z + g.width / 2;
      if (gl > cursor + 0.05) segs.push([cursor, gl]);
      addBox(t, y1 - 3.15, g.width, x, (3.15 + y1) / 2, g.z, mat);
      cursor = Math.max(cursor, gr);
    }
    if (cursor < z1 - 0.05) segs.push([cursor, z1]);
    for (const [a, b] of segs) {
      addBox(t, h, b - a, x, cy, (a + b) / 2, mat);
    }
  }

  function addPainting(x, y, z, rotY, palette) {
    const [bg, mid, lite, dark] = palette;
    const fw = 1.45;
    const fh = 1.75;
    // Outer dark frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.28, fh + 0.28, 0.12), matFrame);
    frame.position.set(x, y, z);
    frame.rotation.y = rotY;
    group.add(frame);
    // Ornate gold lip
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.18, fh + 0.18, 0.08), matFrameGold);
    goldTrim.position.set(x, y, z);
    goldTrim.rotation.y = rotY;
    group.add(goldTrim);
    // Inner dark rebate
    const inner = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.06, fh + 0.06, 0.05), matFrame);
    inner.position.set(x, y, z);
    inner.rotation.y = rotY;
    group.add(inner);

    const fwd = new THREE.Vector3(0, 0, 0.07).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(fw, fh),
      new THREE.MeshStandardMaterial({ color: bg, roughness: 0.85 })
    );
    canvas.position.set(x + fwd.x, y, z + fwd.z);
    canvas.rotation.y = rotY;
    group.add(canvas);

    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(fw * 0.88, fh * 0.38),
      new THREE.MeshStandardMaterial({ color: lite, roughness: 0.9 })
    );
    sky.position.copy(canvas.position).add(fwd.clone().multiplyScalar(0.12));
    sky.position.y += fh * 0.26;
    sky.rotation.y = rotY;
    group.add(sky);

    // Soft vignette / dark edges
    const vignette = new THREE.Mesh(
      new THREE.PlaneGeometry(fw * 0.95, fh * 0.12),
      new THREE.MeshStandardMaterial({ color: dark || 0x1a1008, roughness: 0.95 })
    );
    vignette.position.copy(canvas.position).add(fwd.clone().multiplyScalar(0.1));
    vignette.position.y -= fh * 0.38;
    vignette.rotation.y = rotY;
    group.add(vignette);

    const figure = new THREE.Mesh(
      new THREE.PlaneGeometry(fw * 0.3, fh * 0.48),
      new THREE.MeshStandardMaterial({ color: mid, roughness: 0.8 })
    );
    figure.position.copy(canvas.position).add(fwd.clone().multiplyScalar(0.18));
    figure.position.y -= 0.02;
    figure.rotation.y = rotY;
    group.add(figure);

    // Head / shoulder hint
    const head = new THREE.Mesh(
      new THREE.CircleGeometry(fw * 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8c4a0, roughness: 0.75 })
    );
    head.position.copy(figure.position).add(fwd.clone().multiplyScalar(0.05));
    head.position.y += fh * 0.18;
    head.rotation.y = rotY;
    group.add(head);

    // Tiny plaque under frame
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.04), matGold);
    const down = new THREE.Vector3(0, -fh / 2 - 0.22, 0.02).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    plaque.position.set(x + down.x, y + down.y, z + down.z);
    plaque.rotation.y = rotY;
    group.add(plaque);
  }

  function addLamp(x, y, z) {
    addBox(0.06, 0.4, 0.06, x, y + 0.12, z, matTrim, false);
    addBox(0.32, 0.14, 0.32, x, y - 0.14, z, matLamp, false);
    addBox(0.38, 0.04, 0.38, x, y - 0.05, z, matGold, false);
    const pl = new THREE.PointLight(0xffe4b8, 0.75, 8, 1.5);
    pl.position.set(x, y - 0.25, z);
    group.add(pl);
  }

  function addPillar(x, z, h = 3.7) {
    addBox(0.48, h, 0.48, x, h / 2, z, matPillar, true);
    addBox(0.62, 0.2, 0.62, x, 0.1, z, matStoneDark, false);
    addBox(0.58, 0.16, 0.58, x, h - 0.08, z, matStoneDark, false);
    addBox(0.52, 0.08, 0.52, x, h - 0.2, z, matGold, false);
  }

  function addChair(x, z, rotY = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.5), matVelvet);
    seat.position.y = 0.48;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.08), matChair);
    back.position.set(0, 0.85, -0.22);
    g.add(back);
    for (const [lx, lz] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.06), matChair);
      leg.position.set(lx, 0.24, lz);
      g.add(leg);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    group.add(g);
  }

  function addPedestal(x, z) {
    addBox(0.55, 0.9, 0.55, x, 0.45, z, matPedestal, true);
    addBox(0.65, 0.08, 0.65, x, 0.04, z, matStoneDark, false);
    addBox(0.4, 0.08, 0.4, x, 0.95, z, matGold, false);
    // Bust hint
    addBox(0.22, 0.28, 0.18, x, 1.2, z, matPillar, false);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), matPillar);
    head.position.set(x, 1.45, z);
    group.add(head);
  }

  function addRug(cx, cz, w, d) {
    addBox(w, 0.035, d, cx, 0.07, cz, matRug, false);
    addBox(w * 0.9, 0.04, d * 0.1, cx, 0.08, cz - d * 0.38, matRugGold, false);
    addBox(w * 0.9, 0.04, d * 0.1, cx, 0.08, cz + d * 0.38, matRugGold, false);
    addBox(w * 0.08, 0.04, d * 0.75, cx - w * 0.38, 0.08, cz, matRugGold, false);
    addBox(w * 0.08, 0.04, d * 0.75, cx + w * 0.38, 0.08, cz, matRugGold, false);
  }

  function floorPattern(cx, cz, w, d) {
    addBox(w, 0.12, d, cx, 0, cz, matFloor, false);
    const tile = 1.5;
    const nx = Math.floor(w / tile);
    const nz = Math.floor(d / tile);
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        const tx = cx - w / 2 + tile / 2 + ix * tile;
        const tz = cz - d / 2 + tile / 2 + iz * tile;
        const m = (ix + iz) % 2 === 0 ? matFloorLight : matFloorDark;
        addBox(tile * 0.94, 0.125, tile * 0.94, tx, 0.01, tz, m, false);
      }
    }
    // Ceiling coffer bands
    addBox(w, 0.1, d, cx, 4.25, cz, matCeil, false);
    addBox(w * 0.7, 0.08, d * 0.7, cx, 4.18, cz, matWallAccent, false);
    addBox(w * 0.4, 0.06, d * 0.4, cx, 4.12, cz, matTrim, false);
  }

  function decorateRoom(cx, cz, w, d, seed) {
    const inset = 0.22;
    const count = Math.max(2, Math.floor(w / 3.0));
    for (let i = 0; i < count; i++) {
      const px = cx - w / 2 + 2.0 + (i * (w - 4.0)) / Math.max(1, count - 1);
      addPainting(px, 2.15, cz - d / 2 + inset, 0, paintPalettes[(i + seed) % paintPalettes.length]);
      addPainting(
        px,
        2.15,
        cz + d / 2 - inset,
        Math.PI,
        paintPalettes[(i + seed + 3) % paintPalettes.length]
      );
    }
    if (d > 8) {
      addPainting(cx - w / 2 + inset, 2.15, cz, Math.PI / 2, paintPalettes[(seed + 1) % paintPalettes.length]);
      addPainting(cx + w / 2 - inset, 2.15, cz, -Math.PI / 2, paintPalettes[(seed + 2) % paintPalettes.length]);
    }
    // Cornice / molding
    addBox(w - 0.4, 0.18, 0.08, cx, 3.95, cz - d / 2 + 0.2, matGold, false);
    addBox(w - 0.4, 0.18, 0.08, cx, 3.95, cz + d / 2 - 0.2, matGold, false);
    addBox(w - 0.5, 0.22, 0.06, cx, 0.12, cz - d / 2 + 0.2, matTrim, false);
    addBox(w - 0.5, 0.22, 0.06, cx, 0.12, cz + d / 2 - 0.2, matTrim, false);

    addRug(cx, cz, Math.min(w * 0.55, 6.5), Math.min(d * 0.42, 4.2));

    if (w > 10) {
      const ox = w / 2 - 1.15;
      const oz = d / 2 - 1.15;
      addPillar(cx - ox, cz - oz);
      addPillar(cx + ox, cz - oz);
      addPillar(cx - ox, cz + oz);
      addPillar(cx + ox, cz + oz);
    }

    // Accent furniture
    addChair(cx - w * 0.32, cz + d * 0.28, Math.PI);
    addChair(cx + w * 0.32, cz + d * 0.28, Math.PI);
    if (w > 9) {
      addPedestal(cx - w * 0.22, cz - d * 0.15);
      addPedestal(cx + w * 0.22, cz - d * 0.15);
    }

    addLamp(cx - w * 0.28, 3.6, cz);
    addLamp(cx + w * 0.28, 3.6, cz);
    if (d > 9) {
      addLamp(cx, 3.6, cz - d * 0.25);
      addLamp(cx, 3.6, cz + d * 0.25);
    }

    const light = new THREE.PointLight(0xfff2dc, 1.55, Math.max(w, d) * 1.5, 1.25);
    light.position.set(cx, 3.75, cz);
    group.add(light);
    // Warm fill
    const fill = new THREE.PointLight(0xffd8a0, 0.35, Math.max(w, d) * 1.1, 1.6);
    fill.position.set(cx, 2.2, cz);
    group.add(fill);
  }

  const H = 4.3;
  const DOOR = 3.0;

  // ============================================================
  // EXTERIOR — Real Mauritshuis (Jacob van Campen, Hollands classicisme)
  // Freestanding sandstone city palace: kolossale Ionische orde,
  // 7 traveeën, risalieten, fronton, kroonlijst, Hofvijver-setting.
  // Player on Plein/Korte Vijverberg side, faces -Z into entrance.
  // ============================================================
  const facadeZ = 8.5;
  const facadeW = 22.0;   // ~7 bays, compact classical villa scale
  const facadeD = 14.0;   // depth of free-standing block
  const plinthH = 1.35;
  const corniceY = 10.2;  // top of wall / start of entablature
  const roofBase = 10.85;

  // Stone palette — warm Hague sandstone (not plastic beige)
  const matSand = std(0xd2c0a0, { roughness: 0.74, metalness: 0.04 });
  const matSandLite = std(0xe0d0b4, { roughness: 0.68, metalness: 0.05 });
  const matSandMid = std(0xc4b090, { roughness: 0.8 });
  const matSandDeep = std(0xa89070, { roughness: 0.74 });
  const matSandCool = std(0xc8bba5, { roughness: 0.76 });
  const matPlinth = std(0xb09a78, { roughness: 0.85 });
  const matIonic = std(0xddd0b8, { roughness: 0.55, metalness: 0.08 });
  const matCapital = std(0xe8dcc4, { roughness: 0.48, metalness: 0.12 });
  const matFestoon = std(0xb8a078, { roughness: 0.65 });
  const matRoofSlate = std(0x3a424c, { roughness: 0.62, metalness: 0.12 });
  const matRoofDark = std(0x2c323a, { roughness: 0.58, metalness: 0.15 });
  const matChimney = std(0x9a8570, { roughness: 0.8 });
  const matGlassLite = std(0xb8d4e8, { roughness: 0.12, metalness: 0.4, transparent: true, opacity: 0.48 });
  const matGlassWarm = std(0xd8e8f0, { roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.4 });
  const matMuntin = std(0x5a4a38, { roughness: 0.7 });
  const matDoorMah = std(0x2a1810, { roughness: 0.5, metalness: 0.08 });

  // Sky
  {
    const skyGeo = new THREE.SphereGeometry(95, 28, 18);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x8eb4d4,
      side: THREE.BackSide,
      fog: false,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));
    const haze = new THREE.Mesh(
      new THREE.CircleGeometry(75, 40),
      new THREE.MeshBasicMaterial({ color: 0xd0e0f0, side: THREE.DoubleSide, fog: false })
    );
    haze.rotation.x = -Math.PI / 2;
    haze.position.y = -0.6;
    scene.add(haze);
  }

  // Plaza pavement (Plein / Korte Vijverberg approach)
  addBox(48, 0.12, 28, 0, -0.05, 20, matPavement, false);
  for (let ix = -9; ix <= 9; ix++) {
    for (let iz = 0; iz <= 9; iz++) {
      if ((ix + iz) % 2) continue;
      addBox(2.0, 0.125, 2.0, ix * 2.2, -0.04, 11 + iz * 2.2, matPavementLight, false);
    }
  }
  addBox(10, 0.1, 40, -26, -0.03, 8, matGrass, false);
  addBox(10, 0.1, 40, 26, -0.03, 8, matGrass, false);

  // Ceremonial approach path
  addBox(5.4, 0.14, 14, 0, 0.01, 16.5, matSandMid, false);
  addBox(0.28, 0.16, 14, -2.8, 0.03, 16.5, matSandDeep, false);
  addBox(0.28, 0.16, 14, 2.8, 0.03, 16.5, matSandDeep, false);

  // Entrance terrace + cascading stairs (real building has elevated entry)
  addBox(9.5, 0.38, 4.2, 0, 0.2, 10.6, matPlinth, false);
  addBox(8.6, 0.3, 1.35, 0, 0.08, 12.9, matSand, false);
  addBox(7.8, 0.24, 1.2, 0, 0.0, 14.0, matSandMid, false);
  addBox(7.0, 0.18, 1.05, 0, -0.06, 14.95, matSand, false);
  addBox(6.2, 0.14, 0.9, 0, -0.1, 15.75, matSandLite, false);

  // Planters / bollards
  for (const bx of [-7.5, 7.5]) {
    addBox(1.8, 0.45, 0.55, bx, 0.25, 18.5, matSandDeep, true);
    addBox(0.7, 0.65, 0.7, bx, 0.38, 14.8, matSand, true);
    addBox(0.55, 0.35, 0.55, bx, 0.9, 14.8, matGrass, false);
    addBox(0.2, 0.18, 0.2, bx - 0.12, 1.12, 14.8, matRed, false);
    addBox(0.18, 0.15, 0.18, bx + 0.14, 1.1, 14.85, matGoldBright, false);
  }
  for (const lx of [-9.5, 9.5]) {
    addBox(0.2, 3.4, 0.2, lx, 1.7, 15.2, matSandDeep, true);
    addBox(0.5, 0.35, 0.5, lx, 3.55, 15.2, matLamp, false);
    addBox(0.6, 0.08, 0.6, lx, 3.32, 15.2, matGold, false);
    const pl = new THREE.PointLight(0xffe0a0, 0.85, 12, 1.4);
    pl.position.set(lx, 3.4, 15.2);
    group.add(pl);
  }

  // Hofvijver — water to the EAST (historically N/NE of Mauritshuis; visible from plaza)
  {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(18, 36), matWater);
    water.rotation.x = -Math.PI / 2;
    water.position.set(22, 0.01, 6);
    group.add(water);
    addBox(1.2, 0.25, 36, 13.2, 0.08, 6, matSandDeep, false);
    addBox(1.0, 0.35, 36, 12.6, 0.15, 6, matSandMid, false);
    // Soft specular strip
    addBox(14, 0.02, 0.6, 22, 0.03, -4, matSkyHint, false);
    addBox(14, 0.02, 0.6, 22, 0.03, 14, matSkyHint, false);
    // Far bank suggestion (Binnenhof side)
    addBox(4, 0.3, 38, 31, 0.1, 6, matGrass, false);
    addBox(3, 2.5, 8, 32, 1.3, 0, matStoneDark, false);
    addBox(3, 2.5, 6, 32, 1.3, 12, matStoneDark, false);
  }
  // Small water pool south for scenic depth
  {
    const pond = new THREE.Mesh(new THREE.PlaneGeometry(28, 6), matWater);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(0, 0.015, 30);
    group.add(pond);
    addBox(30, 0.18, 1.2, 0, 0.05, 33.2, matGrass, false);
  }

  // ========== FREE-STANDING PALACE MASS ==========
  // Front face of the block is AT facadeZ (plaza side). All classical
  // detail sits proud of that plane (+Z toward the player). Previously
  // bodyZ had +0.8 so the solid mass swallowed pilasters/windows.
  const bodyZ = facadeZ - facadeD / 2;
  const frontZ = facadeZ; // visible front wall plane
  const doorW = 3.2;
  const halfSide = (facadeW - doorW) / 2;
  const detailZ = frontZ + 0.22; // pilasters / frames proud of wall
  const winZ = frontZ + 0.08;    // sash panels on wall face

  // Plinth all around — gap at front entrance so player can walk in
  {
    const pw = facadeW + 0.8;
    const pd = facadeD + 0.8;
    const gap = doorW + 0.6;
    const side = (pw - gap) / 2;
    const pz = bodyZ;
    addBox(side, plinthH, pd, -pw / 2 + side / 2, plinthH / 2, pz, matPlinth, true);
    addBox(side, plinthH, pd, pw / 2 - side / 2, plinthH / 2, pz, matPlinth, true);
    addBox(gap, plinthH, pd * 0.55, 0, plinthH / 2, pz - pd * 0.2, matPlinth, true);
    addBox(gap, 0.35, 0.5, 0, 0.18, frontZ + 0.35, matPlinth, false);
  }

  // Main stone body (four façades as one block minus door void)
  // Front face of these boxes = bodyZ + facadeD/2 = frontZ
  addBox(halfSide, corniceY - plinthH, facadeD, -facadeW / 2 + halfSide / 2, plinthH + (corniceY - plinthH) / 2, bodyZ, matSand, true);
  addBox(halfSide, corniceY - plinthH, facadeD, facadeW / 2 - halfSide / 2, plinthH + (corniceY - plinthH) / 2, bodyZ, matSand, true);
  // Upper over door (keeps mass above portal)
  addBox(doorW, corniceY - 3.5, facadeD, 0, 3.5 + (corniceY - 3.5) / 2, bodyZ, matSand, true);
  // Back wall solid (Hofvijver façade) — slightly proud of rear face
  addBox(facadeW - 0.4, corniceY - plinthH, 0.45, 0, plinthH + (corniceY - plinthH) / 2, bodyZ - facadeD / 2 - 0.05, matSandMid, false);

  // Ashlar front veneer — thin, sits ON the front face (not covering details)
  // Split left / right / over-door so windows remain readable applied on top
  addBox(halfSide - 0.05, corniceY - plinthH - 0.15, 0.12, -facadeW / 2 + halfSide / 2, plinthH + (corniceY - plinthH) / 2, frontZ + 0.02, matSandLite, false);
  addBox(halfSide - 0.05, corniceY - plinthH - 0.15, 0.12, facadeW / 2 - halfSide / 2, plinthH + (corniceY - plinthH) / 2, frontZ + 0.02, matSandLite, false);
  addBox(doorW, corniceY - 3.55, 0.12, 0, 3.55 + (corniceY - 3.55) / 2, frontZ + 0.02, matSandLite, false);

  // Rusticated plinth banding (visible on front)
  for (let i = 0; i < 3; i++) {
    const y = 0.28 + i * 0.38;
    addBox(facadeW + 0.6, 0.1, 0.35, 0, y, frontZ + 0.12, matSandDeep, false);
  }

  // Horizontal string courses (dark bands — strong contrast)
  addBox(facadeW + 0.4, 0.2, 0.38, 0, 4.15, frontZ + 0.18, matSandDeep, false);
  addBox(facadeW + 0.4, 0.2, 0.38, 0, 7.35, frontZ + 0.18, matSandDeep, false);

  // Entablature / cornice (architrave + frieze + cornice)
  addBox(facadeW + 1.2, 0.28, facadeD + 1.0, 0, corniceY + 0.05, bodyZ, matSandMid, false);
  addBox(facadeW + 1.5, 0.22, facadeD + 1.3, 0, corniceY + 0.35, bodyZ, matSandDeep, false);
  addBox(facadeW + 1.8, 0.18, facadeD + 1.5, 0, corniceY + 0.55, bodyZ, matSandCool, false);
  // Dentils along front cornice (proud of wall)
  for (let i = -20; i <= 20; i++) {
    addBox(0.28, 0.22, 0.32, i * 0.52, corniceY + 0.22, frontZ + 0.4, matSandLite, false);
  }

  // —— Colossal Ionic pilasters (7 bays → 8 pilasters) ——
  const pilXs = [-10.2, -7.15, -4.1, -1.35, 1.35, 4.1, 7.15, 10.2];
  function ionicPilaster(x) {
    const h = corniceY - plinthH - 0.15;
    const cy = plinthH + h / 2;
    const z = detailZ;
    // Shaft (lighter than wall for contrast)
    addBox(0.62, h, 0.55, x, cy, z, matIonic, false);
    // Fluting (darker grooves on plaza face)
    addBox(0.07, h * 0.9, 0.1, x - 0.18, cy, z + 0.28, matSandDeep, false);
    addBox(0.07, h * 0.9, 0.1, x + 0.18, cy, z + 0.28, matSandDeep, false);
    addBox(0.07, h * 0.9, 0.1, x, cy, z + 0.3, matSandDeep, false);
    // Base
    addBox(0.82, 0.24, 0.7, x, plinthH + 0.14, z, matSandDeep, false);
    addBox(0.72, 0.14, 0.6, x, plinthH + 0.3, z, matSandMid, false);
    // Ionic capital
    addBox(0.9, 0.22, 0.75, x, corniceY - 0.35, z, matCapital, false);
    addBox(1.0, 0.14, 0.8, x, corniceY - 0.16, z, matSandLite, false);
    // Volute discs (plaza-facing)
    addBox(0.3, 0.3, 0.22, x - 0.34, corniceY - 0.42, z + 0.32, matCapital, false);
    addBox(0.3, 0.3, 0.22, x + 0.34, corniceY - 0.42, z + 0.32, matCapital, false);
  }
  for (const px of pilXs) ionicPilaster(px);

  // Side façades — pilasters for freestanding look
  for (const sx of [-facadeW / 2 - 0.22, facadeW / 2 + 0.22]) {
    for (const sz of [bodyZ + 3.5, bodyZ, bodyZ - 3.5]) {
      addBox(0.5, corniceY - plinthH - 0.2, 0.55, sx, plinthH + (corniceY - plinthH) / 2, sz, matIonic, false);
      addBox(0.65, 0.2, 0.7, sx, corniceY - 0.25, sz, matCapital, false);
    }
  }

  // Subtle risalit tint bands BETWEEN pilasters (not solid slabs over windows)
  // Outer bays ±9 / central bay: thin proud panels only in wall strips
  for (const [cx, cw, matR] of [
    [-9.0, 2.4, matSandMid],
    [9.0, 2.4, matSandMid],
    [0, 2.0, matSandLite],
  ]) {
    addBox(cw, corniceY - plinthH - 0.3, 0.06, cx, plinthH + (corniceY - plinthH) / 2, frontZ + 0.05, matR, false);
  }

  // —— Central pediment (tympanum) — fully in front / on roof edge ——
  const pedY = roofBase + 0.25;
  const pedZ = frontZ + 0.35;
  addBox(10.2, 0.38, 1.6, 0, pedY, pedZ, matSand, false);
  addBox(8.4, 1.15, 1.45, 0, pedY + 0.9, pedZ + 0.05, matSandLite, false);
  addBox(6.2, 1.05, 1.25, 0, pedY + 1.9, pedZ + 0.1, matSand, false);
  addBox(3.8, 0.95, 1.05, 0, pedY + 2.75, pedZ + 0.12, matSandLite, false);
  addBox(1.5, 0.55, 0.85, 0, pedY + 3.4, pedZ + 0.15, matSand, false);
  // Raking cornice edges (darker for silhouette)
  addBox(0.28, 3.7, 0.4, -3.7, pedY + 1.75, pedZ - 0.15, matSandDeep, false);
  addBox(0.28, 3.7, 0.4, 3.7, pedY + 1.75, pedZ - 0.15, matSandDeep, false);
  // Coat of arms + crown (gold contrast)
  addBox(1.4, 1.4, 0.25, 0, pedY + 1.65, pedZ + 0.55, matGold, false);
  addBox(1.0, 1.0, 0.2, 0, pedY + 1.65, pedZ + 0.65, matSandDeep, false);
  addBox(0.6, 0.38, 0.18, 0, pedY + 2.45, pedZ + 0.6, matGoldBright, false);
  addBox(0.5, 0.5, 0.15, -1.85, pedY + 1.4, pedZ + 0.5, matGold, false);
  addBox(0.5, 0.5, 0.15, 1.85, pedY + 1.4, pedZ + 0.5, matGold, false);
  addBox(0.32, 0.75, 0.32, 0, pedY + 3.95, pedZ + 0.2, matGold, false);

  // Rear pediment (Hofvijver)
  const rearFace = bodyZ - facadeD / 2;
  addBox(8.5, 0.3, 1.5, 0, pedY, rearFace - 0.3, matSand, false);
  addBox(6.5, 1.2, 1.3, 0, pedY + 0.9, rearFace - 0.35, matSandLite, false);
  addBox(4.0, 1.0, 1.1, 0, pedY + 1.9, rearFace - 0.4, matSand, false);
  addBox(1.5, 0.5, 0.8, 0, pedY + 2.6, rearFace - 0.45, matSandLite, false);

  // —— Steep hip roof + chimneys ——
  addBox(facadeW * 0.98, 0.35, facadeD * 0.95, 0, roofBase, bodyZ, matRoofSlate, false);
  addBox(facadeW * 0.88, 1.15, facadeD * 0.82, 0, roofBase + 0.85, bodyZ, matRoofDark, false);
  addBox(facadeW * 0.72, 1.0, facadeD * 0.65, 0, roofBase + 1.85, bodyZ, matRoofSlate, false);
  addBox(facadeW * 0.5, 0.85, facadeD * 0.48, 0, roofBase + 2.7, bodyZ, matRoofDark, false);
  addBox(facadeW * 0.28, 0.55, facadeD * 0.3, 0, roofBase + 3.35, bodyZ, matRoofSlate, false);
  addBox(facadeW * 0.15, 0.2, facadeD * 0.15, 0, roofBase + 3.7, bodyZ, matSandDeep, false);
  for (const cx of [-5.5, 5.5]) {
    addBox(1.15, 2.4, 1.15, cx, roofBase + 2.9, bodyZ - 1.2, matChimney, false);
    addBox(1.35, 0.28, 1.35, cx, roofBase + 4.15, bodyZ - 1.2, matSandDeep, false);
    addBox(0.38, 0.55, 0.38, cx - 0.28, roofBase + 4.5, bodyZ - 1.2, matSandMid, false);
    addBox(0.38, 0.55, 0.38, cx + 0.28, roofBase + 4.5, bodyZ - 1.2, matSandMid, false);
  }

  // —— Tall sash windows (opaque dark glass so they read from plaza) ——
  // Use non-transparent materials — transparent panes were hard to see and sorted poorly
  const matPane = std(0x2a4058, { roughness: 0.22, metalness: 0.45, emissive: 0x152838, emissiveIntensity: 0.45 });
  const matPaneLite = std(0x3a5570, { roughness: 0.2, metalness: 0.4, emissive: 0x1a3048, emissiveIntensity: 0.35 });

  function sashWindow(wx, wy, tall, wide, zFace = winZ) {
    // Dark stone surround (contrast against sandstone)
    addBox(wide + 0.38, tall + 0.48, 0.14, wx, wy, zFace + 0.06, matSandDeep, false);
    addBox(wide + 0.18, tall + 0.28, 0.1, wx, wy, zFace + 0.1, matSandMid, false);
    // Glass pane (opaque, slightly emissive)
    addBox(wide, tall, 0.08, wx, wy, zFace + 0.16, matPane, false);
    // Sill + lintel
    addBox(wide + 0.48, 0.12, 0.28, wx, wy - tall / 2 - 0.1, zFace + 0.14, matSandDeep, false);
    addBox(wide + 0.44, 0.14, 0.24, wx, wy + tall / 2 + 0.12, zFace + 0.14, matSandMid, false);
    // Muntins
    addBox(wide * 0.98, 0.05, 0.06, wx, wy, zFace + 0.22, matMuntin, false);
    addBox(0.05, tall * 0.98, 0.06, wx, wy, zFace + 0.22, matMuntin, false);
    addBox(wide * 0.98, 0.04, 0.05, wx, wy + tall * 0.28, zFace + 0.21, matMuntin, false);
    addBox(wide * 0.98, 0.04, 0.05, wx, wy - tall * 0.28, zFace + 0.21, matMuntin, false);
    addBox(0.04, tall * 0.98, 0.05, wx - wide * 0.28, wy, zFace + 0.21, matMuntin, false);
    addBox(0.04, tall * 0.98, 0.05, wx + wide * 0.28, wy, zFace + 0.21, matMuntin, false);
  }

  // Ground floor (4 side windows — door in center)
  for (const wx of [-8.6, -5.5, 5.5, 8.6]) {
    sashWindow(wx, 2.55, 2.05, 1.3);
  }
  // Piano nobile (taller) + festoons
  for (const wx of [-8.6, -5.5, -2.6, 2.6, 5.5, 8.6]) {
    sashWindow(wx, 5.85, 2.1, 1.3);
    addBox(1.15, 0.32, 0.14, wx, 4.55, frontZ + 0.2, matFestoon, false);
    addBox(0.38, 0.2, 0.12, wx - 0.58, 4.55, frontZ + 0.22, matSandDeep, false);
    addBox(0.38, 0.2, 0.12, wx + 0.58, 4.55, frontZ + 0.22, matSandDeep, false);
    addBox(0.22, 0.22, 0.1, wx, 4.35, frontZ + 0.24, matGold, false);
  }
  // Attic / upper row
  for (const wx of [-8.6, -5.5, -2.6, 0, 2.6, 5.5, 8.6]) {
    sashWindow(wx, 8.7, 1.4, 1.15);
  }

  // Side façade windows
  for (const sx of [-facadeW / 2 - 0.4, facadeW / 2 + 0.4]) {
    for (const [sy, sh, sw] of [[2.55, 1.85, 1.15], [5.85, 1.95, 1.15], [8.7, 1.25, 1.0]]) {
      for (const sz of [bodyZ + 2.8, bodyZ - 2.8]) {
        addBox(0.16, sh + 0.35, sw + 0.3, sx, sy, sz, matSandDeep, false);
        addBox(0.1, sh, sw, sx, sy, sz, matPaneLite, false);
      }
    }
  }

  // Rear (Hofvijver) windows
  const rearZ = rearFace - 0.15;
  for (const wx of [-8.6, -5.5, -2.6, 2.6, 5.5, 8.6]) {
    // Build manually facing -Z (rear)
    addBox(1.2 + 0.35, 2.0 + 0.4, 0.14, wx, 5.85, rearZ, matSandDeep, false);
    addBox(1.2, 2.0, 0.08, wx, 5.85, rearZ - 0.08, matPane, false);
  }
  for (const wx of [-8.6, -5.5, 0, 5.5, 8.6]) {
    addBox(1.15 + 0.35, 1.9 + 0.4, 0.14, wx, 2.55, rearZ, matSandDeep, false);
    addBox(1.15, 1.9, 0.08, wx, 2.55, rearZ - 0.08, matPane, false);
  }

  // —— Entrance portal (recessed in door void, surrounds proud) ——
  addBox(doorW + 0.6, 0.22, 2.4, 0, 0.14, frontZ - 0.9, matPlinth, false);
  addBox(doorW + 0.1, 3.3, 0.1, 0, 1.85, frontZ - 1.4, matDoorMah, false);
  addBox(1.35, 3.1, 0.12, -1.15, 1.7, frontZ - 1.15, matDoorMah, false);
  addBox(1.35, 3.1, 0.12, 1.15, 1.7, frontZ - 1.15, matDoorMah, false);
  addBox(1.0, 1.05, 0.05, -1.15, 2.25, frontZ - 1.22, matSandDeep, false);
  addBox(1.0, 1.05, 0.05, 1.15, 2.25, frontZ - 1.22, matSandDeep, false);
  addBox(1.0, 0.85, 0.05, -1.15, 0.95, frontZ - 1.22, matSandDeep, false);
  addBox(1.0, 0.85, 0.05, 1.15, 0.95, frontZ - 1.22, matSandDeep, false);
  addBox(0.12, 0.3, 0.12, -0.55, 1.55, frontZ - 1.25, matGold, false);
  addBox(0.12, 0.3, 0.12, 0.55, 1.55, frontZ - 1.25, matGold, false);
  // Portal surround proud of facade
  addBox(doorW + 1.1, 0.38, 0.5, 0, 3.8, frontZ + 0.2, matSandDeep, false);
  addBox(doorW + 1.3, 0.2, 0.55, 0, 4.08, frontZ + 0.25, matGold, false);
  addBox(0.58, 3.5, 0.5, -doorW / 2 - 0.4, 1.9, frontZ + 0.18, matIonic, false);
  addBox(0.58, 3.5, 0.5, doorW / 2 + 0.4, 1.9, frontZ + 0.18, matIonic, false);

  // Name plaque
  addBox(4.0, 0.58, 0.14, 0, 4.5, frontZ + 0.28, matGold, false);
  addBox(3.6, 0.4, 0.1, 0, 4.5, frontZ + 0.34, matSandDeep, false);

  // Dutch flags at corners (clearly visible)
  function dutchFlag(fx, fz) {
    addBox(0.12, 5.2, 0.12, fx, 2.6, fz, matSandDeep, true);
    addBox(1.7, 0.35, 0.06, fx + 0.9, 4.85, fz, matRed, false);
    addBox(1.7, 0.35, 0.06, fx + 0.9, 4.48, fz, matWhite, false);
    addBox(1.7, 0.35, 0.06, fx + 0.9, 4.11, fz, matBlue, false);
  }
  dutchFlag(-11.8, frontZ + 0.4);
  dutchFlag(10.0, frontZ + 0.4); // pole left of flag so cloth visible from plaza center

  // Connecting shell to interior galleries (keep playable entrance)
  addBox(2.2, 9.5, 10, -facadeW / 2 - 0.4, 4.75, facadeZ - 8, matSand, true);
  addBox(2.2, 9.5, 10, facadeW / 2 + 0.4, 4.75, facadeZ - 8, matSand, true);

  // Daylight — slightly stronger on plaza so facade relief reads
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.05);
  sun.position.set(14, 42, 34);
  scene.add(sun);
  const sunRim = new THREE.DirectionalLight(0xa8c0e8, 0.7);
  sunRim.position.set(-24, 18, -6);
  scene.add(sunRim);
  const hemi = new THREE.HemisphereLight(0xb0d4f0, 0x6a5840, 0.88);
  scene.add(hemi);
  {
    const el = new THREE.PointLight(0xfff0d8, 1.35, 18, 1.2);
    el.position.set(0, 4.2, frontZ + 3);
    group.add(el);
  }
  {
    const wl = new THREE.PointLight(0xa8d0f0, 0.45, 22, 1.5);
    wl.position.set(20, 2, 6);
    group.add(wl);
  }

  // ============================================================
  // INTERIOR
  // ============================================================
  floorPattern(0, 2, 12, 12);
  wallAlongX(-6, 6, -4, 0, H, [{ x: 0, width: DOOR }], matWallGallery);
  wallAlongX(-6, 6, 8, 0, H, [{ x: 0, width: DOOR }], matWallGallery);
  wallAlongZ(-4, 8, -6, 0, H, [], matWallGallery);
  wallAlongZ(-4, 8, 6, 0, H, [], matWallGallery);
  decorateRoom(0, 2, 11.5, 11.5, 0);

  addBox(2.6, 0.45, 0.1, 0, 2.9, 7.55, matGold, false);
  addBox(2.3, 0.3, 0.06, 0, 2.9, 7.62, matStoneDeep, false);

  floorPattern(0, -8, 3.6, 8.5);
  wallAlongZ(-12.2, -3.8, -1.8, 0, H, []);
  wallAlongZ(-12.2, -3.8, 1.8, 0, H, []);
  {
    const l = new THREE.PointLight(0xffe8c8, 0.9, 11, 1.35);
    l.position.set(0, 3.55, -8);
    group.add(l);
  }
  addLamp(0, 3.65, -8);

  floorPattern(0, -18, 14, 10);
  wallAlongX(-7, 7, -23, 0, H, [{ x: 0, width: DOOR }], matWallGallery);
  wallAlongX(-7, 7, -13, 0, H, [{ x: 0, width: DOOR }], matWallGallery);
  wallAlongZ(-23, -13, -7, 0, H, [{ z: -18, width: DOOR }], matWallGallery);
  wallAlongZ(-23, -13, 7, 0, H, [{ z: -18, width: DOOR }], matWallGallery);
  decorateRoom(0, -18, 13.5, 9.5, 1);

  floorPattern(-11.5, -18, 9, 3.6);
  wallAlongX(-16, -7, -19.8, 0, H, []);
  wallAlongX(-16, -7, -16.2, 0, H, []);
  {
    const l = new THREE.PointLight(0xffe8c8, 0.75, 9, 1.4);
    l.position.set(-11.5, 3.5, -18);
    group.add(l);
  }

  floorPattern(-16, -18, 10, 10);
  wallAlongX(-21, -11, -23, 0, H, [], matWallGallery);
  wallAlongX(-21, -11, -13, 0, H, [], matWallGallery);
  wallAlongZ(-23, -13, -21, 0, H, [], matWallGallery);
  wallAlongZ(-23, -13, -11, 0, H, [{ z: -18, width: DOOR }], matWallGallery);
  decorateRoom(-16, -18, 9.5, 9.5, 2);

  floorPattern(11.5, -18, 9, 3.6);
  wallAlongX(7, 16, -19.8, 0, H, []);
  wallAlongX(7, 16, -16.2, 0, H, []);
  {
    const l = new THREE.PointLight(0xffe8c8, 0.75, 9, 1.4);
    l.position.set(11.5, 3.5, -18);
    group.add(l);
  }

  floorPattern(16, -18, 10, 10);
  wallAlongX(11, 21, -23, 0, H, [], matWallGallery);
  wallAlongX(11, 21, -13, 0, H, [], matWallGallery);
  wallAlongZ(-23, -13, 11, 0, H, [{ z: -18, width: DOOR }], matWallGallery);
  wallAlongZ(-23, -13, 21, 0, H, [], matWallGallery);
  decorateRoom(16, -18, 9.5, 9.5, 3);

  floorPattern(0, -27.5, 3.6, 9);
  wallAlongZ(-32, -23, -1.8, 0, H, []);
  wallAlongZ(-32, -23, 1.8, 0, H, []);
  {
    const l = new THREE.PointLight(0xffe8c8, 0.85, 10, 1.35);
    l.position.set(0, 3.5, -27.5);
    group.add(l);
  }

  floorPattern(0, -36, 12, 10);
  wallAlongX(-6, 6, -41, 0, H, [], matWallGallery);
  wallAlongX(-6, 6, -31, 0, H, [{ x: 0, width: DOOR }], matWallGallery);
  wallAlongZ(-41, -31, -6, 0, H, [], matWallGallery);
  wallAlongZ(-41, -31, 6, 0, H, [], matWallGallery);
  decorateRoom(0, -36, 11.5, 9.5, 4);

  const jewel = new THREE.PointLight(0xffd088, 1.35, 15, 1.1);
  jewel.position.set(0, 3.4, -36);
  group.add(jewel);

  scene.add(group);

  const amb = new THREE.AmbientLight(0xc8b8a0, 0.28);
  scene.add(amb);

  scene.fog = new THREE.Fog(0xb0c8e0, 42, 95);

  const enemySpawns = [
    // Plaza — immediate threat in front of Mauritshuis (fixes "nothing happens")
    new THREE.Vector3(-5.5, 0, 18),
    new THREE.Vector3(5.5, 0, 17),
    new THREE.Vector3(0, 0, 15.5),
    new THREE.Vector3(-7, 0, 13.5),
    new THREE.Vector3(7, 0, 14),
    // Entrance / lobby
    new THREE.Vector3(3.2, 0, 5),
    new THREE.Vector3(-3.2, 0, 4),
    new THREE.Vector3(0, 0, 1.5),
    // Galleries
    new THREE.Vector3(3.5, 0, -16),
    new THREE.Vector3(-3.5, 0, -20),
    new THREE.Vector3(-16, 0, -15.5),
    new THREE.Vector3(-14, 0, -20.5),
    new THREE.Vector3(16, 0, -15.5),
    new THREE.Vector3(14, 0, -20.5),
    new THREE.Vector3(2.5, 0, -34),
    new THREE.Vector3(-2.5, 0, -38),
    new THREE.Vector3(4, 0, -18),
    new THREE.Vector3(-4, 0, -36),
    new THREE.Vector3(0, 0, -22),
    new THREE.Vector3(-18, 0, -18),
  ];

  return {
    colliders,
    playerStart: new THREE.Vector3(0, 1.65, 24),
    playerStartYaw: 0,
    enemySpawns,
    bounds: { minX: -22, maxX: 22, minZ: -42, maxZ: 34 },
  };
}

export function resolveCollision(pos, radius, colliders) {
  // Slightly softer radius + two-pass axis resolve reduces doorway snags
  const r = radius * 0.88;
  for (let pass = 0; pass < 2; pass++) {
    for (const c of colliders) {
      if (c.max.y < 0.25 || c.min.y > 1.9) continue;
      const nx = Math.max(c.min.x, Math.min(pos.x, c.max.x));
      const nz = Math.max(c.min.z, Math.min(pos.z, c.max.z));
      let dx = pos.x - nx;
      let dz = pos.z - nz;
      const distSq = dx * dx + dz * dz;
      if (distSq >= r * r) continue;
      const dist = Math.sqrt(distSq);
      if (dist < 1e-5) {
        const left = pos.x - c.min.x;
        const right = c.max.x - pos.x;
        const near = pos.z - c.min.z;
        const far = c.max.z - pos.z;
        const m = Math.min(left, right, near, far);
        if (m === left) pos.x = c.min.x - r;
        else if (m === right) pos.x = c.max.x + r;
        else if (m === near) pos.z = c.min.z - r;
        else pos.z = c.max.z + r;
      } else {
        // Prefer the shallower push axis to slide along walls
        const push = (r - dist) * 1.01;
        const absDx = Math.abs(dx);
        const absDz = Math.abs(dz);
        if (absDx > absDz * 1.15) {
          pos.x += Math.sign(dx || 1) * push;
        } else if (absDz > absDx * 1.15) {
          pos.z += Math.sign(dz || 1) * push;
        } else {
          pos.x += (dx / dist) * push;
          pos.z += (dz / dist) * push;
        }
      }
    }
  }
  return pos;
}
