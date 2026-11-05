# MAKE-PROJECT.md — cómo crear la página de un proyecto

Instrucciones para Codex. Santi sube las imágenes de un proyecto a `assets/images/<slug>/` y te pide: *"armá el proyecto `<slug>`"*. Tu trabajo es leer esa carpeta, generar el JSON del proyecto y registrarlo. **No se crea un HTML nuevo**: `project.html` renderiza cualquier proyecto desde su JSON. Lee primero `AGENTS.md` (diseño, componentes, movimiento).

## 1. Reglas de oro

1. **No inventes contenido.** Textos, fechas, lugares, créditos y descripciones salen de `project.md` o de lo que Santi te diga. Lo que falte se completa con `"Completar"` (en descripciones) o se omite (en metadatos).
2. **Variable pero coherente.** Cada proyecto puede tener secciones distintas. Usa siempre los mismos componentes, el mismo orden lógico y el mismo lenguaje de títulos.
3. **Nunca toques otros proyectos ni componentes globales.** Solo `data/projects/<slug>.json`, la entrada en `data/projects.json` y, si hace falta, optimizar imágenes del propio proyecto.
4. **Es idempotente.** Correrlo dos veces sobre la misma carpeta da el mismo resultado. Si el JSON ya existe, conserva sus textos y actualiza solo lo que cambió en la carpeta.
5. **Reporta al terminar** (sección 8).

## 2. Qué recibe Codex

```
assets/images/<slug>/
  project.md                    ← texto y metadatos (opcional pero recomendado)
  00-cover.<ext>                ← portada para Archivo/Index
  00-hero.<ext>                 ← pieza principal de Overlook (si no existe, usa la portada)
  01-logo/
  02-paleta/                    ← puede estar vacía: los colores van en project.md
  03-tipografia/
  04-iconografia/
  05-afiche/
  06-instagram/
  07-variantes-descartadas/
  08-aplicaciones/
  sandbox/                      ← opcional: assets para el canvas libre
```

- El `slug` es el nombre de la carpeta en minúsculas con guiones (`el-armado`).
- Cada subcarpeta `NN-nombre` es **una sección**. `NN` define el orden; `nombre` define el título (`07-variantes-descartadas` → `Variantes descartadas`) y el tipo de bloque (sección 4).
- Archivos sueltos con prefijo numérico dentro de una subcarpeta se ordenan por ese número; si no tienen, por nombre natural.
- Una carpeta con nombre desconocido es una sección genérica de galería. No la ignores.
- Si no hay subcarpetas, hay una sola sección `Imágenes` con todo.
- Videos (`.mp4`, `.webm`) se tratan como imágenes: `muted`, `loop`, `playsinline`, sin controles.

### `project.md` (plantilla)

```md
---
code: EA–02
title: El Armado
type: Identidad Visual
category: identidad
description: Segunda edición de la fiesta de música y karaoke en La Dama de Bollini.
meta:
  Proyecto: El Armado 2da Edición
  Lugar: La Dama De Bollini
  Fecha: Miércoles 18/11/2026
  Formato: Musica Y Karaoke
palette:
  - { name: Hueso, hex: "#D2DDCC" }
  - { name: Vino, hex: "#360F17" }
  - { name: Malva, hex: "#9E6B7A" }
  - { name: Verde, hex: "#9AE4A3" }
fonts: [Inter Medium]
---
Texto libre opcional (hasta 3 párrafos) que aparece debajo de la tabla de metadatos.
```

- `code`: lo escribe Santi. Nunca lo generes. Formato `INICIALES–NN` (ej. `EA–02` = El Armado, 2.ª edición; `FZ–00` = sin numeración). Si falta, usa `XX–00` y repórtalo.
- `meta` es libre: puede traer `Cliente`, `Rol`, `Año`, `Herramientas`, `Créditos`, etc. Se renderiza tal cual, en el orden dado.
- `category` alimenta el filtro de Archivo: `identidad`, `editorial`, `digital`, `fotografia`, `direccion-creativa`. Si el valor es nuevo, agrégalo al registro y repórtalo.

## 3. Qué produce Codex

### `data/projects/<slug>.json`

```json
{
  "slug": "el-armado",
  "code": "EA–02",
  "title": "El Armado",
  "type": "Identidad Visual",
  "category": "identidad",
  "description": "Segunda edición de la fiesta de música y karaoke en La Dama de Bollini.",
  "cover": "assets/images/el-armado/00-cover.png",
  "hero": "assets/images/el-armado/00-hero.png",
  "meta": [["Proyecto","El Armado 2da Edición"],["Lugar","La Dama De Bollini"]],
  "intro": [],
  "sections": [
    { "n": "01", "title": "Logo", "block": "logo", "items": [ { "src": "...", "w": 1800, "h": 600, "alt": "Logotipo de El Armado" } ] },
    { "n": "02", "title": "Paleta", "block": "palette", "colors": [ { "name": "Hueso", "hex": "#D2DDCC" } ] }
  ],
  "sandbox": [ { "src": "...", "x": 12, "y": 18, "w": 22, "z": 1 } ]
}
```

### Entrada en `data/projects.json`

Objeto con `slug`, `code`, `title`, `type`, `category`, `description`, `cover`, `w`, `h` (dimensiones reales de la portada) y `order` (más reciente primero; si no está claro, pregúntale a Santi o ponlo al principio).

## 4. Bloques y reglas de layout

Cada sección usa un bloque. El tipo se deduce del nombre de la carpeta; si no coincide con ninguno, `gallery`.

| Bloque | Carpeta típica | Render |
|---|---|---|
| `logo` | `logo`, `marca` | Imagen a ancho completo de la columna de contenido. Varias: una debajo de otra. |
| `palette` | `paleta`, `colores` | Círculos iguales (4 por fila), nombre y HEX debajo, en mute. Datos desde `palette` de `project.md`. Si no hay datos, muestrear los colores de las imágenes y reportarlo. |
| `type` | `tipografia` | Nombre de la fuente en bold; si hay imágenes, muestra de tipografía a ancho completo. |
| `pair` | `afiche`, `poster` | 1 pieza: centrada, máx. 400px de ancho. 2: lado a lado. |
| `grid` | `instagram`, `variantes`, `fotos`, `aplicaciones`, `iconografia` | Grilla según cantidad (abajo). |
| `sequence` | `proceso`, `making-of` | Una imagen por fila, ancho completo, con respiro vertical amplio. |
| `video` | `video` | Reproductor a ancho completo. |
| `text` | `texto`, `notas` | Texto light en columna angosta (máx. 420px). Contenido desde `.md` dentro de la carpeta. |
| `gallery` | cualquier otro | Igual que `grid`. |

**Grilla por cantidad (columna de contenido):**
- 1 → ancho completo, máx. 520px si es vertical.
- 2 → 2 columnas.
- 3–6 → 3 columnas.
- 7 o más → 4 columnas.
- Proporción original siempre; sin recortes ni `object-fit: cover`.
- Imagen más ancha que 2.5:1 (logos, banners) → ocupa toda la fila.
- Las variantes descartadas van en la misma grilla que el resto, sin tratamiento especial.

**Hero:** `00-hero` centrado, máx. 420px de ancho, con aire arriba y abajo. La tabla de metadatos va debajo, en la columna izquierda.

**Numeración:** las secciones se numeran `01`, `02`… por orden de carpeta. El hero y los metadatos no se numeran (`Proyecto` es el primer Tab).

### Composición por sección

`layout` permite variar la presentación conservando el marco y la tipografía compartidos:

| Layout | Uso |
|---|---|
| `brand-board` | Comparación de marcas e ilustraciones contenidas, sin ampliar logos al ancho completo. |
| `poster-wall` | Un afiche principal y una comparación de las piezas restantes en dos columnas. |
| `editorial` | Pares fotográficos escalonados y una imagen de cierre más amplia. |
| `photo-essay` | Paisajes amplios alternados con retratos y detalles. |
| `contact-sheet` | Variantes y recursos pequeños en una plancha de escala controlada. |

Cada item puede declarar `size: compact|medium|wide` y `alignment: start|center|end`. Son decisiones de presentación: se preservan proporciones, originales, textos y créditos. Los logos tienen escala contenida; un wordmark horizontal puede llegar a 520px, una marca cuadrada a unos 300px y un monograma a 120–180px.

Para piezas editoriales individuales, `block: cover-study` muestra una tapa y una ficha lateral. La sección incluye un único `item`, `colors: [{name, hex}]` e `inspiration` como lectura visual breve. Si no existen referencias originales, describir solamente motivos visibles; no atribuir influencias al autor. En Stephen King los colores están muestreados de cada portada y esta lectura fue autorizada por Santi.

## 5. Sandbox

- Si existe `sandbox/`, usa solo esas imágenes. Si no, usa la portada, el logo, las piezas de `pair` y hasta 4 elementos más de otras secciones.
- Posiciones iniciales en `%` del canvas, deterministas (mismo input, mismo resultado), sin solapamientos, con mucho espacio libre. La pieza principal al centro-izquierda, el logo arriba al centro, las variantes a la derecha.
- Ancho de cada asset entre 10% y 25% del canvas. Paleta como bloque de círculos si hay colores.
- El arrastre es del front-end (ver `AGENTS.md`): no guardes posiciones nuevas en el JSON.

## 6. Imágenes

- No modifiques ni muevas los originales de Santi.
- Lee el ancho y alto reales y escríbelos en el JSON para evitar saltos de layout.
- Si ejecutas optimización, genera `*-1600.webp` y `*-800.webp` junto al original y úsalos en `srcset`. No pierdas la referencia al original.
- `alt`: descriptivo y corto, en español. Si no lo puedes saber, usa `"<Título> — <Sección>"`.
- Nombres con espacios, tildes o mayúsculas: no los renombres; escapa la URL.

## 7. Casos límite

- **Proyecto de una sola imagen:** solo hero + metadatos; sin secciones.
- **Proyecto fotográfico (ej. Fotos En Zapallar):** una sección `Fotos` en `grid` o `sequence` según Santi; `meta` puede ser solo `Lugar` y `Año`.
- **Sin portada:** usa la primera imagen disponible y repórtalo.
- **Proyecto sin texto:** descripción `"Completar"` en Archivo; no dejes el campo vacío.
- **Proyecto que ya existe:** actualiza; no dupliques en `projects.json`.

## 8. Checklist y reporte final

Antes de terminar, verifica que `project.html?p=<slug>` abre sin errores en consola, que ninguna imagen devuelve 404 y que Overlook y Sandbox cargan. Responde con:

1. Archivos creados o modificados.
2. Secciones generadas (número, título, bloque, cantidad de imágenes).
3. Campos que quedaron en `"Completar"` o vacíos.
4. Archivos de la carpeta que no pudiste clasificar y dónde los pusiste.
5. Cualquier decisión que tomaste que Santi debería revisar.
