# Pack de sprites — Leo vs Zombis

## Regla de oro
**Todos los sprites miran a la DERECHA.** El motor voltea los enemigos por código.
Si subes un sprite mirando a la izquierda, dímelo o gíralo antes.

## Estructura

characters/<personaje>/
  common/            poses que no dependen del arma
    run_0..run_3.png   ciclo de carrera
    hurt.png           recibe golpe
    ko.png             muere
    victory.png        zona despejada
    idle_unarmed.png   reposo sin arma
  weapons/<NN_arma>/
    idle.png           EN COMBATE, ENTRE DISPAROS  ← el que faltaba
    run.png            corriendo con el arma (opcional)
    attack.png         disparo
    windup.png / aim.png  preparación (opcional)
  _unused/           poses que existen pero el juego aún no usa

enemies/<NN_tipo>/
  idle.png  walk_0.png  walk_1.png  attack.png  hurt.png  dead.png

projectiles/   backgrounds/   manifest.json

## Cómo añado un personaje nuevo
Duplica `characters/leo/` como `characters/<nombre>/` y rellena los mismos
nombres de archivo. Si falta alguno, el motor cae al equivalente de Leo.
Mínimo imprescindible para que juegue: run_0..3, hurt, ko, victory,
y por cada arma: idle + attack.

## Cómo te pido un cambio de animación
"personaje leo, arma 02_slingshot, estado idle → usa aim.png"
