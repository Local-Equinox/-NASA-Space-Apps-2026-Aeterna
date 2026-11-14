// The astronaut and spaceship, built from primitives in real metres, so they need no asset files
// and work in any lighting. Both face their local forward: +Z for the astronaut, -Z for the ship.

import {
  BufferGeometry, Material, Object3D, BoxGeometry, CapsuleGeometry, CylinderGeometry, Group, LatheGeometry, Mesh, MeshBasicMaterial,
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

/** A small explorer ship, 20 m long, nose toward -Z, standing on landing legs at y = 0. */
export function createSpaceship() {
  const root = new Group();
  const hull = material('#dfe3ea', { metalness: 0.35, roughness: 0.38 });
  const panel = material('#7d8798', { metalness: 0.45, roughness: 0.45 });
  const accent = material('#d8473f');
  const canopy = new MeshStandardMaterial({
    color: '#0c3f9e', emissive: '#1f9dff', emissiveIntensity: 0.55, roughness: 0.1, metalness: 0.6,
  });

  const body = new Group();
  body.position.y = 3.5;
  root.add(body);

  const profile = [[0, 10.2], [0.75, 9], [1.55, 6.4], [2.2, 2.5], [2.45, -1.5], [2.25, -6], [1.55, -8.4], [0, -8.4]]
    .map(([radius, along]) => new Vector2(radius as number, along as number))
    .reverse(); // LatheGeometry's normals face outward only when the profile climbs
  const fuselage = part(new LatheGeometry(profile, 28).rotateX(-Math.PI / 2), hull, 0, 0, 0, body);
  fuselage.scale.y = 0.82;

  const canopyMesh = part(new SphereGeometry(1.35, 24, 16), canopy, 0, 1.1, -5.2, body);
  canopyMesh.scale.set(0.95, 0.72, 1.9);
  part(new BoxGeometry(5, 0.12, 0.5), accent, 0, 0, -0.5, body);

  const gear: Mesh[] = [];
  for (const side of [-1, 1]) {
    const wing = part(new BoxGeometry(6.5, 0.3, 5), hull, side * 5, -0.15, 2.8, body);
    wing.rotation.y = side * -0.42;
    part(new BoxGeometry(5.2, 0.33, 0.45), accent, 0, 0, -1.7, wing);
    part(new CylinderGeometry(0.75, 0.9, 5.4, 16).rotateX(Math.PI / 2), panel, side * 3.15, -0.2, 5.6, body);
    const fin = part(new BoxGeometry(0.22, 2.2, 3.2), hull, side * 7.8, 0.75, 4.4, body);
    fin.rotation.x = 0.3;

    const leg = part(new CylinderGeometry(0.16, 0.2, 3, 8), panel, side * 2.4, -1.9, 4, body);
    leg.rotation.z = side * -0.32;
    gear.push(leg, part(new CylinderGeometry(0.8, 0.9, 0.2, 14), panel, side * 2.95, -3.4, 4, body));
  }
  part(new BoxGeometry(0.22, 2.8, 3.4), hull, 0, 2.7, 5.5, body);
  gear.push(
    part(new CylinderGeometry(0.16, 0.2, 3, 8), panel, 0, -1.9, -5.5, body),
    part(new CylinderGeometry(0.8, 0.9, 0.2, 14), panel, 0, -3.4, -5.5, body),
  );

  // Thruster plumes, stretched by the flight code with thrust.
  const flames: Mesh[] = [];
  const flameMaterial = new MeshBasicMaterial({ color: '#7fc8ff', transparent: true, opacity: 0.85, depthWrite: false });
  for (const x of [-3.15, 3.15]) {
    const flame = new Mesh(new CylinderGeometry(0.06, 0.62, 1, 12, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5), flameMaterial);
    flame.position.set(x, -0.2, 8.3);
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
