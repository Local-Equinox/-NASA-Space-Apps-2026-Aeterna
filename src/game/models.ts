// The astronaut and spaceship, built from primitives in real metres, so they need no asset files
// and work in any lighting. Both face their local forward: +Z for the astronaut, -Z for the ship.

import {
  BufferGeometry, Material, Object3D, BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, DoubleSide, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshBasicMaterial, Shape,
  MeshStandardMaterial, SphereGeometry, TorusGeometry, Vector2,
} from 'three';

const material = (color: string, extra: Record<string, unknown> = {}) => new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, ...extra });

function part(geometry: BufferGeometry, mat: Material, x = 0, y = 0, z = 0, parent?: Object3D) {
  const mesh = new Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent?.add(mesh);
  return mesh;
}

/**
 * An astronaut 1.85 m tall in a white suit: red bands on the arms and legs, a gold-brown visor in a white
 * helmet, a chest control box, a life-support backpack and a hose. Built from primitives so the limbs can swing.
 */
export function createAstronaut() {
  const root = new Group();
  const suit = material('#f6f7f9', { roughness: 0.7, metalness: 0, emissive: '#ffffff', emissiveIntensity: 0.16 });
  const fold = material('#e4e6eb', { roughness: 0.75, metalness: 0, emissive: '#ffffff', emissiveIntensity: 0.1 });
  const grey = material('#b7bcc6', { roughness: 0.5, metalness: 0.2 });
  const dark = material('#23262d', { roughness: 0.35, metalness: 0.3 });
  const red = material('#d42a30', { roughness: 0.6, metalness: 0, emissive: '#d42a30', emissiveIntensity: 0.25 });
  const visor = new MeshStandardMaterial({ color: '#7a4420', emissive: '#4a2408', emissiveIntensity: 0.9, roughness: 0.12, metalness: 0.35 });
  const glint = new MeshStandardMaterial({ color: '#e9c9a0', emissive: '#c79a6a', emissiveIntensity: 0.8, roughness: 0.2 });

  const ring = (radius: number, tube: number, mat: Material, y: number, parent: Object3D, sx = 1, sz = 1) => {
    const m = part(new TorusGeometry(radius, tube, 8, 22).rotateX(Math.PI / 2), mat, 0, y, 0, parent);
    m.scale.set(sx, 1, sz);
    return m;
  };

  // Torso: chest and hips, with soft fabric folds at the waist
  const chest = part(new CapsuleGeometry(0.235, 0.2, 6, 18), suit, 0, 1.2, 0, root);
  chest.scale.set(1.08, 1, 0.86);
  const hips = part(new SphereGeometry(0.235, 18, 14), suit, 0, 0.92, 0, root);
  hips.scale.set(1.05, 0.8, 0.88);
  ring(0.225, 0.028, fold, 1.01, root, 1.05, 0.86);
  ring(0.228, 0.022, fold, 0.955, root, 1.05, 0.87);
  ring(0.2, 0.03, grey, 1.44, root, 1, 0.95); // neck ring

  // Chest control box
  const box = part(new BoxGeometry(0.3, 0.24, 0.1), suit, 0, 1.2, 0.2, root);
  part(new BoxGeometry(0.31, 0.02, 0.105), fold, 0, -0.045, 0, box);
  part(new CylinderGeometry(0.032, 0.032, 0.03, 14).rotateX(Math.PI / 2), dark, 0.085, 0.045, 0.055, box);
  part(new BoxGeometry(0.1, 0.07, 0.012), fold, -0.07, 0.055, 0.052, box);
  part(new BoxGeometry(0.018, 0.05, 0.014), red, 0.135, -0.005, 0.052, box);
  for (const x of [-0.07, 0, 0.07]) part(new CylinderGeometry(0.026, 0.026, 0.035, 14).rotateX(Math.PI / 2), dark, x, -0.085, 0.055, box);

  // Backpack
  const pack = part(new BoxGeometry(0.46, 0.6, 0.22), suit, 0, 1.24, -0.3, root);
  part(new BoxGeometry(0.4, 0.5, 0.03), fold, 0, 0, -0.115, pack);
  part(new BoxGeometry(0.47, 0.03, 0.225), grey, 0, 0.2, 0, pack);
  // Hose from the chest box round to the backpack
  const hose = part(new TorusGeometry(0.2, 0.024, 8, 20, Math.PI * 1.05), fold, -0.13, 1.03, -0.03, root);
  hose.rotation.set(0, Math.PI / 2, Math.PI * 0.98);

  // Helmet: white shell, wide gold-brown visor, white rim and ear caps
  const head = new Group();
  head.position.y = 1.62;
  root.add(head);
  part(new SphereGeometry(0.255, 28, 20), suit, 0, 0, -0.01, head);
  const glass = part(new SphereGeometry(0.228, 28, 20), visor, 0, 0.005, 0.08, head);
  glass.scale.set(1, 0.9, 0.82);
  const rim = part(new TorusGeometry(0.202, 0.03, 10, 30), suit, 0, 0.005, 0.15, head);
  rim.scale.set(1.02, 0.93, 1);
  const shine = part(new SphereGeometry(0.05, 10, 8), glint, -0.085, 0.075, 0.24, head);
  shine.scale.set(1.5, 0.75, 0.25);
  shine.rotation.z = -0.5;
  for (const x of [-0.255, 0.255]) part(new CylinderGeometry(0.06, 0.06, 0.05, 16).rotateZ(Math.PI / 2), fold, x, 0, 0, head);

  // Arms: shoulder ball, red band, ribbed sleeve, wrist ring and glove
  const arm = (side: number) => {
    const pivot = new Group();
    pivot.position.set(side * 0.33, 1.34, 0);
    root.add(pivot);
    part(new SphereGeometry(0.125, 16, 12), suit, 0, 0, 0, pivot);
    part(new CapsuleGeometry(0.09, 0.4, 4, 14), suit, 0, -0.27, 0, pivot);
    part(new CylinderGeometry(0.097, 0.097, 0.065, 16), red, 0, -0.15, 0, pivot);
    for (const y of [-0.27, -0.33, -0.39]) ring(0.086, 0.011, fold, y, pivot);
    ring(0.082, 0.02, grey, -0.5, pivot);
    const hand = part(new SphereGeometry(0.085, 14, 10), fold, 0, -0.585, 0.01, pivot);
    hand.scale.set(0.85, 1.15, 1);
    part(new CapsuleGeometry(0.024, 0.05, 3, 8), fold, side * -0.07, -0.57, 0.035, pivot);
    return pivot;
  };
  // Legs: thigh, red knee band, ribbed shin and a boot with a grey sole
  const leg = (side: number) => {
    const pivot = new Group();
    pivot.position.set(side * 0.13, 0.86, 0);
    root.add(pivot);
    part(new CapsuleGeometry(0.118, 0.5, 4, 14), suit, 0, -0.36, 0, pivot);
    part(new CylinderGeometry(0.126, 0.126, 0.07, 18), red, 0, -0.37, 0, pivot);
    for (const y of [-0.2, -0.27, -0.47, -0.54]) ring(0.113, 0.012, fold, y, pivot);
    const boot = part(new CapsuleGeometry(0.095, 0.15, 4, 12).rotateX(Math.PI / 2), suit, 0, -0.755, 0.045, pivot);
    boot.scale.set(1.08, 0.9, 1);
    part(new BoxGeometry(0.2, 0.035, 0.34), grey, 0, -0.84, 0.045, pivot);
    return pivot;
  };
  const armLeft = arm(-1);
  const armRight = arm(1);
  const legLeft = leg(-1);
  const legRight = leg(1);
  armLeft.rotation.z = -0.2;
  armRight.rotation.z = 0.2;

  let phase = 0;
  /** @param speed ground speed in m/s; @param airborne true during jumps and falls */
  root.userData.animate = (dt: number, speed: number, airborne: boolean) => {
    if (airborne) {
      legLeft.rotation.x = 0.5;
      legRight.rotation.x = -0.25;
      armLeft.rotation.x = -0.6;
      armRight.rotation.x = 0.6;
      return;
    }
    phase += dt * Math.min(speed, 9) * 2.1;
    const swing = Math.sin(phase) * Math.min(1, speed / 3) * 0.75;
    legLeft.rotation.x = swing;
    legRight.rotation.x = -swing;
    armLeft.rotation.x = -swing * 0.8;
    armRight.rotation.x = swing * 0.8;
  };
  return root;
}

/**
 * The ship: a Space Shuttle style orbiter, about 20 m long, nose toward -Z, standing on its landing gear at y = 0.
 * White body with black nose, belly and wing edges, delta wings, a tail fin and three main engines.
 */
export function createSpaceship() {
  const root = new Group();
  const white = material('#eef0f3', { metalness: 0.1, roughness: 0.55, emissive: '#ffffff', emissiveIntensity: 0.08 });
  const black = material('#1c1e24', { metalness: 0.2, roughness: 0.6 });
  const grey = material('#8a909c', { metalness: 0.5, roughness: 0.45 });
  const glass = new MeshStandardMaterial({ color: '#0b1220', roughness: 0.1, metalness: 0.7 });
  white.side = DoubleSide; black.side = DoubleSide;

  const body = new Group();
  body.position.y = 3.5;
  root.add(body);

  const profile = [[0, 11], [0.8, 10.4], [1.5, 9.2], [1.9, 7], [1.9, -7.6], [1.6, -8.6], [0, -8.6]]
    .map(([radius, along]) => new Vector2(radius as number, along as number))
    .reverse(); // LatheGeometry's normals face outward only when the profile climbs
  part(new LatheGeometry(profile, 28).rotateX(-Math.PI / 2), white, 0, 0, 0, body);
  // Black heat-shield nose and belly, cockpit windows, payload bay seam
  const nose = part(new SphereGeometry(1, 20, 14), black, 0, -0.05, -10.1, body);
  nose.scale.set(0.95, 0.85, 1.25);
  part(new BoxGeometry(3.3, 0.5, 16.5), black, 0, -1.62, -0.3, body);
  const windows = part(new BoxGeometry(2.3, 0.55, 1.1), glass, 0, 1.25, -7.9, body);
  windows.rotation.x = 0.5;
  part(new BoxGeometry(0.12, 0.06, 10.5), grey, 0, 1.9, 0, body);

  // Delta wings (white on top, black underneath) and the tail fin
  const wingShape = (side: number) => {
    const sh = new Shape();
    sh.moveTo(side * 1.4, -3.5); sh.lineTo(side * 3.1, 2.4); sh.lineTo(side * 7.8, 6.3); sh.lineTo(side * 7.8, 8.1); sh.lineTo(side * 1.4, 8.1);
    sh.closePath();
    return sh;
  };
  for (const side of [-1, 1]) {
    part(new ExtrudeGeometry(wingShape(side), { depth: 0.28, bevelEnabled: false }).rotateX(Math.PI / 2), white, 0, -1.1, 0, body);
    part(new ExtrudeGeometry(wingShape(side), { depth: 0.14, bevelEnabled: false }).rotateX(Math.PI / 2), black, 0, -1.38, 0, body);
    const pod = part(new CapsuleGeometry(0.75, 2.6, 4, 12).rotateX(Math.PI / 2), white, side * 1.45, 1.45, 6.9, body);
    pod.scale.y = 0.85;
  }
  const fin = new Shape();
  fin.moveTo(4.2, 1.7); fin.lineTo(8.7, 1.7); fin.lineTo(9.6, 6.4); fin.lineTo(8.3, 6.4); fin.closePath();
  part(new ExtrudeGeometry(fin, { depth: 0.3, bevelEnabled: false }).rotateY(-Math.PI / 2), white, 0.15, 0, 0, body);
  part(new BoxGeometry(0.34, 4.6, 0.25), black, 0, 4.05, 9.1, body).rotation.x = -0.19;

  // Three main engines
  const nozzles: [number, number][] = [[0, 1.0], [-0.95, -0.35], [0.95, -0.35]];
  for (const [x, y] of nozzles) part(new CylinderGeometry(0.4, 0.8, 1.5, 16, 1, true).rotateX(Math.PI / 2), grey, x, y, 9.2, body);

  // Landing gear
  const gear: Mesh[] = [];
  const leg = (x: number, z: number) => {
    gear.push(part(new CylinderGeometry(0.12, 0.12, 1.5, 8), grey, x, -2.55, z, body));
    gear.push(part(new CylinderGeometry(0.42, 0.42, 0.5, 14).rotateZ(Math.PI / 2), black, x, -3.08, z, body));
  };
  leg(0, -7.5); leg(-2.6, 4.6); leg(2.6, 4.6);

  // Engine plumes, stretched by the flight code with thrust.
  const flames: Mesh[] = [];
  const flameMaterial = new MeshBasicMaterial({ color: '#9fd4ff', transparent: true, opacity: 0.85, depthWrite: false });
  for (const [x, y] of nozzles) {
    const flame = new Mesh(new CylinderGeometry(0.06, 0.6, 1, 12, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5), flameMaterial);
    flame.position.set(x, y, 9.9);
    flame.visible = false;
    body.add(flame);
    flames.push(flame);
  }

  root.userData.setGearDown = (down: boolean) => gear.forEach((g) => { g.visible = down; });

  /** @param thrust 0..1 */
  root.userData.setThrust = (thrust: number) => {
    for (const flame of flames) {
      flame.visible = thrust > 0.02;
      flame.scale.z = 1 + thrust * 9;
    }
  };
  return root;
}

/**
 * The full launch stack standing upright with its base at y = 0: the orbiter on an orange external tank
 * with two white solid rocket boosters. `userData` exposes the parts so the launch cutscene can separate them.
 */
export function createLaunchStack() {
  const root = new Group();
  const tankMat = material('#a9431d', { roughness: 0.85, metalness: 0 });
  const white = material('#eef0f3', { roughness: 0.6, metalness: 0.05, emissive: '#ffffff', emissiveIntensity: 0.08 });
  const band = material('#2a2d34', { roughness: 0.6 });
  const grey = material('#8a909c', { metalness: 0.5, roughness: 0.45 });

  const tank = new Group();
  const tankProfile = [[0, 30], [1.1, 28.8], [2.1, 26.4], [2.7, 23], [2.7, 1], [2.2, 0], [0, 0]]
    .map(([r, y]) => new Vector2(r as number, y as number)).reverse();
  part(new LatheGeometry(tankProfile, 28), tankMat, 0, 0, 0, tank);
  part(new CylinderGeometry(2.74, 2.74, 0.5, 28), material('#8f3817', { roughness: 0.9 }), 0, 21, 0, tank);
  tank.position.y = 3;
  root.add(tank);

  const flameMat = new MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, depthWrite: false });
  const coreMat = new MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.95, depthWrite: false });
  const boosterFlames: Mesh[] = [];
  const boosters = [-1, 1].map((side) => {
    const b = new Group();
    part(new CylinderGeometry(1.2, 1.2, 25, 20), white, 0, 13.5, 0, b);
    part(new ConeGeometry(1.2, 3.4, 20), white, 0, 27.7, 0, b);
    part(new CylinderGeometry(1.25, 1.75, 1.6, 20), white, 0, 0.8, 0, b);
    for (const y of [6, 12.5, 19, 25]) part(new CylinderGeometry(1.23, 1.23, 0.3, 20), band, 0, y, 0, b);
    part(new CylinderGeometry(0.7, 1.2, 1, 16, 1, true), grey, 0, -0.3, 0, b);
    for (const [mat, r] of [[flameMat, 1.5], [coreMat, 0.8]] as [Material, number][]) {
      const f = new Mesh(new ConeGeometry(r, 1, 14, 1, true).rotateX(Math.PI).translate(0, -0.5, 0), mat);
      f.position.y = -0.6; f.visible = false;
      b.add(f); boosterFlames.push(f);
    }
    b.position.set(side * 3.95, 0, 0);
    root.add(b);
    return b;
  });

  // The orbiter rides nose-up with its belly against the tank
  const orbiter = new Group();
  const ship = createSpaceship();
  ship.userData.setGearDown(false);
  ship.position.y = -3.5;
  orbiter.add(ship);
  orbiter.rotation.x = Math.PI / 2;
  orbiter.position.set(0, 13.4, 4.75);
  root.add(orbiter);

  root.userData.parts = { orbiter, ship, tank, boosters };
  /** @param main 0..1 main engines; @param solid 0..1 solid rocket boosters; @param t seconds, for flicker */
  root.userData.setLaunchThrust = (main: number, solid: number, t = 0) => {
    ship.userData.setThrust(main * 0.8);
    boosterFlames.forEach((f, i) => {
      f.visible = solid > 0.02;
      f.scale.set(1, solid * (i % 2 ? 9 : 16) * (0.9 + 0.1 * Math.sin(t * 40 + i)), 1);
    });
  };
  return root;
}
