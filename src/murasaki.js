/**
 * MURASAKI — ataque especial de Leo súper.
 *
 * Los 8 sprites solo tienen a Leo: la esfera se dibuja aquí, por código.
 * Eso permite cambiar tamaño, color y velocidad sin regenerar arte, y sobre
 * todo permite que el juego sepa DÓNDE está la esfera para calcular impactos.
 *
 * USO
 *   import { createMurasaki, SUPER_ATTACK_FRAMES } from './murasaki.js'
 *
 *   const mk = createMurasaki();          // al activar el ataque
 *   ...
 *   const r = mk.update(dt);              // cada fotograma
 *   mk.draw(ctx, { x, y, scale });        // x,y = esquina sup-izq del sprite
 *   if (r.orb) { ...colisiones con r.orb.x, r.orb.y, r.orb.r... }
 *   if (r.done) { ...fin del ataque, volver a estado normal... }
 *
 * IMPORTANTE: dibuja el sprite del personaje ANTES de llamar a draw(),
 * porque la esfera debe quedar por delante de la mano.
 */

export const SUPER_ATTACK_FRAMES = [
  "super_attack_0", "super_attack_1", "super_attack_2", "super_attack_3",
  "super_attack_4", "super_attack_5", "super_attack_6", "super_attack_7",
];

/** Punta de la mano en cada frame, en coordenadas del lienzo de 420x440.
 *  Medido sprite a sprite: por eso la esfera sigue la mano al cargar. */
export const PALM_ANCHOR = [
  [260.0, 159.0], [294.0, 243.0], [344.0, 224.0], [386.0, 200.0],
  [387.0, 219.0], [369.0, 231.0], [371.0, 231.0], [367.0, 236.0],
];

export const MURASAKI_CONFIG = {
  fps: 9,                 // velocidad de los 8 frames del personaje
  chargeStart: 0.22,      // s: cuándo empieza a aparecer la esfera
  holdAfter: 0.06,        // s: margen tras el último frame antes de disparar
  flightTime: 0.80,       // s: cuánto vive la esfera en vuelo
  flightSpeed: 1500,      // px/s a escala 1
  sizeFactor: 0.40,       // radio máx. = alto del sprite x este valor (≈ altura de Leo)
  hue: 282,               // morado. 200 = cian, 320 = rosa
  size: 1.0,              // multiplicador general
};

const FRAME_W = 420, FRAME_H = 440;

export function createMurasaki(cfg = {}) {
  const C = { ...MURASAKI_CONFIG, ...cfg };
  const animTime = SUPER_ATTACK_FRAMES.length / C.fps;
  const launchAt = animTime + C.holdAfter;
  const total = launchAt + C.flightTime;

  let t = 0;
  let parts = [];

  function state() {
    const frame = t < animTime
      ? Math.min(SUPER_ATTACK_FRAMES.length - 1, Math.floor(t * C.fps))
      : SUPER_ATTACK_FRAMES.length - 1;
    const flying = t >= launchAt;
    const charge = flying ? 1
      : Math.min(1, Math.max(0, (t - C.chargeStart) / (launchAt - C.chargeStart)));
    const flightT = flying ? t - launchAt : 0;
    const fade = flying ? Math.max(0, 1 - flightT / C.flightTime) : 1;
    // golpe de cámara: crece al cargar, sacudida fuerte al disparar
    const boom = (flying && flightT < 0.26) ? 1 - flightT / 0.26 : 0;
    return { frame, flying, charge, flightT, fade, boom };
  }

  return {
    get frameName() { return SUPER_ATTACK_FRAMES[state().frame]; },

    /** Avanza el ataque. Devuelve lo que el juego necesita saber. */
    update(dt) {
      t += dt;
      const s = state();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.t -= dt;
        if (p.suck) { p.x += (p.tx - p.x) * 0.14; p.y += (p.ty - p.y) * 0.14; }
        else { p.x += p.vx * dt; p.y += p.vy * dt; }
        if (p.t <= 0) parts.splice(i, 1);
      }
      return {
        done: t >= total,
        frameName: SUPER_ATTACK_FRAMES[s.frame],
        charge: s.charge,
        flying: s.flying,
        // sacudida de pantalla sugerida, en px
        shake: s.charge * 2.5 + s.boom * 16,
        // destello a pantalla completa, 0..1
        flash: s.boom * 0.5,
        // hitbox de la esfera; null mientras no vuela
        orb: null,   // lo rellena draw(), que es quien conoce la escala
      };
    },

    /**
     * Dibuja la esfera. Llamar DESPUÉS de dibujar el sprite del personaje.
     * @param {CanvasRenderingContext2D} ctx
     * @param {{x:number,y:number,scale:number}} v  posición y escala del sprite
     * @returns {{x:number,y:number,r:number}|null} hitbox de la esfera
     */
    draw(ctx, v) {
      const s = state();
      if (s.charge <= 0 && !s.flying) return null;
      if (s.fade <= 0) return null;

      const sc = v.scale;
      const fh = FRAME_H * sc;
      const [pxa, pya] = PALM_ANCHOR[s.frame];
      const ax = v.x + pxa * sc, ay = v.y + pya * sc;

      const rFull = fh * C.sizeFactor * C.size;
      const r = (fh * 0.035 + s.charge * fh * C.sizeFactor) * C.size * (s.flying ? 1.1 : 1);
      const pulse = 1 + Math.sin(t * 22) * 0.05 * s.charge;

      // el centro se aleja de la palma al crecer, para no tapar al personaje
      const x = s.flying
        ? ax + rFull * 0.62 + s.flightT * C.flightSpeed * sc
        : ax + r * 0.62 * s.charge;
      const y = ay;
      const col = (l, a) => `hsla(${C.hue},95%,${l}%,${a})`;

      // partículas: absorbidas al cargar, estela al volar
      if (!s.flying) {
        for (let i = 0; i < 6; i++) {
          const a = Math.random() * Math.PI * 2, d = r * (1.3 + Math.random() * 2);
          parts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, tx: x, ty: y,
            t: 0.5, r: 1.5 + Math.random() * 4.5, suck: true });
        }
      } else {
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2;
          parts.push({ x, y: y + Math.sin(a) * r * 0.5, vx: -340 - Math.random() * 460,
            vy: Math.sin(a) * 160, t: 0.5, r: 3 + Math.random() * 9 });
        }
      }

      // luz sobre la escena
      const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4 * pulse);
      gl.addColorStop(0, col(60, 0.34 * s.charge * s.fade));
      gl.addColorStop(1, col(50, 0));
      ctx.fillStyle = gl;
      ctx.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);

      for (const p of parts) {
        ctx.globalAlpha = Math.min(1, p.t * 2.4) * s.fade;
        ctx.fillStyle = col(72, 0.85);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = s.fade;

      const halo = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.4 * pulse);
      halo.addColorStop(0, col(58, 0.55));
      halo.addColorStop(1, col(48, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(x, y, r * 2.4 * pulse, 0, Math.PI * 2); ctx.fill();

      const core = ctx.createRadialGradient(x - r * .25, y - r * .25, r * .1, x, y, r * pulse);
      core.addColorStop(0, "rgba(255,255,255,.95)");
      core.addColorStop(0.45, col(72, 0.95));
      core.addColorStop(1, col(45, 0.9));
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = col(80, 0.5); ctx.lineWidth = 2;
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.ellipse(x, y, r * (1.5 + k * .5) * pulse, r * (0.5 + k * .2),
          t * (2.4 + k) + k, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // solo hace daño cuando vuela
      return s.flying ? { x, y, r: r * 1.1 } : null;
    },
  };
}
