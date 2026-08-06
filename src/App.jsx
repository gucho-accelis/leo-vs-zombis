import { useRef, useEffect, useState, useCallback } from "react";

// Rutas a los sprites. Estan en public/sprites/, asi que la ruta empieza por /sprites/.
// Para cambiar una animacion, cambia solo la ruta de esta lista.
const SPR = {
  "run0": "/sprites/characters/leo/common/run_0.png",
  "run1": "/sprites/characters/leo/common/run_1.png",
  "run2": "/sprites/characters/leo/common/run_2.png",
  "run3": "/sprites/characters/leo/common/run_3.png",
  "hurt": "/sprites/characters/leo/common/hurt.png",
  "ko": "/sprites/characters/leo/common/ko.png",
  "win": "/sprites/characters/leo/common/victory.png",
  "b_idle": "/sprites/characters/leo/weapons/01_basketball/idle.png",
  "b_run": "/sprites/characters/leo/weapons/01_basketball/run.png",
  "b_atk": "/sprites/characters/leo/weapons/01_basketball/attack.png",
  "s_idle": "/sprites/characters/leo/weapons/02_slingshot/idle.png",
  "s_atk": "/sprites/characters/leo/weapons/02_slingshot/attack.png",
  "w_idle": "/sprites/characters/leo/weapons/03_watergun/idle.png",
  "w_atk": "/sprites/characters/leo/weapons/03_watergun/attack.png",
  "p_ball": "/sprites/projectiles/basketball.png",
  "p_spray": "/sprites/projectiles/water_spray.png",
  "z1_w0": "/sprites/enemies/01_kid/walk_0.png",
  "z1_w1": "/sprites/enemies/01_kid/walk_1.png",
  "z1_atk": "/sprites/enemies/01_kid/attack.png",
  "z2_w0": "/sprites/enemies/02_classic/walk_0.png",
  "z2_w1": "/sprites/enemies/02_classic/walk_1.png",
  "z2_atk": "/sprites/enemies/02_classic/attack.png",
  "z3_w0": "/sprites/enemies/03_brute/idle.png",
  "z3_w1": "/sprites/enemies/03_brute/walk_0.png",
  "z3_atk": "/sprites/enemies/03_brute/attack.png",
  "bg1": "/sprites/backgrounds/bg_01.jpg",
  "bg2": "/sprites/backgrounds/bg_02.jpg",
  "bg3": "/sprites/backgrounds/bg_03.jpg",
  "bg4": "/sprites/backgrounds/bg_04.jpg",
  "bg5": "/sprites/backgrounds/bg_05.jpg"
};

/* ===== CONFIG ===== */
const W = 760, H = 420, GY = 372, LEO_X = 175, LEO_H = 104;
const BG_KEYS = ["bg1", "bg2", "bg3", "bg4", "bg5"];

const C = {
  ink: "#241E17", sky1: "#8FD4F0", sky2: "#CFEDF7",
  hillFar: "#7FB86A", hillNear: "#5E9E52",
  ground: "#C9A46B", groundD: "#A8814B", grass: "#6FB65A", grassD: "#569444",
  ui: "#1E2A22", card: "#2B3B31", line: "#3E5646",
};

const WEAPONS = {
  basket: { key: "basket", name: "Balón de baloncesto", icon: "🏀", idle: "b_idle", run: "b_run", atk: "b_atk", dmg: 1.5, rate: 1.0, spd: 620, pr: 15, proj: "p_ball", desc: "Fuerte y lento" },
  sling: { key: "sling", name: "Tirachinas", icon: "🪃", idle: "s_idle", run: null, atk: "s_atk", dmg: 0.8, rate: 0.5, spd: 900, pr: 7, proj: null, desc: "Rápido y preciso" },
  water: { key: "water", name: "Pistola de agua", icon: "🔫", idle: "w_idle", run: null, atk: "w_atk", dmg: 0.4, rate: 0.24, spd: 760, pr: 13, proj: "p_spray", desc: "Ráfaga, atraviesa" },
};

const KINDS = {
  walker: { hp: 46, spd: 30, dmg: 7, h: 92, gold: 9, goo: "#8FA84F", frames: ["z2_w0", "z2_w1"], atk: "z2_atk", fps: 4 },
  runner: { hp: 28, spd: 74, dmg: 6, h: 80, gold: 12, goo: "#9BB05A", frames: ["z1_w0", "z1_w1"], atk: "z1_atk", fps: 9 },
  brute: { hp: 130, spd: 20, dmg: 15, h: 126, gold: 26, goo: "#7E8F4C", frames: ["z3_w0", "z3_w1"], atk: "z3_atk", fps: 3 },
  boss: { hp: 660, spd: 22, dmg: 24, h: 176, gold: 150, goo: "#D946EF", frames: ["z3_w0", "z3_w1"], atk: "z3_atk", fps: 2.5, boss: true },
};

const UPGRADES = [
  { id: "dmg", icon: "🔥", name: "Tiro potente", desc: "+30% de daño", ap: p => { p.dmg *= 1.3; } },
  { id: "spd", icon: "👟", name: "Botas veloces", desc: "+25% de cadencia", ap: p => { p.rate *= 0.8; } },
  { id: "hp", icon: "❤️", name: "Corazón de campeón", desc: "+30 vida máx. y cura", ap: p => { p.maxHp += 30; p.hp = p.maxHp; } },
  { id: "crit", icon: "🎯", name: "Puntería", desc: "+14% de crítico (x2)", ap: p => { p.crit += 0.14; } },
  { id: "multi", icon: "➕", name: "Tiro doble", desc: "+1 proyectil por disparo", ap: p => { p.multi += 1; } },
  { id: "armor", icon: "🛡️", name: "Piel dura", desc: "-20% de daño recibido", ap: p => { p.armor *= 0.8; } },
  { id: "steal", icon: "🩹", name: "Segundo aire", desc: "+2 vida por golpe", ap: p => { p.steal += 2; } },
  { id: "gold", icon: "💰", name: "Fichaje", desc: "+40% de monedas", ap: p => { p.gold *= 1.4; } },
  { id: "pierce", icon: "🌀", name: "Efecto", desc: "Los tiros atraviesan +1", ap: p => { p.pierce += 1; } },
  { id: "super", icon: "⚡", name: "Súper recarga", desc: "-30% de espera del súper", ap: p => { p.superCd *= 0.7; } },
];
const WEAPON_CARDS = [
  { id: "w_sling", icon: "🪃", name: "¡Tirachinas!", desc: "Arma nueva: rápida y precisa", w: "sling" },
  { id: "w_water", icon: "🔫", name: "¡Pistola de agua!", desc: "Arma nueva: ráfaga que atraviesa", w: "water" },
];

/* ===== SOUND ===== */
let AC = null; const audio = { on: true };
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } } return AC; }
function tone(f, d, t = "square", v = 0.04, sl = 0) {
  if (!audio.on) return; const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = t; o.frequency.setValueAtTime(f, a.currentTime);
  if (sl) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + sl), a.currentTime + d);
  g.gain.setValueAtTime(v, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + d);
}
const SFX = {
  shot: () => tone(520, 0.06, "square", 0.022, -220),
  pop: () => tone(760, 0.04, "square", 0.014, -300),
  charge: () => { [200, 300, 450, 700, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.18, "sawtooth", 0.045), i * 90)); },
  blast: () => { tone(120, 0.5, "sawtooth", 0.07, 500); setTimeout(() => tone(900, 0.3, "triangle", 0.05, -600), 80); },
  hit: () => tone(330, 0.04, "square", 0.016, -110),
  die: () => tone(160, 0.16, "sawtooth", 0.035, -90),
  ouch: () => tone(240, 0.16, "sawtooth", 0.05, -120),
  coin: () => { tone(880, 0.06, "triangle", 0.03); setTimeout(() => tone(1320, 0.07, "triangle", 0.026), 55); },
  boss: () => { tone(110, 0.4, "sawtooth", 0.06); setTimeout(() => tone(82, 0.5, "sawtooth", 0.06), 200); },
  up: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.12, "triangle", 0.035), i * 70)),
  ko: () => [400, 330, 260, 180].forEach((f, i) => setTimeout(() => tone(f, 0.22, "sawtooth", 0.05), i * 150)),
};

/* ===== STATE ===== */
const freshP = () => ({
  hp: 130, maxHp: 130, dmg: 16, rate: 1, crit: 0.05, multi: 1,
  armor: 1, steal: 0, gold: 1, pierce: 0, superCd: 8,
  weapon: "basket", owned: { basket: true },
});
const freshGame = () => ({
  p: freshP(), coins: 0, enc: 0, dist: 0, worldX: 0,
  enemies: [], balls: [], parts: [], texts: [], fx: [],
  atkT: 0, supT: 0, superT: 0, chargeT: 0, state: "run", anim: 0, poseT: 0, hurtT: 0,
  shake: 0, shakeT: 0, nextEnc: 400, spawnQ: [], spawnT: 0, clouds: [], flash: 0,
});

function encounter(n) {
  const isBoss = n > 0 && n % 5 === 0;
  const s = Math.pow(1.16, n);
  if (isBoss) return { boss: true, list: [{ k: "boss", s }, { k: "runner", s }, { k: "runner", s }] };
  const count = Math.min(6, 2 + Math.floor(n / 2));
  const list = [];
  for (let i = 0; i < count; i++) {
    let k = "walker";
    if (n >= 2 && i % 3 === 2) k = "runner";
    if (n >= 4 && i % 5 === 4) k = "brute";
    list.push({ k, s });
  }
  return { boss: false, list };
}
const hitC = e => ({ x: e.x, y: GY - e.h * 0.55, r: e.h * 0.34 });

function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const inked = (c, f, lw = 3) => { c.fillStyle = f; c.fill(); c.strokeStyle = C.ink; c.lineWidth = lw; c.lineJoin = "round"; c.stroke(); };

/* ===== COMPONENT ===== */
export default function LeoRun() {
  const cv = useRef(null);
  const g = useRef(freshGame());
  const IMG = useRef({});
  const phaseRef = useRef("run");
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState("run");
  const [hud, setHud] = useState({ hp: 130, maxHp: 130, coins: 0, enc: 0, sup: 0, weapon: "basket" });
  const [choices, setChoices] = useState([]);
  const [taken, setTaken] = useState([]);
  const [muted, setMuted] = useState(false);
  const [banner, setBanner] = useState(null);

  const setPhaseBoth = p => { phaseRef.current = p; setPhase(p); };
  const shake = m => { const s = g.current; s.shake = Math.max(s.shake, m); s.shakeT = 0.3; };

  useEffect(() => {
    const keys = Object.keys(SPR); let n = 0;
    keys.forEach(k => {
      const im = new Image();
      im.onload = () => { n++; if (n === keys.length) setReady(true); };
      im.src = SPR[k]; IMG.current[k] = im;
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const ctx = cv.current.getContext("2d");
    let raf, last = performance.now();
    const loop = now => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (phaseRef.current === "run" || phaseRef.current === "fight") step(dt); else cosmetic(dt);
      draw(ctx); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  const cosmetic = dt => {
    const s = g.current;
    if (s.shakeT > 0) { s.shakeT -= dt; if (s.shakeT <= 0) s.shake = 0; }
    if (s.flash > 0) s.flash -= dt * 3;
    for (let i = s.parts.length - 1; i >= 0; i--) {
      const p = s.parts[i]; p.t -= dt; p.vy += (p.g === undefined ? 340 : p.g) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; if (p.t <= 0) s.parts.splice(i, 1);
    }
    for (let i = s.texts.length - 1; i >= 0; i--) { const t = s.texts[i]; t.t -= dt; t.y -= 36 * dt; if (t.t <= 0) s.texts.splice(i, 1); }
    for (let i = s.fx.length - 1; i >= 0; i--) { s.fx[i].t -= dt; if (s.fx[i].t <= 0) s.fx.splice(i, 1); }
  };

  /* ---- sim ---- */
  const step = dt => {
    const s = g.current, p = s.p;
    cosmetic(dt);
    if (s.supT > 0) s.supT -= dt;
    if (s.hurtT > 0) s.hurtT -= dt;
    if (s.poseT > 0) { s.poseT -= dt; if (s.poseT <= 0 && (s.state === "atk" || s.state === "hurt" || s.state === "win")) s.state = phaseRef.current === "run" ? "run" : "idle"; }

    /* charging super */
    if (s.chargeT > 0) {
      s.chargeT -= dt;
      s.state = "idle";
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        s.parts.push({ x: LEO_X + Math.cos(a) * 46, y: GY - 10 - Math.random() * 20, vx: -Math.cos(a) * 40, vy: -160 - Math.random() * 140, t: .5, r: 2 + Math.random() * 3, c: Math.random() < .5 ? "#FFE066" : "#FFF7C2", g: -60 });
      }
      shake(3);
      if (s.chargeT <= 0) {
        s.superT = 2.2; s.flash = 1; shake(14); SFX.blast();
        for (let i = 0; i < 44; i++) {
          const a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 320;
          s.parts.push({ x: LEO_X, y: GY - 52, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: .55, r: 2 + Math.random() * 5, c: Math.random() < .5 ? "#FFD54A" : "#FFF3C4", g: 40 });
        }
      }
      syncHud(s); return;
    }
    if (s.superT > 0) {
      s.superT -= dt;
      for (let i = 0; i < 2; i++) s.parts.push({ x: LEO_X + (Math.random() - .5) * 54, y: GY - Math.random() * 14, vx: (Math.random() - .5) * 30, vy: -180 - Math.random() * 120, t: .45, r: 2 + Math.random() * 3, c: "#FFE066", g: -40 });
    }

    if (phaseRef.current === "run") {
      if (s.poseT <= 0) s.state = "run";
      const v = (s.state === "win" && s.poseT > 0) ? 0 : 170;
      s.worldX += v * dt; s.dist += v * dt; s.anim = s.dist / 24;
      if (Math.random() < dt * 9) s.parts.push({ x: LEO_X - 24, y: GY - 3, vx: -60 - Math.random() * 40, vy: -30 * Math.random(), t: .35, r: 2 + Math.random() * 2, c: "#D9BE8C" });
      if (s.dist >= s.nextEnc) {
        const e = encounter(s.enc);
        s.spawnQ = e.list.map((x, i) => ({ ...x, delay: i * .35 })); s.spawnT = 0;
        s.state = "idle"; s.poseT = 0;
        setPhaseBoth("fight");
        if (e.boss) { SFX.boss(); shake(8); showBanner("👹 ¡JEFE!", true); }
      }
      syncHud(s); return;
    }

    /* fight */
    if (s.spawnQ.length) {
      s.spawnT += dt;
      while (s.spawnQ.length && s.spawnT >= s.spawnQ[0].delay) {
        const q = s.spawnQ.shift(), k = KINDS[q.k];
        s.enemies.push({ kind: q.k, x: W + 30 + Math.random() * 90, h: k.h, hp: k.hp * q.s, max: k.hp * q.s, anim: Math.random() * 4, flash: 0, sq: 0, atk: .9, lag: 1, swing: 0 });
      }
    }

    for (const e of s.enemies) {
      const k = KINDS[e.kind];
      const reach = LEO_X + 34 + e.h * .28;
      if (e.x > reach) e.x -= k.spd * dt;
      else {
        e.atk -= dt;
        if (e.atk <= 0) {
          e.atk = 1.1; e.swing = .45;
          const d = Math.max(1, Math.round(k.dmg * Math.pow(1.1, s.enc) * p.armor));
          p.hp -= d; s.hurtT = .3; s.state = "hurt"; s.poseT = .3;
          SFX.ouch(); shake(6);
          s.texts.push({ x: LEO_X, y: GY - 110, t: .7, txt: "-" + d, c: "#FF6B6B", size: 19 });
          if (p.hp <= 0) { p.hp = 0; s.state = "ko"; SFX.ko(); setPhaseBoth("gameover"); return; }
        }
      }
      e.anim += dt * KINDS[e.kind].fps;
      if (e.swing > 0) e.swing -= dt;
      if (e.flash > 0) e.flash -= dt * 8;
      if (e.sq > 0) e.sq -= dt * 5;
      e.lag += (e.hp / e.max - e.lag) * Math.min(1, dt * 4);
    }

    if (s.poseT <= 0 && s.state === "run") s.state = "idle";

    const wpn = WEAPONS[p.weapon];
    s.atkT -= dt;
    const visible = s.enemies.some(e => e.x < W - 40);
    if (s.atkT <= 0 && visible) {
      s.atkT = wpn.rate * p.rate * (s.superT > 0 ? .45 : 1);
      fire(s);
    }

    for (let i = s.balls.length - 1; i >= 0; i--) {
      const b = s.balls[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += dt * 12;
      if (b.sup && Math.random() < dt * 50) s.parts.push({ x: b.x, y: b.y, vx: -100 - Math.random() * 60, vy: (Math.random() - .5) * 70, t: .3, r: 3 + Math.random() * 4, c: Math.random() < .5 ? "#FF8A3D" : "#FFD54A", g: 0 });
      let gone = b.x > W + 60 || b.y < -40 || b.y > H + 40;
      for (const e of s.enemies) {
        if (e.hp <= 0 || b.hits.includes(e)) continue;
        const c = hitC(e);
        if (Math.hypot(b.x - c.x, b.y - c.y) < c.r + b.r) {
          b.hits.push(e); damage(s, e, b.dmg, b.sup);
          if (b.sup) {
            for (const o of s.enemies) if (o !== e && Math.abs(o.x - e.x) < 90) damage(s, o, b.dmg * .5, false);
            s.fx.push({ x: c.x, y: c.y, r: 84, t: .28, c: "#FFD54A" }); shake(8);
          }
          if (b.hits.length > b.pierce) gone = true;
          break;
        }
      }
      if (gone) s.balls.splice(i, 1);
    }

    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i]; if (e.hp > 0) continue;
      const k = KINDS[e.kind], c = hitC(e);
      const gain = Math.round(k.gold * p.gold);
      s.coins += gain; SFX.die();
      for (let n = 0; n < (k.boss ? 30 : 12); n++) {
        const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 170;
        s.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, t: .5 + Math.random() * .4, r: 2 + Math.random() * 5, c: k.goo });
      }
      s.texts.push({ x: c.x, y: c.y - 20, t: .8, txt: "+" + gain, c: "#FFD54A", size: k.boss ? 26 : 16 });
      if (k.boss) { shake(12); SFX.coin(); }
      s.enemies.splice(i, 1);
    }

    if (!s.enemies.length && !s.spawnQ.length) {
      s.enc++;
      s.nextEnc = s.dist + 360 + Math.random() * 150;
      s.state = "win"; s.poseT = .7;
      if (s.enc % 3 === 0 || s.enc % 5 === 0) {
        SFX.up();
        const pool = [...UPGRADES];
        WEAPON_CARDS.forEach(c => { if (!p.owned[c.w]) pool.push(c); });
        setChoices(pool.sort(() => Math.random() - .5).slice(0, 3));
        setPhaseBoth("upgrade");
      } else { showBanner("¡Zona despejada!", false); setPhaseBoth("run"); }
    }
    syncHud(s);
  };

  const fire = s => {
    const p = s.p, wpn = WEAPONS[p.weapon];
    s.state = "atk"; s.poseT = Math.max(.16, wpn.rate * .7);
    let tgt = null, bx = Infinity;
    for (const e of s.enemies) if (e.x < bx && e.x < W - 20) { bx = e.x; tgt = e; }
    if (!tgt) return;
    const c = hitC(tgt);
    const mx = LEO_X + 40, my = GY - 56;
    const sup = s.superT > 0;
    const n = sup ? 2 : p.multi;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * 0.09;
      const ang = Math.atan2(c.y - my, c.x - mx) + spread;
      const speed = wpn.spd;
      s.balls.push({
        x: mx, y: my, rot: 0, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        dmg: p.dmg * wpn.dmg * (sup ? 5 : 1), pierce: p.pierce + (sup ? 5 : 0), hits: [], sup,
        r: sup ? wpn.pr * 1.7 : wpn.pr, kind: p.weapon,
      });
    }
    s.fx.push({ x: mx + 6, y: my, r: sup ? 30 : 14, t: .11, c: sup ? "#FFD54A" : "#FFF3C4" });
    sup ? SFX.pop() : (p.weapon === "water" ? SFX.pop() : SFX.shot());
  };

  const damage = (s, e, dmg, sup) => {
    const p = s.p, crit = Math.random() < p.crit;
    const d = crit ? dmg * 2 : dmg;
    e.hp -= d; e.flash = 1; e.sq = .35; SFX.hit();
    if (p.steal && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + p.steal);
    const c = hitC(e);
    if (crit || sup) s.texts.push({ x: c.x, y: c.y - c.r, t: .6, txt: Math.round(d) + (crit ? "!" : ""), c: sup ? "#FFD54A" : crit ? "#FFE066" : "#FFF", size: sup ? 24 : 20 });
  };

  const showBanner = (txt, boss) => { setBanner({ txt, boss, k: Date.now() }); setTimeout(() => setBanner(null), 1500); };

  const syncHud = s => setHud(h => {
    const sup = Math.max(0, s.supT);
    if (h.hp === s.p.hp && h.maxHp === s.p.maxHp && h.coins === s.coins && h.enc === s.enc && h.weapon === s.p.weapon && Math.abs(h.sup - sup) < .05) return h;
    return { hp: s.p.hp, maxHp: s.p.maxHp, coins: s.coins, enc: s.enc, sup, weapon: s.p.weapon };
  });

  /* ---- draw ---- */
  const draw = ctx => {
    const s = g.current, T = performance.now() / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    if (s.shake > 0 && s.shakeT > 0) {
      const m = s.shake * (s.shakeT / .3);
      ctx.translate((Math.random() - .5) * m * 2, (Math.random() - .5) * m * 2);
    }
    drawBackdrop(ctx, s.worldX);

    for (const e of s.enemies) drawEnemy(ctx, e);
    drawLeo(ctx, s, T);
    for (const b of s.balls) drawBall(ctx, b);

    for (const p of s.parts) { ctx.globalAlpha = Math.min(1, p.t * 2.4); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const f of s.fx) {
      ctx.globalAlpha = Math.min(1, f.t * 4) * .6; ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.textAlign = "center";
    for (const t of s.texts) {
      ctx.globalAlpha = Math.min(1, t.t * 2.2);
      ctx.font = "900 " + t.size + "px ui-rounded, system-ui, sans-serif";
      ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.lineJoin = "round";
      ctx.strokeText(t.txt, t.x, t.y); ctx.fillStyle = t.c; ctx.fillText(t.txt, t.x, t.y);
      ctx.globalAlpha = 1;
    }
    if (s.flash > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(255,247,200," + Math.min(.85, s.flash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  };

  const bgW = key => {
    const im = IMG.current[key];
    return im ? im.width * H / im.height : 0;
  };

  const drawBackdrop = (ctx, worldX) => {
    const ws = BG_KEYS.map(bgW);
    const cycle = ws.reduce((a, b) => a + b, 0);
    if (!cycle) return;
    const pos = ((worldX % cycle) + cycle) % cycle;
    let idx = 0, acc = 0;
    for (let i = 0; i < ws.length; i++) {
      if (pos < acc + ws[i]) { idx = i; break; }
      acc += ws[i];
    }
    let x = -(pos - acc);
    let guard = 0;
    while (x < W && guard++ < 12) {
      const im = IMG.current[BG_KEYS[idx]];
      if (im) ctx.drawImage(im, Math.round(x) - 1, 0, Math.ceil(ws[idx]) + 2, H);
      x += ws[idx];
      idx = (idx + 1) % BG_KEYS.length;
    }
    const vg = ctx.createLinearGradient(0, GY - 60, 0, H);
    vg.addColorStop(0, "rgba(8,12,20,0)");
    vg.addColorStop(1, "rgba(8,12,20,.35)");
    ctx.fillStyle = vg; ctx.fillRect(0, GY - 60, W, H - GY + 60);
  };

  const drawLeo = (ctx, s, T) => {
    const wpn = WEAPONS[s.p.weapon];
    let key = wpn.idle;
    if (s.state === "run") {
      const seq = [0, 1, 2, 3, 2, 1];
      key = wpn.run && Math.floor(s.anim) % 2 === 0 ? wpn.run : "run" + seq[Math.floor(s.anim) % 6];
    }
    else if (s.state === "atk") key = wpn.atk;
    else if (s.state === "hurt") key = "hurt";
    else if (s.state === "ko") key = "ko";
    else if (s.state === "win") key = "win";
    const im = IMG.current[key]; if (!im) return;
    const h = LEO_H, w = im.width * h / im.height;
    const bob = s.state === "run" ? Math.abs(Math.sin(s.anim * Math.PI)) * -3 : Math.sin(T * 3) * 1.5;
    const superOn = s.superT > 0 || s.chargeT > 0;
    const charge = s.chargeT > 0 ? 1 - s.chargeT / .7 : 1;

    ctx.save();
    ctx.beginPath(); ctx.ellipse(LEO_X, GY - 2, w * .38, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fill();

    if (superOn) {
      // aura
      const pulse = 1 + Math.sin(T * 22) * .06;
      const gr = ctx.createRadialGradient(LEO_X, GY - h * .5, 8, LEO_X, GY - h * .5, h * .95 * pulse * (0.6 + charge * 0.4));
      gr.addColorStop(0, "rgba(255,240,150,.85)");
      gr.addColorStop(.45, "rgba(255,200,60,.45)");
      gr.addColorStop(1, "rgba(255,170,30,0)");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.ellipse(LEO_X, GY - h * .5, h * .62 * pulse, h * .92 * pulse, 0, 0, Math.PI * 2); ctx.fill();
      // flame tongues
      ctx.fillStyle = "rgba(255,225,110,.75)";
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * .42 + Math.sin(T * 9 + i) * .1;
        const len = h * (.55 + Math.sin(T * 14 + i * 2) * .18);
        ctx.beginPath();
        ctx.moveTo(LEO_X + Math.cos(a - .16) * 26, GY - h * .5 + Math.sin(a - .16) * 30);
        ctx.lineTo(LEO_X + Math.cos(a) * len, GY - h * .5 + Math.sin(a) * len);
        ctx.lineTo(LEO_X + Math.cos(a + .16) * 26, GY - h * .5 + Math.sin(a + .16) * 30);
        ctx.closePath(); ctx.fill();
      }
      // lightning
      if (Math.random() < .35) {
        ctx.strokeStyle = "rgba(180,240,255,.95)"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
        const sx = LEO_X + (Math.random() - .5) * 70, sy = GY - h * (.2 + Math.random() * .8);
        ctx.beginPath(); ctx.moveTo(sx, sy);
        for (let i = 0; i < 3; i++) ctx.lineTo(sx + (Math.random() - .5) * 34, sy + (i + 1) * 12 * (Math.random() < .5 ? 1 : -1));
        ctx.stroke();
      }
      // golden glow copy
      ctx.save();
      ctx.globalAlpha = .55; ctx.filter = "brightness(2.6) saturate(2)";
      ctx.drawImage(im, LEO_X - w * 1.06 / 2, GY - h * 1.06 + bob, w * 1.06, h * 1.06);
      ctx.restore();
    }

    if (s.hurtT > 0) ctx.filter = "brightness(2.4) saturate(.4)";
    else if (superOn) ctx.filter = "saturate(1.5) brightness(1.25) sepia(.35) hue-rotate(-12deg)";
    ctx.drawImage(im, LEO_X - w / 2, GY - h + bob, w, h);
    ctx.restore();

    const pct = Math.max(0, s.p.hp / s.p.maxHp);
    const bw = 66, bx = LEO_X - bw / 2, by = GY - h - 16;
    roundRect(ctx, bx - 2, by - 2, bw + 4, 9, 4); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = pct > .5 ? "#6BE04A" : pct > .25 ? "#FFD54A" : "#FF5C5C";
    ctx.fillRect(bx, by, bw * pct, 5);
  };

  const drawBall = (ctx, b) => {
    const spr = WEAPONS[b.kind].proj ? IMG.current[WEAPONS[b.kind].proj] : null;
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.sup) {
      ctx.beginPath(); ctx.arc(0, 0, b.r + 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,200,60,.45)"; ctx.fill();
    }
    if (spr) {
      const h = b.r * 2.1, w = spr.width * h / spr.height;
      if (b.kind === "basket") ctx.rotate(b.rot);
      ctx.drawImage(spr, -w / 2, -h / 2, w, h);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); inked(ctx, "#C9CDD4", 2.5);
    }
    ctx.restore();
  };

  const drawEnemy = (ctx, e) => {
    const k = KINDS[e.kind];
    const key = e.swing > 0 ? k.atk : k.frames[Math.floor(e.anim) % k.frames.length];
    const im = IMG.current[key]; if (!im) return;
    const h = e.h, w = im.width * h / im.height;
    const sq = e.sq > 0 ? e.sq : 0;
    ctx.save();
    ctx.translate(e.x, GY);
    ctx.scale(-(1 + sq * .28), 1 - sq * .24);   // -1 en X: los enemigos miran a la izquierda
    if (e.flash > 0) ctx.filter = "brightness(2.6) saturate(.3)";
    else if (k.boss) ctx.filter = "saturate(1.8) hue-rotate(230deg) brightness(1.1)";
    ctx.drawImage(im, -w / 2, -h, w, h);
    ctx.restore();
    if (k.boss) {
      const cx = e.x, cy = GY - h * .92;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy); ctx.lineTo(cx - 14, cy - 24); ctx.lineTo(cx - 6, cy - 6);
      ctx.lineTo(cx + 2, cy - 28); ctx.lineTo(cx + 10, cy - 6); ctx.lineTo(cx + 18, cy - 24);
      ctx.lineTo(cx + 22, cy - 2); ctx.closePath(); inked(ctx, "#FFD54A", 3);
    }
    const pct = Math.max(0, e.hp / e.max);
    if (pct < 1) {
      const bw = h * .48, bx = e.x - bw / 2, by = GY - h - (k.boss ? 34 : 12);
      roundRect(ctx, bx - 2, by - 2, bw + 4, 9, 4); ctx.fillStyle = C.ink; ctx.fill();
      ctx.fillStyle = "#FF9B9B"; ctx.fillRect(bx, by, bw * Math.max(pct, e.lag), 5);
      ctx.fillStyle = k.boss ? "#E879F9" : "#8BE04A"; ctx.fillRect(bx, by, bw * pct, 5);
    }
  };

  /* ---- input ---- */
  const superShot = () => {
    const s = g.current;
    if (phaseRef.current !== "fight" || s.supT > 0 || s.chargeT > 0 || !s.enemies.length) return;
    s.supT = s.p.superCd; s.chargeT = .7; SFX.charge();
  };
  const takeUp = u => {
    const s = g.current;
    if (u.w) { s.p.owned[u.w] = true; s.p.weapon = u.w; }
    else u.ap(s.p);
    setTaken(t => [...t, u.icon]); SFX.coin(); syncHud(s); setPhaseBoth("run");
  };
  const swapWeapon = k => { const s = g.current; if (s.p.owned[k]) { s.p.weapon = k; syncHud(s); } };
  const restart = useCallback(() => {
    const clouds = g.current.clouds;
    g.current = freshGame(); g.current.clouds = clouds;
    setTaken([]); setHud({ hp: 130, maxHp: 130, coins: 0, enc: 0, sup: 0, weapon: "basket" }); setPhaseBoth("run");
  }, []);

  const supPct = hud.sup > 0 ? 1 - hud.sup / g.current.p.superCd : 1;
  const owned = g.current.p.owned;

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-3 p-3 sm:p-5"
      style={{ background: C.ui, color: "#EAF3ED", fontFamily: "ui-rounded, 'Nunito', 'Avenir Next', system-ui, sans-serif" }}>
      <style>{`
        @keyframes popIn{0%{transform:scale(.7) translateY(14px);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes bannerIn{0%{transform:translateY(-24px);opacity:0}18%,78%{transform:translateY(0);opacity:1}100%{transform:translateY(-14px);opacity:0}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important}}
      `}</style>

      <div className="w-full max-w-3xl flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg sm:text-2xl font-black"><span style={{ color: "#FFD54A" }}>LEO</span> vs ZOMBIS</h1>
        <div className="flex items-center gap-2 text-sm font-black">
          <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: C.card, borderRadius: 10, border: "2px solid " + C.line }}>
            <span>❤️</span>
            <div style={{ width: 74, height: 9, background: "#4A1F1F", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: (hud.hp / hud.maxHp * 100) + "%", height: "100%", background: "#6BE04A", transition: "width .15s" }} />
            </div>
            <span className="text-xs">{Math.ceil(hud.hp)}</span>
          </div>
          <span style={{ color: "#FFD54A" }}>💰 {hud.coins}</span>
          <span style={{ color: "#7DD3FC" }}>⚔️ {hud.enc}</span>
        </div>
      </div>

      <div className="relative w-full max-w-3xl">
        <canvas ref={cv} width={W} height={H} onClick={superShot}
          className="w-full h-auto cursor-pointer touch-none"
          style={{ borderRadius: 18, border: "4px solid " + C.line, display: "block" }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: C.card, borderRadius: 18 }}>
            <span className="font-black">Cargando a Leo…</span>
          </div>
        )}
        {banner && (
          <div key={banner.k} className="absolute left-0 right-0 top-6 text-center pointer-events-none" style={{ animation: "bannerIn 1.5s ease-out forwards" }}>
            <span className="inline-block px-5 py-1.5 font-black text-lg sm:text-2xl"
              style={{ background: banner.boss ? "#C026D3" : C.ink, borderRadius: 12, border: "3px solid rgba(255,255,255,.25)" }}>{banner.txt}</span>
          </div>
        )}
        {phase === "upgrade" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3" style={{ background: "rgba(20,30,24,.9)", borderRadius: 18 }}>
            <p className="font-black text-lg" style={{ color: "#FFD54A" }}>¡Leo sube de nivel!</p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              {choices.map((u, i) => (
                <button key={u.id} onClick={() => takeUp(u)} className="w-32 sm:w-44 p-3 text-left"
                  style={{ background: C.card, border: "3px solid " + (u.w ? "#FFD54A" : C.line), borderRadius: 14, animation: "popIn .35s " + (i * .09) + "s backwards cubic-bezier(.2,1.4,.5,1)" }}>
                  <div className="text-2xl">{u.icon}</div>
                  <div className="font-black text-sm mt-1" style={{ color: u.w ? "#FFD54A" : "#8BE04A" }}>{u.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9BB3A6" }}>{u.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {phase === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(20,30,24,.93)", borderRadius: 18 }}>
            <p className="font-black text-2xl" style={{ color: "#FF7A7A" }}>Leo ha caído</p>
            <p className="text-sm" style={{ color: "#9BB3A6" }}>{hud.enc} combates · {hud.coins} monedas</p>
            <button onClick={restart} className="mt-2 px-6 py-2.5 font-black" style={{ background: "#FFD54A", color: C.ink, borderRadius: 12 }}>Otra vez</button>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl flex items-center gap-2">
        <div className="flex gap-1.5">
          {Object.values(WEAPONS).map(w => (
            <button key={w.key} onClick={() => swapWeapon(w.key)} disabled={!owned[w.key]}
              title={w.name}
              className="px-3 py-3 text-lg"
              style={{
                borderRadius: 12, border: "3px solid " + (hud.weapon === w.key ? "#FFD54A" : C.line),
                background: hud.weapon === w.key ? C.card : "transparent", opacity: owned[w.key] ? 1 : .28,
              }}>{owned[w.key] ? w.icon : "🔒"}</button>
          ))}
        </div>
        <button onClick={superShot} disabled={hud.sup > 0}
          className="flex-1 py-3 font-black text-base relative overflow-hidden"
          style={{ background: hud.sup > 0 ? "#3E5646" : "#FF8A3D", color: hud.sup > 0 ? "#7E9488" : C.ink, borderRadius: 14, boxShadow: hud.sup > 0 ? "none" : "0 4px 0 rgba(0,0,0,.35)" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (supPct * 100) + "%", background: "rgba(255,213,74,.35)" }} />
          <span style={{ position: "relative" }}>⚡ MODO SÚPER {hud.sup > 0 ? Math.ceil(hud.sup) + "s" : "x5"}</span>
        </button>
        <button onClick={() => { audio.on = muted; setMuted(!muted); }} className="px-4 py-3 font-black text-sm"
          style={{ borderRadius: 14, border: "3px solid " + C.line, color: "#9BB3A6" }}>{muted ? "🔇" : "🔊"}</button>
      </div>

      {taken.length > 0 && (
        <div className="w-full max-w-3xl text-base">
          <span className="text-xs mr-2" style={{ color: "#6F8A7C" }}>Mejoras:</span>{taken.join(" ")}
        </div>
      )}
      <p className="max-w-3xl text-xs" style={{ color: "#6F8A7C" }}>
        Leo corre y dispara solo · toca la pantalla para el MODO SÚPER (daño x5) · las armas nuevas salen como mejora
      </p>
    </div>
  );
}
