# AGENTS.md — Santiago Barbieri · Portfolio

Guía para Codex. Define qué es el sitio, cómo se ve, cómo se mueve y cómo se organiza el código. Para crear la página de un proyecto, leer además `MAKE-PROJECT.md`.

## Dirección vigente — últimas aclaraciones de Santi

- El único home es **index.html / Archivo**. Las guías verdes de Figma son referencias: no se dibujan en la web. Cada portada comienza donde termina la portada anterior, alternando columnas; las captions ocupan los huecos.
- El loop está siempre activo, también con una cantidad impar de proyectos. Reciclar tarjetas fuera de pantalla sin mover las portadas visibles. No usar bloques duplicados con separaciones ni un interruptor de loop.
- About, Contact y Nav son páginas estáticas independientes, sin scroll de documento. Testament tiene scroll interno (sin paginación); Message tiene altura fija y scroll propio sin mover Send.
- Nav usa fondo claro, su tab dice **Index**, incluye Archivo/About/Contact. Su preview izquierdo cambia al desplazar la lista de enlaces.
- Eliminar el switch de tema: páginas oscuras y Nav invertido claro.
- Usar únicamente **Spin Rose como loader** pequeño, con saltos de 45° cada 200 ms. Mostrarlo al cargar Archivo y mientras se cargan recursos; no dejar spins decorativos girando continuamente.
- En proyectos, barra superior negra opaca desde el borde superior; los rótulos de sección acompañan a su imagen con sticky hasta el final de cada sección.
- Mantener originales y metadatos reales. Portadas faltantes con Lorem Ipsum autorizado, sin inventar imágenes.
- Abrir con `preview.command` / HTTP: el acceso file:// bloquea módulos ES y JSON.

## 1. Stack y reglas de código

- HTML, CSS y JS vanilla. ES modules. **Sin build step.** Deploy en Vercel.
- Sin frameworks. Librerías solo las listadas en la sección 8, vendorizadas en `assets/vendor/` (versión fija, sin CDN en producción).
- Contenido data-driven: los proyectos viven en JSON (`data/`). No crear un HTML por proyecto.
- Un componente = un archivo CSS + un módulo JS. Variables en `:root`. Nada de estilos inline salvo valores dinámicos (posiciones del Sandbox).
- No inventar contenido (textos, fechas, créditos). Si falta, ver reglas de `MAKE-PROJECT.md`.
- No modificar tokens de diseño ni componentes globales al agregar un proyecto.

```
/index.html            Archivo (home, grilla continua)
/about.html            About estático
/contact.html          Contact estático
/nav.html              Navegación estática independiente
/project.html          Render genérico: ?p=<slug>&view=overlook|sandbox
/data/projects.json    Registro (orden, código, slug, cover, tags)
/data/projects/<slug>.json
/assets/images/<slug>/ Imágenes de cada proyecto
/assets/fonts/ · /assets/vendor/ · /css/ · /js/
```

## 2. Marco (shell) común a todas las páginas

Todas las páginas comparten el mismo marco fijo, con margen de 16px:

- **Arriba izquierda:** tab de navegación de la página actual (ver componente Tab) con chevron. Abre `nav.html`, una pantalla estática con accesos a About y Contact, redes, Shop y Tools; su × regresa a la página de origen.
- **Arriba derecha:** bloque de identidad: "Santiago Barbieri" en negrita, debajo "Graphic Designer, Web Developer & Photographer" en light, y el glyph a la derecha.
- **Abajo izquierda:** "Buenos Aires, Argentina" y fecha/hora en vivo (`America/Argentina/Buenos_Aires`, formato `3 nov 2026 – 01:20`, se actualiza cada minuto).
- **Abajo derecha:** "Portfolio". (Los mockups dicen "Portfoliio" por un error de tipeo: escribirlo con una sola i.)
- **Abajo, junto al reloj:** toggle de tema `Light / Dark` (ver sección 3).
- **Abajo centro/derecha:** acción contextual de la página (ej. `Send` en Contact).
- En proyectos el marco superior se reemplaza por la **barra de cierre**: `×` a la izquierda, título de la vista a la derecha (`El Armado - Overlook`).

## 3. Diseño

**Color.** Dos temas con toggle. Valores aproximados tomados de los mockups: ajustar con cuentagotas.

| Token | Oscuro (por defecto) | Claro |
|---|---|---|
| `--bg` | `#0a0a0a` | `#f1ece0` |
| `--fg` | `#f1ece0` | `#0a0a0a` |
| `--mute` | fg al 50% | fg al 50% |
| `--line` | fg al 60% | fg al 60% |

**Toggle de tema.** Control `Light / Dark` en el footer, junto al reloj, presente en todas las páginas. Se aplica con `data-theme="light|dark"` en `<html>` y se guarda en `localStorage`. Por defecto: oscuro. Un script inline en el `<head>` aplica el tema guardado antes del primer render para evitar el parpadeo. Transición de colores de 300ms (sin animar imágenes). Nav invierte la paleta del tema guardado al abrirse, sin cambiar la preferencia de la página de origen. En Nav, el toggle controla la paleta invertida y guarda su equivalente para el resto del sitio.

**Tipografía.**
- Texto: **Albert Sans Light (300)**.
- Títulos y botones: **Albert Sans SemiBold (600)**, 12–13px.
- Cuerpo y etiquetas: 11–12px, interlineado 1.1–1.25, tracking neutro. About usa texto justificado.
- Una sola familia, **Albert Sans** (licencia OFL), self-hosted en `assets/fonts/` con los pesos 300 y 600 en WOFF2. Stack: `"Albert Sans",system-ui,sans-serif`. Decisión cerrada: no se usa Hiragino Kaku Gothic Std.

**Layout.** Grilla de 12 columnas con la columna izquierda fija de ~235px (tab, foto de About, filtros). Contenido desde ~320px. Mucho espacio negativo; nada de sombras, bordes redondeados ni íconos decorativos. Todo se define con líneas de 1px.

## 4. Componentes

- **Tab / encabezado de sección:** borde izquierdo de 1px, título bold, línea inferior de 1px, chevron opcional a la derecha. Es el elemento que se repite en todo el sitio (nav, `Testament`, `Certificados`, `Proyecto`, `01 Logo`).
- **Accordion:** un Tab que despliega una lista alineada a la derecha, texto light. Chevron rota.
- **Dropdown de filtro:** Tab con chevron (`All Projects`, `Last First`).
- **Caption:** `CÓDIGO` en mute · `Título - Tipo` en bold · descripción en mute (máx. 3 líneas, 140 caracteres). `text-transform: capitalize` en el título.
- **Tabla de metadatos:** etiqueta a la izquierda en mute, valor alineado a la derecha. Solo muestra los campos que tienen valor.
- **Input de formulario:** solo línea inferior, placeholder en mute.
- **Control de zoom de texto:** `+ 150% −` dentro del Tab (About → Testament).
- **Barra de cierre:** ver sección 2.

## 5. Páginas

1. **Index / Archivo (home).** Texto introductorio bajo el tab. Filtros `All Projects` (por categoría) y `Last First` (orden) en la columna izquierda. Grilla escalonada de 2 columnas; cada portada conserva su proporción original; las columnas se desfasan verticalmente. Cada ítem lleva su Caption. Click abre `project.html`. El recorrido es continuo en ambas direcciones y los spins se intercalan como elementos decorativos. About, Contact y Nav están fuera de la grilla, en páginas estáticas propias. Se conservan filtro, orden y posición al volver de una entrada.
2. **About.** Foto vertical bajo el tab (columna izquierda). `Testament` (texto justificado, con control de zoom) en el centro y `Certificados` / `Intereses` como accordions a la derecha. El texto lorem ipsum se mantiene tal cual por ahora (decisión de Santi); no reemplazarlo ni inventar copy.
3. **Contact.** `Let's Work Together`, campos Name / Email / Your Message, botón `Send` abajo. Envío con Resend vía función serverless (`/api/contact`).
4. **Proyecto.** Dos vistas del mismo JSON, conmutables:
   - **Overlook:** vista ordenada. Hero con la pieza principal, tabla de metadatos en la columna izquierda, y secciones numeradas (`01 Logo`, `02 Paleta`…) con Tab a la izquierda y contenido a la derecha.
   - **Sandbox:** canvas oscuro con grilla de puntos, assets sueltos y arrastrables. Título `Nombre - Sandbox`.

## 6. Accesibilidad y performance

- `alt` en toda imagen, navegación por teclado, foco visible, contraste AA para texto.
- `prefers-reduced-motion`: desactivar parallax, smooth scroll y reveals; dejar solo cambios de opacidad.
- Imágenes con `width`/`height`, `loading="lazy"` salvo el hero, formatos WebP/AVIF cuando existan.
- Título y `og:image` por proyecto, tomados del JSON.

## 7. Movimiento: principios

Quieto por defecto, movimiento con intención. Duraciones 200–600ms, easing `power2.out` / `expo.out`, sin rebotes. Una sola cosa se mueve a la vez. Todo lo que anima debe seguir siendo usable sin animación.

## 8. Librerías de animación propuestas

CSS nativo primero. Lo que no se pueda hacer con CSS, con GSAP.

| Prioridad | Herramienta | Para qué |
|---|---|---|
| Base | **GSAP** (core) | Hovers, reveals, timelines. Es gratis, incluidos todos los plugins, también para uso comercial. |
| Base | **GSAP Flip** | Reordenar la grilla al filtrar u ordenar en Archivo; transición portada → hero del proyecto (elemento compartido). |
| Base | **GSAP Draggable + Inertia** | Sandbox: arrastrar assets con inercia, subir z-index al tomar, snap opcional a la grilla de puntos. |
| Base | **GSAP SplitText** | Reveal de títulos por línea o carácter, y el reloj del footer. |
| Base | **GSAP ScrollTrigger** | Aparición de secciones y imágenes en Overlook; parallax muy sutil en el hero. |
| Base | **View Transitions API** (nativa, `@view-transition { navigation: auto }`) | Transición entre páginas estáticas, sin librería. En navegadores sin soporte, navegación normal. |
| Opcional | **Lenis** (~3kb) | Scroll suave en Overlook y About. Probar antes de adoptar: puede sentirse pesado con texto justificado largo. |
| Opcional | **AutoAnimate** | Listas y accordions simples, con una línea de código. Se puede reemplazar por CSS. |
| Opcional | **Motion** (`animate`, `inView`, `spring`) | Alternativa más liviana a GSAP si algún día se quiere bajar peso. No usar junto con GSAP para lo mismo. |
| Más adelante | **OGL** | Distorsión por shader al pasar el cursor sobre portadas, en línea con la estética de BASEMENT. Pesado: solo si hay ganas. |

**CSS nativo a usar:** `animation-timeline: view()` para reveals simples, `@starting-style` y `interpolate-size: allow-keywords` para accordions, `clip-path` para revelar imágenes, `linear()` para easings.

## 7b. Micro-interacciones concretas

1. **Tab:** la línea inferior se dibuja de izquierda a derecha al hover; el chevron rota 90°.
2. **Accordion:** altura animada, ítems con stagger de 30ms.
3. **Reloj del footer:** los dígitos rotan verticalmente al cambiar (SplitText).
4. **Portada en Archivo:** al hover la imagen escala 1.02 y el Caption sube 4px; cursor con etiqueta `Open` que sigue al mouse con `gsap.quickTo`.
5. **Carga de Archivo:** las portadas entran con `clip-path` de abajo hacia arriba, stagger 80ms.
6. **Filtro / orden:** Flip; las tarjetas viajan a su nueva posición.
7. **Abrir proyecto:** la portada se expande al hero (Flip + View Transition); la barra de cierre baja desde arriba.
8. **Overlook:** cada sección revela su Tab y luego su contenido, una sola vez.
9. **Sandbox:** arrastre con inercia; al soltar, un leve asentamiento (<150ms); doble click reordena en la disposición inicial.
10. **Inputs:** la línea inferior engrosa a 2px en foco; `Send` pasa a `Sending…` y luego `Sent`.
11. **Control de zoom de texto:** el cambio de tamaño se anima (font-size interpolado) y se recuerda en `localStorage`.
12. **Botón `×`:** rota 90° al hover.

## 9. Decisiones tomadas

- Tipografía de títulos y botones: Albert Sans 600 (sin Hiragino).
- "Portfolio" con una sola i.
- Tema: toggle claro/oscuro, oscuro por defecto, recordado en `localStorage`.
- About: se deja el texto placeholder por ahora.
