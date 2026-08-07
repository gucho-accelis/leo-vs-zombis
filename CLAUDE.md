# CLAUDE.md

Guía para trabajar en este repositorio. Léela antes de tocar sprites o el
render del personaje.

## Qué es

`leo-vs-zombis`: juego de navegador (auto-runner + shooter) en React sobre un
único `<canvas>`. Leo (o Alex) corre y dispara solo a oleadas de zombis, con
mejoras entre combates y un modo súper. Toda la lógica del juego vive en un
solo componente: `src/App.jsx` (bucle `requestAnimationFrame` con
`step`/`cosmetic`/`draw`). El ataque especial Murasaki está en `src/murasaki.js`.

- Build: **Vite** (`npm run build`, `npm run preview`).
- Producción: se despliega en **Vercel desde la rama `main`**.
  https://leo-vs-zombis.vercel.app/

## Convenciones de sprites (v2) — IMPORTANTES

La especificación viva está en
`public/sprites/characters/animaciones.json` (Leo / leo_super) y
`public/sprites/characters/animaciones_alex.json` (Alex). Ante cualquier duda,
esos JSON mandan. Resumen de las reglas que hay que respetar siempre:

- **Todos los personajes miran a la derecha.** Los enemigos usan el mismo
  criterio pero **se voltean por código** (en `drawEnemy`, `ctx.scale(-1, 1)`),
  nunca con sprites espejo aparte.
- **Lienzo común 420×440 con la línea de suelo en `y=418`.** Todos los frames
  comparten lienzo y ya vienen alineados por los pies y por el eje de la
  cabeza. Constantes en `App.jsx`: `FRAME_W=420`, `FRAME_H=440`, `GROUND=418`.
- **Se dibujan todos igual, sin escala propia por personaje.** Una sola escala
  global (`DRAW_SC = 104/392`) coloca la línea de suelo del frame sobre `GY`.
  No recortar, no recentrar, no escalar a Leo y a Alex por separado.
- **Alex ya viene escalado a 0,90× la altura de Leo** dentro del lienzo (Leo
  ≈393 px, Alex ≈353 px). Precisamente por eso el motor los dibuja igual: si le
  aplicas una escala distinta, rompes la relación de alturas.
- **`run_2` no se usa en ningún personaje.** El ciclo de carrera es la
  secuencia "421": `run_3 → run_1 → run_0` a 10 fps. `run_2` es casi idéntico a
  `run_0` y hace patinar el ciclo.
- **Alineado por los pies de fire/hurt.** Las poses `fire` y `hurt` adelantan
  la postura; al dibujarlas se corrige su desplazamiento horizontal para que
  los pies caigan sobre los de `aim` (se mide el centro de los pies al cargar,
  ver `feetCenter` / `FEET_REF` en `App.jsx`). Correr, victoria e idle no se
  tocan.

### Animaciones por estado (según los JSON)

| Estado    | Frames                              | Notas |
|-----------|-------------------------------------|-------|
| correr    | `run_3, run_1, run_0` @10 fps       | bucle; `run_2` descartado |
| reposo    | `idle`                              | bucle |
| apuntar   | `aim`                               | reposo de combate |
| disparar  | `fire`                              | ~0,13 s (Leo) / 0,1 s (Alex) → vuelve a apuntar |
| daño      | `hurt`                              | 0,3 s → vuelve a reposo |
| victoria  | `victory_0..victory_6` @9 fps       | **solo Leo normal**; mantiene el último 0,9 s |
| victoria súper | `victory.png` (frame único)    | leo_super; no tiene secuencia de 7 frames |

**Frames que no se incluyen**: `run_2` (todos), `victory_7` de Leo (el brazo
nace del hombro contrario). Alex aún **no tiene** victoria ni súper (pendiente:
súper = chut de fútbol).

## Personajes y carpetas

- `characters/leo` — Leo normal. Arma: pistola de agua (lento y fuerte).
- `characters/leo_super` — versión súper de Leo (prefijo de claves `s_`) +
  frames `super_attack_0..7` del Murasaki. El modo súper cambia la carpeta de
  `leo` a `leo_super` durante el destello de la transformación.
- `characters/alex` — Alex. Arma: rifle bláster (rápido y flojo). **Sin súper**
  todavía: la barra y el botón de súper se ocultan; el ataque queda desactivado.

En `App.jsx`, `CHARS` define personaje→arma→`hasSuper`, y `WEAPONS` define las
armas. El modo súper (barra por muertes, transformación, 10 s a daño ×2 /
cadencia ×2, y el Murasaki a daño ×10 que atraviesa toda la fila) está
restringido a personajes con `hasSuper` (solo Leo).

## Flujo de trabajo

- Desarrolla en la rama de trabajo indicada; **no** trabajes directo sobre `main`.
- Al terminar: `npm run build` para comprobar que compila; si tocas render o
  sprites, verifica con una captura (Playwright/Chromium headless) antes de
  fusionar.
- El despliegue a producción se hace **fusionando a `main`** (Vercel construye
  desde ahí). No dejes archivos sueltos ni de prueba en `public/`.
