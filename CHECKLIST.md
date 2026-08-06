# ✅ CHECKLIST — De cero a tu juego online

Marca cada casilla cuando la termines. Si algo falla, mira **Problemas frecuentes** al final.
No hace falta que entiendas los comandos. Solo cópialos y pégalos.

---

## BLOQUE 1 — Preparar el ordenador (una sola vez, ~10 min)

- [ ] **1.1** Instala Node.js
  Entra en https://nodejs.org y descarga la versión que pone **LTS**.
  Instálala dándole a Siguiente a todo.

- [ ] **1.2** Abre la Terminal
  - Mac: pulsa `Cmd + Espacio`, escribe `Terminal`, Enter.
  - Windows: pulsa la tecla Windows, escribe `PowerShell`, Enter.

- [ ] **1.3** Comprueba que Node está instalado. Pega esto y pulsa Enter:
  ```
  node -v
  ```
  Tiene que aparecer algo como `v22.x.x`. Si aparece un error, reinicia el
  ordenador y vuelve a probar.

- [ ] **1.4** Crea una cuenta en https://github.com (gratis)

- [ ] **1.5** Crea una cuenta en https://vercel.com
  **Importante:** elige *"Continue with GitHub"*. Así quedan conectadas.

---

## BLOQUE 2 — Arrancar el juego en tu ordenador (~5 min)

- [ ] **2.1** Descomprime el archivo `leo-vs-zombis-proyecto.zip`
  Déjalo en un sitio fácil, por ejemplo el Escritorio.

- [ ] **2.2** En la Terminal, entra en la carpeta.
  Escribe `cd ` (con el espacio al final) y **arrastra la carpeta** desde el
  Escritorio a la Terminal. Se rellenará la ruta sola. Pulsa Enter.

- [ ] **2.3** Instala las piezas que faltan (tarda un minuto):
  ```
  npm install
  ```

- [ ] **2.4** Arranca el juego:
  ```
  npm run dev
  ```
  Aparecerá una dirección tipo `http://localhost:5173`.
  Ábrela en el navegador.

- [ ] **2.5** ✋ **PARA AQUÍ Y JUEGA.** Comprueba que todo se ve bien:
  Leo parado cuando espera, zombis mirando hacia él, el fondo pasando.

Para cerrar el juego: pulsa `Ctrl + C` en la Terminal.

---

## BLOQUE 3 — Subirlo a GitHub (~10 min)

Solo la primera vez, dile a Git quién eres (pon tu nombre y tu email):
- [ ] **3.1**
  ```
  git config --global user.name "Gucho"
  git config --global user.email "tu@email.com"
  ```

- [ ] **3.2** Prepara el proyecto (los tres a la vez, uno por línea):
  ```
  git init
  git add .
  git commit -m "Primera version del juego"
  ```

- [ ] **3.3** En github.com pulsa el botón verde **New** (o el `+` arriba a la derecha
  → *New repository*).
  - Repository name: `leo-vs-zombis`
  - Déjalo en **Public**
  - ⚠️ **NO marques** "Add a README file" ni ninguna otra casilla
  - Pulsa **Create repository**

- [ ] **3.4** GitHub te muestra una pantalla con comandos.
  Busca el bloque que dice *"…or push an existing repository from the command line"*
  y copia las **3 líneas** que hay ahí. Pégalas en la Terminal.
  Son parecidas a estas (con TU usuario):
  ```
  git remote add origin https://github.com/TU-USUARIO/leo-vs-zombis.git
  git branch -M main
  git push -u origin main
  ```

- [ ] **3.5** Recarga la página de GitHub. Deberías ver tus archivos.

---

## BLOQUE 4 — Publicarlo en Vercel (~3 min)

- [ ] **4.1** Entra en https://vercel.com y pulsa **Add New → Project**

- [ ] **4.2** Busca `leo-vs-zombis` en la lista y pulsa **Import**

- [ ] **4.3** ⚠️ **No toques ninguna opción.** Vercel detecta Vite solo.
  Pulsa **Deploy**.

- [ ] **4.4** Espera un minuto. Te dará una dirección tipo
  `leo-vs-zombis.vercel.app`

- [ ] **4.5** 🎉 Ábrela en el móvil y pásasela a tu hijo por WhatsApp.

---

## BLOQUE 5 — Cómo hacer cambios a partir de ahora

Cada vez que cambies algo del juego:

```
git add .
git commit -m "describe aqui lo que has cambiado"
git push
```

Vercel se entera solo y actualiza la web en un minuto. No hay que hacer nada más.

---

## Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| El juego (código) | `src/App.jsx` |
| Qué sprite usa cada animación | `src/App.jsx`, la lista `SPR` de arriba del todo |
| Un dibujo de un personaje | `public/sprites/characters/leo/...` |
| Un zombi | `public/sprites/enemies/...` |
| Un fondo | `public/sprites/backgrounds/` |

Para cambiar un dibujo **basta con sustituir el archivo PNG** manteniendo el
mismo nombre. No hay que tocar código.

---

## Problemas frecuentes

**`command not found: node` o `npm`**
Node no se instaló bien o no reiniciaste. Reinicia el ordenador tras instalarlo.

**`command not found: git`**
- Mac: escribe `git` y acepta instalar las herramientas que te ofrezca.
- Windows: descárgalo de https://git-scm.com

**La página está en blanco**
Pulsa `F12` en el navegador, pestaña *Console*. El mensaje rojo dice qué falta.
Casi siempre es una ruta mal escrita en la lista `SPR`.

**Se ven los personajes pero no los fondos**
Comprueba que existe `public/sprites/backgrounds/bg_01.jpg`. Los nombres
distinguen mayúsculas y minúsculas.

**`git push` pide usuario y contraseña y la rechaza**
GitHub ya no acepta la contraseña normal. Cuando pida *Password*, genera un token en
GitHub → *Settings* → *Developer settings* → *Personal access tokens* → *Tokens (classic)*
→ *Generate new token*, marca la casilla `repo`, y pega ese token como contraseña.

**Me he liado y quiero empezar de nuevo**
Borra la carpeta, vuelve a descomprimir el zip y repite desde el paso 2.2.
No se pierde nada.
