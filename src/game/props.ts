// Simplified models for equipment that has no model on NASA 3D Resources. Built from primitives, in metres,
// resting on y = 0. They are labelled as simplified wherever they are credited.
import {
  BoxGeometry, BufferGeometry, Quaternion, Vector3, ConeGeometry, CylinderGeometry, Group, Material, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry,
} from 'three'

const mat = (color: string, extra: Record<string, unknown> = {}) => new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.3, ...extra })
const foil = mat('#c8a24a', { metalness: 0.7, roughness: 0.35 })
const metal = mat('#b9bec7')
const dark = mat('#2b2f3a', { metalness: 0.1 })
const panel = mat('#1b2a55', { metalness: 0.5, roughness: 0.3 })
const white = mat('#e8e8e4')

function add(parent: Group, g: BufferGeometry, m: Material, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(g, m)
  mesh.position.set(x, y, z)
  parent.add(mesh)
  return mesh
}

/** A cylinder strut running from point a to point b. */
function strut(parent: Group, a: Vector3, b: Vector3, radius: number, m: Material) {
  const dir = b.clone().sub(a)
  const mesh = new Mesh(new CylinderGeometry(radius, radius, dir.length(), 8), m)
  mesh.position.copy(a).addScaledVector(dir, 0.5)
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize())
  parent.add(mesh)
}
void Quaternion

/** Surveyor 3: a three-legged lander with a mast, camera and solar panel. About 4 m across. */
function surveyor() {
  const g = new Group()
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const top = new Vector3(Math.cos(a) * 0.45, 1.9, Math.sin(a) * 0.45)
    const foot = new Vector3(Math.cos(a) * 2.0, 0.06, Math.sin(a) * 2.0)
    strut(g, top, foot, 0.05, metal)
    // a second, shorter brace from the mid-height of the mast frame
    strut(g, new Vector3(0, 1.2, 0), foot.clone().lerp(top, 0.35), 0.03, metal)
    add(g, new CylinderGeometry(0.28, 0.32, 0.06, 14), metal, foot.x, 0.03, foot.z)
  }
  add(g, new CylinderGeometry(0.55, 0.7, 0.45, 3), metal, 0, 1.9, 0).rotation.y = 0.5 // frame
  add(g, new BoxGeometry(0.5, 0.35, 0.5), white, 0, 2.2, 0)
  add(g, new CylinderGeometry(0.04, 0.04, 1.3, 8), metal, 0, 2.95, 0) // mast
  add(g, new BoxGeometry(1.1, 0.04, 0.9), panel, 0, 3.65, 0) // solar panel
  add(g, new CylinderGeometry(0.1, 0.1, 0.28, 12), dark, 0.25, 2.6, 0.1).rotation.z = Math.PI / 2 // camera
  add(g, new ConeGeometry(0.25, 0.1, 16), white, -0.3, 3.4, 0.2) // antenna
  return g
}

/** Lunar Roving Vehicle: four wire wheels, a chassis, two seats and a dish antenna. About 3 m long. */
function lrv() {
  const g = new Group()
  for (const [x, z] of [[1.0, 0.95], [1.0, -0.95], [-1.0, 0.95], [-1.0, -0.95]]) {
    const wheel = add(g, new TorusGeometry(0.3, 0.07, 8, 20), dark, x, 0.37, z)
    wheel.rotation.y = Math.PI / 2
    add(g, new CylinderGeometry(0.06, 0.06, 0.2, 8), metal, x, 0.37, z * 0.93).rotation.x = Math.PI / 2
  }
  add(g, new BoxGeometry(2.4, 0.1, 1.2), metal, 0, 0.62, 0)
  for (const z of [-0.3, 0.3]) {
    add(g, new BoxGeometry(0.5, 0.06, 0.5), mat('#c9c9c2'), 0.1, 0.85, z)
    add(g, new BoxGeometry(0.06, 0.5, 0.5), mat('#c9c9c2'), -0.15, 1.1, z)
  }
  add(g, new BoxGeometry(0.3, 0.3, 0.6), foil, -0.9, 0.82, 0) // battery module
  add(g, new CylinderGeometry(0.03, 0.03, 1.2, 6), metal, 0.95, 1.2, 0.0) // mast
  add(g, new SphereGeometry(0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), white, 0.95, 1.8, 0).rotation.x = -0.9 // dish
  return g
}

/** An ALSEP-style science station: a central station, an RTG, a mast with antenna, and instruments. */
function alsep(small = false) {
  const g = new Group()
  add(g, new BoxGeometry(0.7, 0.45, 0.55), foil, 0, 0.3, 0)
  add(g, new BoxGeometry(0.75, 0.04, 0.6), white, 0, 0.55, 0)
  add(g, new CylinderGeometry(0.03, 0.03, 1.4, 6), metal, 0.25, 1.2, 0)
  add(g, new SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), white, 0.25, 1.9, 0).rotation.x = -0.5
  add(g, new BoxGeometry(0.5, 0.06, 0.5), panel, -1.1, 0.1, 0.9) // seismometer
  add(g, new CylinderGeometry(0.12, 0.12, 0.35, 12), metal, 1.2, 0.18, -0.8)
  if (!small) {
    const rtg = add(g, new CylinderGeometry(0.2, 0.2, 0.9, 12), dark, 3.0, 0.45, 0.6) // SNAP-27 generator
    rtg.rotation.z = 0.1
    for (let i = 0; i < 6; i++) add(g, new BoxGeometry(0.02, 0.5, 0.35), metal, 3.0 + Math.cos(i) * 0.25, 0.5, 0.6 + Math.sin(i) * 0.25)
  }
  return g
}

/** Mars Pathfinder lander: a tetrahedron with three opened petals. About 2.5 m across. */
function pathfinder() {
  const g = new Group()
  add(g, new CylinderGeometry(0.9, 1.0, 0.18, 3), metal, 0, 0.12, 0)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6
    const petal = add(g, new BoxGeometry(1.7, 0.05, 1.5), i === 0 ? panel : metal, Math.cos(a) * 1.15, 0.45, Math.sin(a) * 1.15)
    petal.rotation.y = -a
    petal.rotation.z = 0.35
  }
  add(g, new CylinderGeometry(0.02, 0.02, 1.4, 6), metal, 0, 1.0, 0)
  add(g, new BoxGeometry(0.25, 0.18, 0.18), dark, 0, 1.7, 0)
  return g
}

/** Sojourner: a small six-wheeled rover, 65 cm long, with a solar panel on top. */
function sojourner() {
  const g = new Group()
  add(g, new BoxGeometry(0.62, 0.18, 0.4), metal, 0, 0.3, 0)
  add(g, new BoxGeometry(0.55, 0.03, 0.35), panel, 0, 0.42, 0)
  for (const x of [-0.24, 0, 0.24]) for (const z of [-0.26, 0.26]) {
    add(g, new CylinderGeometry(0.1, 0.1, 0.09, 14), dark, x, 0.1, z).rotation.x = Math.PI / 2
  }
  return g
}

export const PROPS: Record<string, () => Group> = {
  surveyor, lrv, alsep, easep: () => alsep(true), pathfinder, sojourner,
}
