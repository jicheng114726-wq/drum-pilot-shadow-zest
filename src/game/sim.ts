import type { SfxName } from "@/game/audio";

export type Mode = "menu" | "play" | "pause" | "over";
export type Kind = "dart" | "orb" | "cruiser" | "elite";
export type PickupType = "multi" | "shield" | "speed";
export type Tint = "ice" | "amber" | "danger" | "cream";

export type Bullet = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  friendly: boolean;
  dmg: number;
  life: number;
};

export type Enemy = {
  alive: boolean;
  kind: Kind;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  speed: number;
  aim: number;
  fireCd: number;
  fireEvery: number;
  range: number;
  flash: number;
  touchCd: number;
  entered: boolean;
  phase: number;
  spin: number;
};

export type Pickup = {
  alive: boolean;
  type: PickupType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  bob: number;
};

export type Particle = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  tint: Tint;
};

export type Floater = {
  alive: boolean;
  x: number;
  y: number;
  life: number;
  max: number;
  text: string;
  tint: Tint;
};

export type Flash = {
  alive: boolean;
  x: number;
  y: number;
  angle: number;
  life: number;
  max: number;
  friendly: boolean;
};

export type Star = {
  x: number;
  y: number;
  layer: 0 | 1 | 2;
  size: number;
  tw: number;
};

const BULLETS = 280;
const ENEMIES = 20;
const PICKUPS = 10;
const PARTICLES = 200;
const FLOATERS = 18;
const FLASHES = 24;
const SFX_CAP = 10;
const spawnClock = new WeakMap<Game, number>();

export type Game = {
  w: number;
  h: number;
  scale: number;
  mode: Mode;
  time: number;
  reduce: boolean;
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    aim: number;
    hp: number;
    maxHp: number;
    r: number;
    fireCd: number;
    iframe: number;
    multiT: number;
    multiLevel: number;
    shieldT: number;
    speedT: number;
  };
  bullets: Bullet[];
  enemies: Enemy[];
  pickups: Pickup[];
  particles: Particle[];
  floaters: Floater[];
  flashes: Flash[];
  stars: Star[];
  queue: Kind[];
  qIndex: number;
  wave: number;
  intro: number;
  announce: string;
  announceT: number;
  score: number;
  combo: number;
  comboT: number;
  sinceDrop: number;
  shake: number;
  hitStop: number;
  keys: Set<string>;
  qa: Set<string> | null;
  pointer: { x: number; y: number; active: boolean; qa: boolean };
  sfx: SfxName[];
  sfxN: number;
};

function bullet(): Bullet {
  return { alive: false, x: 0, y: 0, vx: 0, vy: 0, r: 4, friendly: true, dmg: 1, life: 0 };
}
function enemy(): Enemy {
  return {
    alive: false,
    kind: "dart",
    x: 0,
    y: 0,
    r: 16,
    hp: 1,
    maxHp: 1,
    speed: 80,
    aim: 0,
    fireCd: 1,
    fireEvery: 1.4,
    range: 500,
    flash: 0,
    touchCd: 0,
    entered: false,
    phase: 0,
    spin: 1,
  };
}
function pickup(): Pickup {
  return { alive: false, type: "multi", x: 0, y: 0, vx: 0, vy: 0, r: 16, life: 0, bob: 0 };
}
function particle(): Particle {
  return { alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 2, tint: "ice" };
}
function floater(): Floater {
  return { alive: false, x: 0, y: 0, life: 0, max: 1, text: "", tint: "cream" };
}
function flash(): Flash {
  return { alive: false, x: 0, y: 0, angle: 0, life: 0, max: 0.06, friendly: true };
}

export function createGame(): Game {
  const reduce =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    w: 0,
    h: 0,
    scale: 1,
    mode: "menu",
    time: 0,
    reduce,
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      aim: -Math.PI / 2,
      hp: 100,
      maxHp: 100,
      r: 18,
      fireCd: 0,
      iframe: 0,
      multiT: 0,
      multiLevel: 0,
      shieldT: 0,
      speedT: 0,
    },
    bullets: Array.from({ length: BULLETS }, bullet),
    enemies: Array.from({ length: ENEMIES }, enemy),
    pickups: Array.from({ length: PICKUPS }, pickup),
    particles: Array.from({ length: PARTICLES }, particle),
    floaters: Array.from({ length: FLOATERS }, floater),
    flashes: Array.from({ length: FLASHES }, flash),
    stars: [],
    queue: [],
    qIndex: 0,
    wave: 1,
    intro: 0,
    announce: "",
    announceT: 0,
    score: 0,
    combo: 0,
    comboT: 0,
    sinceDrop: 0,
    shake: 0,
    hitStop: 0,
    keys: new Set(),
    qa: null,
    pointer: { x: 0, y: 0, active: false, qa: false },
    sfx: [],
    sfxN: 0,
  };
}

function pushSfx(g: Game, name: SfxName) {
  if (g.sfxN < SFX_CAP) g.sfx[g.sfxN++] = name;
}

export function drainSfx(g: Game): SfxName[] {
  const out = g.sfx.slice(0, g.sfxN);
  g.sfxN = 0;
  return out;
}

function fillStars(g: Game) {
  g.stars.length = 0;
  const count = 130;
  for (let i = 0; i < count; i += 1) {
    const layer: 0 | 1 | 2 = i % 11 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
    g.stars.push({
      x: Math.random() * Math.max(g.w, 1),
      y: Math.random() * Math.max(g.h, 1),
      layer,
      size: layer === 2 ? 2.1 : layer === 1 ? 1.45 : 1,
      tw: Math.random() * Math.PI * 2,
    });
  }
}

export function resizeGame(g: Game, w: number, h: number) {
  const nextW = Math.max(1, w);
  const nextH = Math.max(1, h);
  const first = g.w < 2 || g.h < 2;
  const prevW = g.w;
  const prevH = g.h;
  g.w = nextW;
  g.h = nextH;
  g.scale = Math.min(1.15, Math.max(0.62, Math.min(nextW, nextH) / 780));
  g.player.r = 18 * g.scale;
  if (first || g.stars.length === 0) {
    fillStars(g);
    return;
  }
  const sx = nextW / prevW;
  const sy = nextH / prevH;
  for (const star of g.stars) {
    star.x *= sx;
    star.y *= sy;
  }
  if (g.mode === "play" || g.mode === "pause") {
    g.player.x = Math.min(nextW - 24, Math.max(24, g.player.x * sx));
    g.player.y = Math.min(nextH - 24, Math.max(24, g.player.y * sy));
  }
}

function killAll(list: { alive: boolean }[]) {
  for (const item of list) item.alive = false;
}

function planWave(wave: number): Kind[] {
  const out: Kind[] = [];
  const darts = Math.min(16, 4 + wave * 2);
  const orbs = wave >= 2 ? Math.min(8, 1 + Math.floor(wave * 0.75)) : 0;
  const cruisers = wave >= 3 ? Math.min(4, Math.floor((wave - 1) / 2)) : 0;
  for (let i = 0; i < darts; i += 1) out.push("dart");
  for (let i = 0; i < orbs; i += 1) out.push("orb");
  for (let i = 0; i < cruisers; i += 1) out.push("cruiser");
  if (wave % 5 === 0) out.push("elite");
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

function beginWave(g: Game, wave: number) {
  g.wave = wave;
  g.intro = wave === 1 ? 0.85 : 1.55;
  g.announce = wave % 5 === 0 ? `第 ${wave} 波 · 旗舰` : `第 ${wave} 波`;
  g.announceT = g.intro;
  g.queue = planWave(wave);
  g.qIndex = 0;
  spawnClock.set(g, 0.2);
}

export function startRun(g: Game) {
  killAll(g.bullets);
  killAll(g.enemies);
  killAll(g.pickups);
  killAll(g.particles);
  killAll(g.floaters);
  killAll(g.flashes);
  g.score = 0;
  g.combo = 0;
  g.comboT = 0;
  g.sinceDrop = 0;
  g.shake = 0;
  g.hitStop = 0;
  g.time = 0;
  const p = g.player;
  p.x = g.w * 0.5;
  p.y = g.h * 0.7;
  p.vx = 0;
  p.vy = 0;
  p.aim = -Math.PI / 2;
  p.hp = p.maxHp;
  p.fireCd = 0.2;
  p.iframe = 0.4;
  p.multiT = 0;
  p.multiLevel = 0;
  p.shieldT = 0;
  p.speedT = 0;
  g.mode = "play";
  beginWave(g, 1);
}

export function togglePause(g: Game) {
  if (g.mode === "play") g.mode = "pause";
  else if (g.mode === "pause") g.mode = "play";
}

export function goMenu(g: Game) {
  g.mode = "menu";
  g.shake = 0;
}

function takeSlot<T extends { alive: boolean }>(list: T[]): T | null {
  for (const item of list) if (!item.alive) return item;
  return null;
}

function burst(g: Game, x: number, y: number, tint: Tint, count: number, speed: number) {
  for (let i = 0; i < count; i += 1) {
    const p = takeSlot(g.particles);
    if (!p) return;
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.35 + Math.random() * 0.85);
    p.alive = true;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s;
    p.life = 0.28 + Math.random() * 0.28;
    p.max = p.life;
    p.size = (1.6 + Math.random() * 2.4) * g.scale;
    p.tint = tint;
  }
}

function pushText(g: Game, x: number, y: number, text: string, tint: Tint) {
  const f = takeSlot(g.floaters);
  if (!f) return;
  f.alive = true;
  f.x = x;
  f.y = y;
  f.text = text;
  f.tint = tint;
  f.life = 0.8;
  f.max = 0.8;
}

function addFlash(g: Game, x: number, y: number, angle: number, friendly: boolean) {
  const f = takeSlot(g.flashes);
  if (!f) return;
  f.alive = true;
  f.x = x;
  f.y = y;
  f.angle = angle;
  f.friendly = friendly;
  f.max = friendly ? 0.07 : 0.09;
  f.life = f.max;
}

function shoot(
  g: Game,
  x: number,
  y: number,
  angle: number,
  speed: number,
  dmg: number,
  friendly: boolean,
  radius: number,
) {
  const b = takeSlot(g.bullets);
  if (!b) return;
  b.alive = true;
  b.x = x;
  b.y = y;
  b.vx = Math.cos(angle) * speed;
  b.vy = Math.sin(angle) * speed;
  b.r = radius;
  b.friendly = friendly;
  b.dmg = dmg;
  b.life = friendly ? 1.05 : 3.4;
}

function firePlayer(g: Game) {
  const p = g.player;
  const nose = p.r + 10 * g.scale;
  const x = p.x + Math.cos(p.aim) * nose;
  const y = p.y + Math.sin(p.aim) * nose;
  const level = p.multiT > 0 ? p.multiLevel : 0;
  const spreads = level >= 2 ? [-0.34, -0.17, 0, 0.17, 0.34] : level === 1 ? [-0.18, 0, 0.18] : [0];
  const speed = 860 * g.scale;
  for (const offset of spreads) {
    shoot(g, x, y, p.aim + offset, speed, 11, true, 3.3 * g.scale);
  }
  addFlash(g, x, y, p.aim, true);
  burst(g, x, y, "ice", 3, 80 * g.scale);
  pushSfx(g, "shot");
}

function spawnPickup(g: Game, x: number, y: number, type: PickupType) {
  const pk = takeSlot(g.pickups);
  if (!pk) return;
  pk.alive = true;
  pk.type = type;
  pk.x = x;
  pk.y = y;
  pk.vx = (Math.random() - 0.5) * 24 * g.scale;
  pk.vy = (Math.random() - 0.5) * 24 * g.scale;
  pk.r = 16 * g.scale;
  pk.life = 12;
  pk.bob = Math.random() * Math.PI * 2;
}

function randomPickup(): PickupType {
  const roll = Math.random();
  if (roll < 0.38) return "multi";
  if (roll < 0.7) return "shield";
  return "speed";
}

function killEnemy(g: Game, e: Enemy) {
  e.alive = false;
  const base = e.kind === "dart" ? 100 : e.kind === "orb" ? 150 : e.kind === "cruiser" ? 280 : 720;
  const mult = 1 + Math.min(8, g.combo) * 0.12;
  const gained = Math.round(base * mult);
  g.score += gained;
  g.combo += 1;
  g.comboT = 1.65;
  g.sinceDrop += 1;
  const tint: Tint = e.kind === "dart" ? "danger" : e.kind === "orb" ? "amber" : "cream";
  burst(g, e.x, e.y, tint, e.kind === "elite" ? 22 : 12, (e.kind === "elite" ? 220 : 160) * g.scale);
  pushText(g, e.x, e.y - 10, `+${gained}`, "cream");
  pushSfx(g, "explode");
  if (!g.reduce) {
    g.shake = Math.max(g.shake, e.kind === "elite" ? 11 : e.kind === "cruiser" ? 6 : 3);
    g.hitStop = Math.max(g.hitStop, e.kind === "elite" ? 0.07 : e.kind === "cruiser" ? 0.04 : 0.02);
  }
  if (g.sinceDrop >= 7 || Math.random() < 0.22) {
    g.sinceDrop = 0;
    spawnPickup(g, e.x, e.y, randomPickup());
  }
}

function hurtPlayer(g: Game, dmg: number) {
  const p = g.player;
  if (g.mode !== "play" || p.iframe > 0 || p.hp <= 0) return;
  if (p.shieldT > 0) {
    p.shieldT = Math.max(0, p.shieldT - 0.45);
    if (!g.reduce) g.shake = Math.max(g.shake, 3.5);
    burst(g, p.x, p.y, "ice", 6, 120 * g.scale);
    pushSfx(g, "block");
    return;
  }
  p.hp = Math.max(0, p.hp - dmg);
  p.iframe = 1.05;
  if (!g.reduce) g.shake = Math.max(g.shake, 10);
  burst(g, p.x, p.y, "danger", 8, 140 * g.scale);
  pushSfx(g, "hurt");
  if (p.hp <= 0) {
    p.hp = 0;
    g.mode = "over";
    burst(g, p.x, p.y, "ice", 24, 240 * g.scale);
    pushSfx(g, "over");
  }
}

function spawnEnemy(g: Game, kind: Kind) {
  const e = takeSlot(g.enemies);
  if (!e) return;
  const wave = g.wave;
  const s = g.scale;
  const hpScale = 1 + (wave - 1) * 0.1;
  const speedScale = s * (1 + (wave - 1) * 0.045);
  let hp = 36;
  let r = 16 * s;
  let speed = 120 * speedScale;
  let fireEvery = 1.5;
  let range = 640 * s;
  if (kind === "orb") {
    hp = 54;
    r = 18 * s;
    speed = 72 * speedScale;
    fireEvery = 2.2;
    range = 720 * s;
  } else if (kind === "cruiser") {
    hp = 156;
    r = 30 * s;
    speed = 50 * speedScale;
    fireEvery = 1.75;
    range = 780 * s;
  } else if (kind === "elite") {
    hp = 440;
    r = 42 * s;
    speed = 44 * speedScale;
    fireEvery = 1.35;
    range = 920 * s;
  }
  const margin = r + 28;
  let x = g.w * 0.5;
  let y = -margin;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const side = (Math.random() * 4) | 0;
    if (side === 0) {
      x = margin + Math.random() * (g.w - margin * 2);
      y = -margin;
    } else if (side === 1) {
      x = g.w + margin;
      y = margin + Math.random() * (g.h - margin * 2);
    } else if (side === 2) {
      x = margin + Math.random() * (g.w - margin * 2);
      y = g.h + margin;
    } else {
      x = -margin;
      y = margin + Math.random() * (g.h - margin * 2);
    }
    if (Math.hypot(x - g.player.x, y - g.player.y) > 240 * s) break;
  }
  e.alive = true;
  e.kind = kind;
  e.x = x;
  e.y = y;
  e.r = r;
  e.maxHp = hp * hpScale;
  e.hp = e.maxHp;
  e.speed = speed;
  e.aim = Math.atan2(g.player.y - y, g.player.x - x);
  e.fireCd = 0.45 + Math.random() * 0.8;
  e.fireEvery = fireEvery * Math.max(0.62, 1 - (wave - 1) * 0.03);
  e.range = range;
  e.flash = 0;
  e.touchCd = 0.4;
  e.entered = false;
  e.phase = Math.random() * Math.PI * 2;
  e.spin = Math.random() < 0.5 ? -1 : 1;
}

function fireEnemy(g: Game, e: Enemy) {
  const aim = Math.atan2(g.player.y - e.y, g.player.x - e.x);
  const dmgScale = 1 + (g.wave - 1) * 0.05;
  const nose = e.r * 0.85;
  const x = e.x + Math.cos(aim) * nose;
  const y = e.y + Math.sin(aim) * nose;
  if (e.kind === "dart") {
    shoot(g, x, y, aim, 270 * g.scale, 9 * dmgScale, false, 4.4 * g.scale);
  } else if (e.kind === "orb") {
    for (let i = 0; i < 6; i += 1) {
      const a = e.phase + (i * Math.PI) / 3;
      shoot(g, e.x, e.y, a, 175 * g.scale, 8 * dmgScale, false, 4.8 * g.scale);
    }
  } else if (e.kind === "cruiser") {
    for (const offset of [-0.24, 0, 0.24]) {
      shoot(g, x, y, aim + offset, 230 * g.scale, 12 * dmgScale, false, 5 * g.scale);
    }
  } else {
    for (const offset of [-0.32, -0.16, 0, 0.16, 0.32]) {
      shoot(g, x, y, aim + offset, 250 * g.scale, 13 * dmgScale, false, 5.2 * g.scale);
    }
  }
  addFlash(g, x, y, aim, false);
  pushSfx(g, "eshot");
}

function updateEnemy(g: Game, e: Enemy, dt: number) {
  const p = g.player;
  let sx = 0;
  let sy = 0;
  for (const other of g.enemies) {
    if (!other.alive || other === e) continue;
    const ox = e.x - other.x;
    const oy = e.y - other.y;
    const d = Math.hypot(ox, oy);
    const min = e.r + other.r + 12 * g.scale;
    if (d > 0.001 && d < min) {
      sx += (ox / d) * (min - d);
      sy += (oy / d) * (min - d);
    }
  }
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  let vx = ux * e.speed;
  let vy = uy * e.speed;
  if (e.kind === "orb") {
    vx = ux * e.speed * 0.45 + -uy * e.speed * e.spin;
    vy = uy * e.speed * 0.45 + ux * e.speed * e.spin;
  } else if (e.kind === "dart") {
    const weave = Math.sin(g.time * 2.4 + e.phase);
    vx += -uy * weave * 46 * g.scale;
    vy += ux * weave * 46 * g.scale;
  }
  vx += sx * 4;
  vy += sy * 4;
  e.x += vx * dt;
  e.y += vy * dt;
  const inside = e.x > e.r && e.y > e.r && e.x < g.w - e.r && e.y < g.h - e.r;
  if (inside) e.entered = true;
  if (e.entered) {
    const m = 8;
    if (e.x < e.r + m) e.x = e.r + m;
    if (e.y < e.r + m) e.y = e.r + m;
    if (e.x > g.w - e.r - m) e.x = g.w - e.r - m;
    if (e.y > g.h - e.r - m) e.y = g.h - e.r - m;
  }
  const desired = Math.atan2(dy, dx);
  const ad = Math.atan2(Math.sin(desired - e.aim), Math.cos(desired - e.aim));
  e.aim += ad * Math.min(1, dt * 7);
  e.flash = Math.max(0, e.flash - dt);
  e.touchCd = Math.max(0, e.touchCd - dt);
  if (!e.entered) return;
  e.fireCd -= dt;
  if (e.fireCd <= 0 && dist < e.range) {
    e.fireCd = e.fireEvery;
    fireEnemy(g, e);
  }
}

function axes(g: Game): { x: number; y: number } {
  const src = g.qa ?? g.keys;
  let x = 0;
  let y = 0;
  if (src.has("KeyA") || src.has("ArrowLeft")) x -= 1;
  if (src.has("KeyD") || src.has("ArrowRight")) x += 1;
  if (src.has("KeyW") || src.has("ArrowUp")) y -= 1;
  if (src.has("KeyS") || src.has("ArrowDown")) y += 1;
  const len = Math.hypot(x, y);
  if (len > 0) return { x: x / len, y: y / len };
  if (g.qa) return { x: 0, y: 0 };
  if (g.pointer.active) {
    const dx = g.pointer.x - g.player.x;
    const dy = g.pointer.y - g.player.y;
    const d = Math.hypot(dx, dy);
    const dead = 14 * g.scale;
    if (d > dead) {
      const ease = Math.min(1, (d - dead) / (96 * g.scale));
      return { x: (dx / d) * ease, y: (dy / d) * ease };
    }
  }
  return { x: 0, y: 0 };
}

function updatePlayer(g: Game, dt: number) {
  const p = g.player;
  const move = axes(g);
  const max = 360 * g.scale * (p.speedT > 0 ? 1.58 : 1);
  const desiredX = move.x * max;
  const desiredY = move.y * max;
  const rate = p.speedT > 0 ? 16 : 11;
  const k = 1 - Math.exp(-rate * dt);
  p.vx += (desiredX - p.vx) * k;
  p.vy += (desiredY - p.vy) * k;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  const top = 76;
  const bot = 88;
  const side = 18;
  if (p.x < side) {
    p.x = side;
    p.vx = Math.max(0, p.vx);
  } else if (p.x > g.w - side) {
    p.x = g.w - side;
    p.vx = Math.min(0, p.vx);
  }
  if (p.y < top) {
    p.y = top;
    p.vy = Math.max(0, p.vy);
  } else if (p.y > g.h - bot) {
    p.y = g.h - bot;
    p.vy = Math.min(0, p.vy);
  }

  let target = -Math.PI / 2;
  let best = Number.POSITIVE_INFINITY;
  let found = false;
  for (const e of g.enemies) {
    if (!e.alive) continue;
    const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
    if (d < best) {
      best = d;
      target = Math.atan2(e.y - p.y, e.x - p.x);
      found = true;
    }
  }
  if (!found) target = p.aim;
  const ad = Math.atan2(Math.sin(target - p.aim), Math.cos(target - p.aim));
  p.aim += ad * (1 - Math.exp(-12 * dt));

  p.fireCd -= dt;
  if (p.fireCd <= 0) {
    p.fireCd = p.multiT > 0 ? 0.13 : 0.15;
    firePlayer(g);
  }
  p.iframe = Math.max(0, p.iframe - dt);
  p.multiT = Math.max(0, p.multiT - dt);
  if (p.multiT <= 0) p.multiLevel = 0;
  p.shieldT = Math.max(0, p.shieldT - dt);
  p.speedT = Math.max(0, p.speedT - dt);

  if (Math.hypot(p.vx, p.vy) > 40 * g.scale && Math.random() < dt * 28) {
    const back = p.aim + Math.PI;
    const jet = takeSlot(g.particles);
    if (jet) {
      jet.alive = true;
      jet.x = p.x + Math.cos(back) * p.r * 0.85;
      jet.y = p.y + Math.sin(back) * p.r * 0.85;
      jet.vx = Math.cos(back) * 40 * g.scale + (Math.random() - 0.5) * 20;
      jet.vy = Math.sin(back) * 40 * g.scale + (Math.random() - 0.5) * 20;
      jet.life = 0.22;
      jet.max = 0.22;
      jet.size = 2.4 * g.scale;
      jet.tint = p.speedT > 0 ? "cream" : "amber";
    }
  }
}

function takePickup(g: Game, type: PickupType) {
  const p = g.player;
  if (type === "multi") {
    p.multiLevel = p.multiT > 0 ? 2 : 1;
    p.multiT = 9;
    pushText(g, p.x, p.y - 28 * g.scale, p.multiLevel >= 2 ? "五重射击" : "三重射击", "amber");
  } else if (type === "shield") {
    p.shieldT = 7.5;
    pushText(g, p.x, p.y - 28 * g.scale, "护盾", "ice");
  } else {
    p.speedT = 8;
    pushText(g, p.x, p.y - 28 * g.scale, "加速", "amber");
  }
  pushSfx(g, "pickup");
}

function updateStars(g: Game, dt: number) {
  const slow = g.reduce ? 0.35 : 1;
  const speeds = [16, 38, 72];
  for (const star of g.stars) {
    star.y += speeds[star.layer] * g.scale * slow * dt;
    star.tw += dt * (0.8 + star.layer);
    if (star.y > g.h + 4) {
      star.y = -4;
      star.x = Math.random() * g.w;
    }
  }
}

function maybeAdvance(g: Game) {
  if (g.intro > 0) return;
  if (g.qIndex < g.queue.length) return;
  for (const e of g.enemies) if (e.alive) return;
  const bonus = 160 + g.wave * 50;
  g.score += bonus;
  g.player.hp = Math.min(g.player.maxHp, g.player.hp + 14);
  pushText(g, g.w * 0.5, g.h * 0.42, `波次奖励 +${bonus}`, "amber");
  spawnPickup(g, g.w * 0.5 + (Math.random() - 0.5) * 80, g.h * 0.46, randomPickup());
  pushSfx(g, "wave");
  beginWave(g, g.wave + 1);
}

function updateFx(g: Game, dt: number) {
  for (const part of g.particles) {
    if (!part.alive) continue;
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.life -= dt;
    if (part.life <= 0) part.alive = false;
  }
  for (const f of g.floaters) {
    if (!f.alive) continue;
    f.y -= 28 * g.scale * dt;
    f.life -= dt;
    if (f.life <= 0) f.alive = false;
  }
  for (const fl of g.flashes) {
    if (!fl.alive) continue;
    fl.life -= dt;
    if (fl.life <= 0) fl.alive = false;
  }
}

export function step(g: Game, dt: number) {
  if (g.mode !== "pause") updateStars(g, dt);
  g.time += dt;
  if (g.mode === "over") {
    updateFx(g, dt);
    g.shake *= Math.exp(-4.4 * dt);
    return;
  }
  if (g.mode !== "play") return;

  g.shake *= Math.exp(-4.4 * dt);
  if (g.hitStop > 0) {
    g.hitStop -= dt;
    return;
  }

  g.intro = Math.max(0, g.intro - dt);
  g.announceT = Math.max(0, g.announceT - dt);
  g.comboT = Math.max(0, g.comboT - dt);
  if (g.comboT <= 0) g.combo = 0;

  updatePlayer(g, dt);
  if (g.mode !== "play") return;

  tickSpawns(g, dt);

  for (const e of g.enemies) if (e.alive) updateEnemy(g, e, dt);
  if (g.mode !== "play") return;

  for (const b of g.bullets) {
    if (!b.alive) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    const margin = 80;
    if (b.life <= 0 || b.x < -margin || b.y < -margin || b.x > g.w + margin || b.y > g.h + margin) {
      b.alive = false;
    }
  }

  for (const pk of g.pickups) {
    if (!pk.alive) continue;
    pk.life -= dt;
    const dx = g.player.x - pk.x;
    const dy = g.player.y - pk.y;
    const d = Math.hypot(dx, dy);
    if (d < 130 * g.scale && d > 1) {
      pk.x += (dx / d) * 140 * g.scale * dt;
      pk.y += (dy / d) * 140 * g.scale * dt;
    } else {
      pk.x += pk.vx * dt;
      pk.y += pk.vy * dt;
    }
    if (pk.life <= 0) pk.alive = false;
    else if (d < g.player.r + pk.r) {
      pk.alive = false;
      takePickup(g, pk.type);
    }
  }

  const p = g.player;
  for (const b of g.bullets) {
    if (!b.alive || !b.friendly) continue;
    for (const e of g.enemies) {
      if (!e.alive) continue;
      const hit = e.r * 0.78 + b.r;
      if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 <= hit * hit) {
        b.alive = false;
        e.hp -= b.dmg;
        e.flash = 0.08;
        burst(g, b.x, b.y, "cream", 3, 70 * g.scale);
        if (e.hp <= 0) killEnemy(g, e);
        else pushSfx(g, "hit");
        break;
      }
    }
  }
  if (g.mode !== "play") return;

  for (const b of g.bullets) {
    if (!b.alive || b.friendly) continue;
    const hit = p.r * 0.72 + b.r;
    if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= hit * hit) {
      b.alive = false;
      hurtPlayer(g, b.dmg);
      if (g.mode !== "play") return;
    }
  }

  for (const e of g.enemies) {
    if (!e.alive || e.touchCd > 0) continue;
    const hit = e.r * 0.72 + p.r * 0.72;
    if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 <= hit * hit) {
      e.touchCd = 0.85;
      const dmg = e.kind === "elite" ? 26 : e.kind === "cruiser" ? 20 : 16;
      const nx = e.x - p.x;
      const ny = e.y - p.y;
      const nd = Math.hypot(nx, ny) || 1;
      e.x += (nx / nd) * 18 * g.scale;
      e.y += (ny / nd) * 18 * g.scale;
      hurtPlayer(g, dmg);
      if (g.mode !== "play") return;
    }
  }

  updateFx(g, dt);
  maybeAdvance(g);
}

function tickSpawns(g: Game, dt: number) {
  if (g.intro > 0 || g.qIndex >= g.queue.length) return;
  let alive = 0;
  for (const e of g.enemies) if (e.alive) alive += 1;
  if (alive >= 12) return;
  const prev = spawnClock.get(g) ?? 0;
  const next = prev - dt;
  if (next > 0) {
    spawnClock.set(g, next);
    return;
  }
  const kind = g.queue[g.qIndex];
  if (!kind) return;
  g.qIndex += 1;
  spawnEnemy(g, kind);
  const wait = Math.max(0.26, 0.68 - g.wave * 0.028) * (0.82 + Math.random() * 0.36);
  spawnClock.set(g, wait);
}

export function setQaKeys(g: Game, codes: string[]) {
  g.qa = new Set(codes);
  g.pointer.qa = false;
}

export function setQaPointer(g: Game, x: number, y: number, active: boolean) {
  g.qa = null;
  g.pointer.qa = true;
  g.pointer.x = x;
  g.pointer.y = y;
  g.pointer.active = active;
}

export function pointFromUser(g: Game, x: number, y: number, active: boolean) {
  if (g.qa || g.pointer.qa) return;
  g.pointer.x = x;
  g.pointer.y = y;
  g.pointer.active = active;
}
