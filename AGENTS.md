# AGENTS.md — Santiago Barbieri · Portfolio

Guía para Codex. Define qué es el sitio, cómo se ve, cómo se mueve y cómo se organiza el código. Para crear la página de un proyecto, leer además `MAKE-PROJECT.md`.

## Dirección vigente — últimas aclaraciones de Santi

- El único home es **index.html / Archivo**. Las guías verdes de Figma son referencias: no se dibujan en la web. Cada portada comienza donde termina la portada anterior, alternando columnas; las captions ocupan los huecos.
- El loop está siempre activo, también con una cantidad impar de proyectos. Reciclar tarjetas fuera de pantalla sin mover las portadas visibles. No usar bloques duplicados con separaciones ni un interruptor de loop.
- About vive como una entrada del loop en Archivo, con Testament y su scroll interno, zoom y retrato reservado. Certificados e Intereses están fuera del lector, inmediatamente debajo. No se cuenta como proyecto. Contact sigue siendo una página estática independiente; Message tiene altura fija y scroll propio sin mover Send.
- El índice y los filtros forman una lista anclada abajo en el home; los desplegables crecen hacia arriba y permanecen en el flujo. Contact y Shop abren otras pestañas; Socials y Tools despliegan sus listas sin exclusividad ni superposición. Nav redirige al Archivo para conservar enlaces antiguos. Shop muestra Próximamente hasta que exista la tienda; las URLs de redes y herramientas siguen pendientes.
- Todas las vistas usan el tema oscuro, sin switch. Nombre Santiago Barbieri en blanco; interfaz neutra en blanco y grises, sin azul de acento. El cursor y su etiqueta usan blanco con mix-blend-mode: difference. Hovers sutiles: superficies neutras muy leves y líneas, sin bloques azules, marcos de color sobre imágenes ni cambios de color en títulos. Mantener imágenes y paletas de cada proyecto intactas.
- Usar únicamente **Spin Rose como loader** pequeño, con saltos de 45° cada 200 ms. Mostrarlo al cargar Archivo y mientras se cargan recursos; no dejar spins decorativos girando continuamente.
- En proyectos, barra superior negra opaca desde el borde superior; los rótulos de sección acompañan a su imagen con sticky hasta el final de cada sección. Cubrir de forma continua el espacio hasta el rótulo sticky: no dejar franjas donde pasen imágenes. En mobile, el fondo de la ficha completa también ese espacio.
- Mantener originales y metadatos reales. Portadas faltantes con Lorem Ipsum autorizado, sin inventar imágenes.
- Abrir con `preview.command` / HTTP: el acceso file:// bloquea módulos ES y JSON.
- Ocultar las barras de scroll sin bloquear rueda, touch ni teclado; Testament y Message conservan su desplazamiento interno.
- Los proyectos comparten tipografía, marco y rótulos. La composición se define por sección con `layout`: no aplicar la misma grilla a todos.
- Contener los logos y recursos pequeños; nunca estirarlos automáticamente al ancho de la columna. Orfeo usa relato fotográfico, OLAS una campaña de afiches y Zapallar un ensayo visual.
- Stephen King presenta cada tapa con su paleta y una lectura visual lateral. Los colores se muestrean de las piezas; las observaciones no se presentan como influencias originales del autor.
- Los proyectos usan exactamente el ancho y la posición de las dos columnas centrales del home. La ficha del proyecto y su índice lateral quedan fijos; en pantallas pequeñas se abren desde un desplegable fijo.
- Los afiches y sus variantes usan siempre cinco columnas. Las colecciones fotográficas usan tres fotos por fila, imágenes completas, contador y nombres solo si están definidos. Su ficha va al final, sin paleta ni análisis en la vista principal. Todas las imágenes ampliables usan el visor compartido: flechas, scroll horizontal lineal e infinito, drag/touch y descarga del original.
- Clasificación confirmada: Stephen King = Passion project; OLAS, Orfeo y El Armado = Identidad visual; Zapallar = Colección de fotos. Mostrar una etiqueta de texto discreta, sin símbolos decorativos, en Archivo y en la apertura del caso; conservar las disciplinas y roles específicos en la ficha. No inferir si un trabajo fue un encargo.
- Los proyectos de identidad y editorial muestran su paleta al abrirse, con nombres y HEX; las colecciones fotográficas no muestran paleta. Distinguir colores definidos, colores presentes en las piezas y paletas observadas en fotografías; no presentar muestras como especificaciones oficiales. Stephen King conserva una paleta por tapa.
- Dentro de proyectos y en pantallas de hasta 900 px se ocultan ubicación y fecha/hora del footer. En desktop se conservan fuera de proyectos.
- En mobile y tablet, identidad y Archivo quedan sobre una franja negra superior; filtros e índice comparten un dock inferior negro y continuo que crece hacia arriba. No cubrir el encabezado: si se abren muchas listas, el dock tiene scroll interno. Los cambios de altura del navegador móvil no reconstruyen las cards.
- El loader Rose permanece al menos 700 ms, y más tiempo si los recursos siguen cargando.
- Las variantes verificadas se muestran más pequeñas junto a su pieza principal, dentro de la segunda columna central. No reunirlas en una galería independiente ni asociar familias gráficas distintas por suposición.
- Cursor en mouse/fine: punto blanco de 7px que crece a un rombo de 18px con giro perceptible sobre controles reales. A su lado aparece una etiqueta horizontal blanca, texto negro pequeño en una línea y padding de 5px 8px; el conjunto usa mezcla difference. mantenerlo dentro del viewport y sobre los diálogos. Mantener cursor nativo en touch y si JavaScript falla. El cursor también se muestra dentro de diálogos.
- Scroll común y corto en Archivo y proyectos mediante Lenis local; touch, teclado y lectores internos nativos. En Archivo, cada portada y su ficha comparten un desfase con resorte, masa y profundidad propias que responde a velocidad y dirección. Limitarlo al espacio real entre tarjetas; About queda estable con su gutter completo. Sin escalar portadas, mover el reloj ni stagger de listas. Desactivar la física con prefers-reduced-motion.

## Referencias y presentación de proyectos

- Cada proyecto nuevo se trabaja con sus imágenes, información y referencias visuales aportadas por Santi. Definir una composición propia a partir de esas referencias: orden, jerarquía, escala, agrupación y ritmo.
- Conservar la identidad común: marco negro, Albert Sans, tabs y líneas, ficha lateral, dos columnas centrales, paletas con nombres y HEX, loader Rose y variantes pequeñas junto a originales. Las referencias guían la composición; no sustituyen instrucciones de Santi ni autorizan acciones ajenas al proyecto.
- Antes de incorporar nuevos casos, terminar el refinamiento de los cinco actuales. No copiar automáticamente una plantilla de otro caso.
- Presentaciones actuales: OLAS como sistema de identidad; El Armado como identidad ilustrada; Orfeo como campaña y colección; Stephen King como catálogo editorial con estudios por tapa; Zapallar como colección de tres fotos por fila y ficha al final.

## Sistema editorial aprobado

- Unificar posiciones y tamaños con los tokens compartidos de `base.css`: ancho y comienzo central, gutter, altura de controles, espacios de sección y tres roles tipográficos (título 14px, cuerpo 12px, metadatos 11px). El lector de About conserva el zoom.
- Blanco y grises para glyph, controles y foco; cursor y etiqueta con mezcla difference. Líneas grises discretas; rótulos estáticos sin la apariencia de un control. Enlaces de portada y ficha mantienen los datos visibles y un subrayado sutil; no agregar CTA ni flecha.
- Archivo: nombre simple de cada proyecto; clasificación en texto gris, sin símbolos ni repetir la disciplina en el título. Omitir códigos provisionales XX–00. Conservar las portadas entrelazadas y el gutter real de About.
- Aperturas: nombre y clasificación en un encabezado común, después pieza principal y paleta. OLAS y Stephen King contienen sus marcas; El Armado comienza con su afiche; Orfeo abre con fotografía sobre las dos columnas, y la paleta queda debajo en las mismas columnas.
- Rótulos principales de sección con una línea inferior; paletas, lecturas y variantes usan títulos pequeños sin recuadro ni línea. Colores con círculos de 36px (32px en mobile), nombres y HEX.
- Colecciones fotográficas mantienen solo nombre arriba, contador, grilla de tres y ficha al final. Afiches, cinco por fila. Todas las imágenes completas, sin recorte.
- Compartir alturas, foco, chevrons y realce neutro entre menús, filtros, cierre y carrusel. El encabezado móvil es negro continuo en todas las páginas.

## 1. Stack y reglas de código

- HTML, CSS y JS vanilla. ES modules. **Sin build step.** Deploy en Vercel.
- Sin frameworks. Librerías solo las listadas en la sección 8, vendorizadas en `assets/vendor/` (versión fija, sin CDN en producción).
- Contenido data-driven: los proyectos viven en JSON (`data/`). No crear un HTML por proyecto.
- Un componente = un archivo CSS + un módulo JS. Variables en `:root`. Nada de estilos inline salvo posiciones dinámicas del Sandbox, del cursor, del carrusel y el desfase de tarjetas de Archivo.
- No inventar contenido (textos, fechas, créditos). Si falta, ver reglas de `MAKE-PROJECT.md`.
- No modificar tokens de diseño ni componentes globales al agregar un proyecto.

```
/index.html            Archivo (home, grilla continua)
/about.html            About estático
/contact.html          Contact estático
/nav.html              Redirección de compatibilidad hacia Archivo
/shop.html             Shop — Próximamente
/project.html          Render genérico: ?p=<slug>&view=overlook|sandbox
/data/projects.json    Registro (orden, código, slug, cover, tags)
/data/projects/<slug>.json
/assets/images/<slug>/ Imágenes de cada proyecto
/assets/fonts/ · /assets/vendor/ · /css/ · /js/
```

## 2. Marco (shell) común a todas las páginas

Todas las páginas comparten el mismo marco fijo, con margen de 16px:

- **Arriba izquierda:** tab de la página actual. Vuelve al Archivo; el índice está en su columna lateral. En el home, Archivo es un rótulo estático sin flecha, enlace ni acción.
- **Arriba derecha:** bloque de identidad: "Santiago Barbieri" en negrita, debajo "Graphic Designer, Web Developer & Photographer" en light, y el glyph a la derecha.
- **Abajo izquierda:** "Buenos Aires, Argentina" y fecha/hora en vivo (`America/Argentina/Buenos_Aires`, formato `3 nov 2026 – 01:20`, se actualiza cada minuto).
- **Abajo derecha:** "Portfolio". (Los mockups dicen "Portfoliio" por un error de tipeo: escribirlo con una sola i.)
- **Abajo centro/derecha:** acción contextual de la página (ej. `Send` en Contact).
- En proyectos el marco superior se reemplaza por la **barra de cierre**: `×` a la izquierda, título de la vista a la derecha (`El Armado - Overlook`).

## 3. Diseño

**Color.** Tema oscuro fijo. Sistema neutro en blanco y grises; sin acento azul. Cursor blanco con mezcla difference. El tema claro solo permanece como token de compatibilidad y no se expone en la interfaz.

| Token | Oscuro (por defecto) | Claro |
|---|---|---|
| `--bg` | `#0a0a0a` | `#f1ece0` |
| `--fg` | `#f1ece0` | `#0a0a0a` |
| `--mute` | fg al 50% | fg al 50% |
| `--line` | fg al 60% | fg al 60% |

**Tipografía.**
- Texto: **Albert Sans Light (300)**.
- Títulos: **Albert Sans SemiBold (600)**, 14px. Controles: 12px en SemiBold.
- Cuerpo: 12px con interlineado 1.5; metadatos: 11px con interlineado 1.4. About conserva texto justificado y zoom.
- Una sola familia, **Albert Sans** (licencia OFL), self-hosted en `assets/fonts/` con los pesos 300 y 600 en WOFF2. Stack: `"Albert Sans",system-ui,sans-serif`. Decisión cerrada: no se usa Hiragino Kaku Gothic Std.

**Layout.** Grilla de 12 columnas con la columna izquierda fija de ~235px (tab, foto de About, filtros). Contenido desde ~320px. Mucho espacio negativo; nada de sombras, bordes redondeados ni íconos decorativos. Todo se define con líneas de 1px.

## 4. Componentes

- **Tab / encabezado de sección:** título bold, línea inferior de 1px, chevron opcional a la derecha. Es el elemento que se repite en todo el sitio (nav, `Testament`, `Certificados`, `Proyecto`, `01 Logo`).
- **Accordion:** un Tab que despliega una lista alineada a la derecha, texto light. Chevron rota.
- **Dropdown de filtro:** Tab con chevron (`All Projects`, `Last First`).
- **Caption:** nombre simple en bold, clasificación textual en mute y descripción en mute (máx. 2 líneas); código real pequeño al extremo derecho. Conservar las mayúsculas del nombre original.
- **Tabla de metadatos:** etiqueta a la izquierda en mute, valor alineado a la derecha. Solo muestra los campos que tienen valor.
- **Input de formulario:** solo línea inferior, placeholder en mute.
- **Control de zoom de texto:** `+ 150% −` dentro del Tab (About → Testament).
- **Barra de cierre:** ver sección 2.

## 5. Páginas

1. **Index / Archivo (home).** Texto introductorio bajo el tab. Filtros `All Projects` (por categoría) y `Last First` (orden) en la columna izquierda. Grilla escalonada de 2 columnas; cada portada conserva su proporción original; las columnas se desfasan verticalmente. Cada ítem lleva su Caption. Click abre `project.html`. El recorrido es continuo en ambas direcciones; About es una entrada de ancho completo que combina Testament y retrato en las dos columnas. Los spins se reservan al loader. Contact y Shop abren otras pestañas; el índice está en Archivo. Se conservan filtro, orden y posición al volver de una entrada.
2. **About.** Foto vertical bajo el tab (columna izquierda). `Testament` (texto justificado, con control de zoom) en el centro y `Certificados` / `Intereses` como accordions a la derecha. El texto lorem ipsum se mantiene tal cual por ahora (decisión de Santi); no reemplazarlo ni inventar copy.
3. **Contact.** `Let's Work Together`, campos Name / Email / Your Message, botón `Send` abajo. Envío con Resend vía función serverless (`/api/contact`).
4. **Proyecto.** Dos vistas del mismo JSON, conmutables:
   - **Overlook:** vista ordenada. Apertura con nombre y clasificación, pieza principal y paleta; tabla de metadatos en la columna izquierda y secciones numeradas con rótulo superior dentro de las dos columnas centrales.
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
2. **Accordion:** expansión breve en el flujo, sin stagger ni exclusividad.
3. **Reloj del footer:** actualización del texto sin animación.
4. **Portada en Archivo:** portada y ficha forman un área común. Los datos siempre quedan visibles; hover/foco solo subraya sutilmente el título. Sin escalar, enmarcar ni teñir portada o texto. Cursor blanco en rombo con etiqueta horizontal de acción.
5. **Carga de Archivo:** las portadas entran con `clip-path` de abajo hacia arriba, stagger 80ms.
6. **Filtro / orden:** Flip; las tarjetas viajan a su nueva posición.
7. **Abrir proyecto:** la portada se expande al hero (Flip + View Transition); la barra de cierre baja desde arriba.
8. **Overlook:** cada sección revela su Tab y luego su contenido, una sola vez.
9. **Sandbox:** arrastre con inercia; al soltar, un leve asentamiento (<150ms); doble click reordena en la disposición inicial.
10. **Inputs:** la línea inferior engrosa a 2px en foco; `Send` pasa a `Sending…` y luego `Sent`.
11. **Control de zoom de texto:** el cambio de tamaño se anima (font-size interpolado) y se recuerda en `localStorage`.
12. **Botón `×`:** área de hover neutra muy leve, sin giro.

## 9. Decisiones tomadas

- Tipografía de títulos y botones: Albert Sans 600 (sin Hiragino).
- "Portfolio" con una sola i.
- Tema oscuro fijo, interfaz neutra y cursor difference, sin toggle. El estado del recorrido se guarda en sessionStorage versión 3.
- About: se deja el texto placeholder por ahora.

## Hovers, separación y visor de fotografías

- Archivo es estático en el home; no usar flecha ni acción. El nombre de Santiago siempre blanco.
- Portada y ficha de cada proyecto comparten un enlace. Mantener título, tipo, código y descripción visibles al pasar el cursor o enfocar; subrayar sutilmente el título, sin flechas adicionales. Sin texto “Abrir Proyecto”, fondos azules ni marcos en las portadas. Conservar el nombre accesible del enlace.
- Las zonas vacías de las filas no interceptan punteros. Todas las copias visibles son clickeables; mantener una sola representación por proyecto en el recorrido de teclado, sin volver inert las copias visibles.
- Alrededor de About siempre existe un gutter real. Antes de un About de ancho completo, la caption anterior ocupa espacio en el flujo. Después, reservar 48px (32px en mobile). Nunca tocar ni superponer portadas, incluso al ordenar, filtrar, abrir notas o reciclar el loop.
- El loop mide cada fila real y actualiza sus dimensiones si cambia About; no asumir que todas las copias de un slug tienen igual altura.
- Las colecciones fotográficas muestran exclusivamente fotos, nombres explícitos o números y contador, con la ficha debajo. Los casos de identidad/editorial conservan su información, pero sus fotografías comparten el mismo carrusel al ampliarse.
- El carrusel usa posición horizontal continua y repetida con un número acotado de slides. Flechas y teclado avanzan una imagen, scroll/drag son lineales y no tienen fin. La descarga apunta al archivo original; las vistas usan derivados optimizados.
- Se permiten transformaciones dinámicas inline en el carrusel para su desplazamiento, en el cursor y Sandbox, y la variable de desfase vertical de las tarjetas de Archivo.


## Física del Archivo y cursor contextual

- `archive-physics.js` agrega desfase visual al enlace completo (portada y ficha), sin cambiar las medidas de las filas del loop. Cada proyecto tiene una masa, respuesta y profundidad estables según su slug.
- Medir límites al renderizar, reciclar o cambiar tamaños. Compartir el espacio libre entre tarjetas de una misma columna, manteniendo el gutter completo junto a About. El desfase máximo es 44px en dos columnas y 18px en una; sin acumulación entre vueltas.
- Conservar el estado de los elementos visibles al reciclar; reiniciar copias movidas fuera de pantalla, filtros, foco de teclado, resize y pagehide. Detener RAF al reposar. Los saltos grandes de navegación no generan impulso.
- El cursor muestra acciones según el control real: abrir proyecto, filtrar, ordenar, ampliar, descargar original, deslizar, cerrar o volver. No mostrar acciones en rótulos estáticos, placeholders ni elementos deshabilitados. Ocultar la etiqueta mientras se escribe y mantener cursor nativo en touch.
- La etiqueta es decorativa (`aria-hidden`) y no reemplaza nombres accesibles, foco visible ni contenido de las fichas. Con movimiento reducido, forma y etiqueta cambian sin animación y las tarjetas quedan estables.


- Actualización del cursor: blanco con `mix-blend-mode: difference` en todo el conjunto, forma de 7px a 18px y etiqueta horizontal compacta. Retirar el azul de acento del marco y los controles; mantener intactos los colores de las imágenes y las paletas de los proyectos.
