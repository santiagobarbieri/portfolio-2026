# AGENTS.md — Santiago Barbieri · Portfolio

Guía para Codex. Define qué es el sitio, cómo se ve, cómo se mueve y cómo se organiza el código. Para crear la página de un proyecto, leer además `MAKE-PROJECT.md`.

## Dirección vigente — últimas aclaraciones de Santi

- Prioridad actual: terminar de refinar los cinco proyectos. El Sandbox y la propuesta de mundo 3D están retirados; no agregar nuevas experiencias sin una indicación explícita de Santi. El logo vuelve al Archivo.

- El único home es **index.html / Archivo**. Las guías verdes de Figma son referencias: no se dibujan en la web. Cada portada comienza donde termina la portada anterior, alternando columnas; las captions ocupan los huecos.
- El loop está siempre activo, también con una cantidad impar de proyectos. Reciclar tarjetas fuera de pantalla sin mover las portadas visibles. No usar bloques duplicados con separaciones ni un interruptor de loop.
- Archivo contiene exclusivamente proyectos. About es una página independiente en construcción: recorrido vertical con camino, capítulos y contenido real pendiente; no integra el loop ni el contador. Contact es un formulario guiado independiente. Shop abrirá Gumroad cuando exista la URL; mientras tanto es un rótulo Próximamente, sin enlace inventado.
- El lateral de Archivo tiene tres grupos separados: filtros; About/Contact/Shop; Socials/Tools. Los desplegables crecen hacia arriba en el flujo, sin exclusividad ni superposición. Contact abre otra pestaña; Shop será un enlace externo a Gumroad. Nav conserva la redirección al Archivo.
- El sitio usa tema oscuro, sin switch; About tiene una superficie cálida clara local. Nombre Santiago Barbieri en blanco; interfaz neutra en blanco y grises, sin azul de acento. Cursor y etiqueta blancos con contorno negro y texto negro; invertir ambos a negro con contorno/texto blanco solo si toda su superficie queda sobre negro opaco de la interfaz. Sin mezcla de colores. Hovers por crecimiento breve de tamaño, sin subrayados ni cambios de fondo o color. Cruces, flechas y controles tienen microanimaciones. Mantener imágenes y paletas de cada proyecto intactas.
- Usar únicamente **Spin Rose como loader** pequeño, con saltos de 45° cada 200 ms. Mostrarlo al cargar Archivo y mientras se cargan recursos; no dejar spins decorativos girando continuamente.
- En proyectos, barra superior negra opaca desde el borde superior; los rótulos de sección acompañan a su imagen con sticky hasta el final de cada sección. Cubrir de forma continua el espacio hasta el rótulo sticky: no dejar franjas donde pasen imágenes. En mobile, el fondo de la ficha completa también ese espacio.
- Mantener originales y metadatos reales. Portadas faltantes con Lorem Ipsum autorizado, sin inventar imágenes.
- Abrir con `preview.command` / HTTP: el acceso file:// bloquea módulos ES y JSON.
- Ocultar las barras de scroll sin bloquear rueda, touch ni teclado; Testament y Message conservan su desplazamiento interno.
- Los proyectos comparten tipografía, marco y rótulos. La composición se define por sección con `layout`: no aplicar la misma grilla a todos.
- Contener los logos y recursos pequeños; nunca estirarlos automáticamente al ancho de la columna. Orfeo usa relato fotográfico, OLAS una campaña de afiches y Zapallar un ensayo visual.
- **Shelf 001 - Stephen King** conserva el slug `stephen-king` y su portada de Archivo. Al abrirlo, `book-shelf.js` presenta las diez tapas en un estante CSS 3D a pantalla completa basado en BOOKS, con arrastre para rotar, navegación por flechas y ficha lateral (inferior en mobile). Cada futuro Shelf será otra colección de tapas rediseñadas. La ficha incluye paleta, lectura visual y variantes. Los colores se muestrean de las piezas; las observaciones no se presentan como influencias originales del autor.
- Los proyectos usan exactamente el ancho y la posición de las dos columnas centrales del home. La ficha del proyecto y su índice lateral quedan fijos; en pantallas pequeñas se abren desde un desplegable fijo.
- Los afiches y sus variantes usan siempre cinco columnas. Las colecciones fotográficas usan tres fotos por fila, imágenes completas, contador y nombres solo si están definidos. Su ficha va al final, sin paleta ni análisis en la vista principal. Todas las imágenes ampliables abren un único carrusel con las piezas y variantes de todo el proyecto, sin duplicar archivos. Visor sin líneas, con flechas, scroll horizontal lineal e infinito y drag/touch. Cada imagen tiene nombre debajo y su propio icono de descarga original arriba a la derecha.
- Clasificación confirmada: Stephen King = Passion project; OLAS, Orfeo y El Armado = Identidad visual; Zapallar = Colección de fotos. Mostrar una etiqueta de texto discreta, sin símbolos decorativos, en Archivo y en la apertura del caso; conservar las disciplinas y roles específicos en la ficha. No inferir si un trabajo fue un encargo.
- Los proyectos de identidad muestran su paleta al abrirse y los editoriales en la ficha de la portada, con nombres y HEX; las colecciones fotográficas no muestran paleta. Distinguir colores definidos, colores presentes en las piezas y paletas observadas en fotografías; no presentar muestras como especificaciones oficiales. Stephen King conserva una paleta por tapa.
- Dentro de proyectos y en pantallas de hasta 900 px se ocultan ubicación y fecha/hora del footer. En desktop se conservan fuera de proyectos.
- En mobile y tablet, identidad y Archivo quedan sobre una franja negra superior; filtros e índice comparten un dock inferior negro y continuo que crece hacia arriba. No cubrir el encabezado: si se abren muchas listas, el dock tiene scroll interno. Los cambios de altura del navegador móvil no reconstruyen las cards.
- El loader Rose permanece al menos 700 ms, y más tiempo si los recursos siguen cargando.
- Archivo y proyectos incluyen el loader en su HTML; el bootstrap clásico lo activa antes del primer render. Los módulos adoptan ese mismo loader y solo revelan la página cuando el contenido, las fuentes y las imágenes iniciales están preparados. No ocultarlo por un timeout mientras la carga válida siga pendiente. Si los datos fallan, mostrar un estado de error con vuelta al Archivo. El fallback HTML sigue accesible sin JavaScript.
- Las variantes verificadas se muestran más pequeñas junto a su pieza principal, dentro de la segunda columna central. No reunirlas en una galería independiente ni asociar familias gráficas distintas por suposición.
- Cursor en mouse/fine: punto blanco de 7px con contorno negro que crece a un rombo de 18px con giro perceptible sobre controles reales. A su lado aparece una etiqueta horizontal blanca, texto negro pequeño en una línea y padding de 2px 4px y contorno negro de 1px; el conjunto usa mezcla normal. Invertir relleno, texto y contorno juntos solo cuando cursor y etiqueta estén completamente sobre una superficie negra uniforme. Las imágenes y superficies ambiguas conservan el blanco con contorno negro. Mantenerlo dentro del viewport y sobre los diálogos. Mantener cursor nativo en touch y si JavaScript falla. El cursor también se muestra dentro de diálogos.
- Scroll común y corto en Archivo y proyectos mediante Lenis local; touch, teclado y lectores internos nativos. En Archivo, cada portada y su ficha comparten un desfase con resorte, masa y profundidad propias que responde a velocidad y dirección. Limitarlo al espacio real entre tarjetas; About queda estable con su gutter completo. El hover puede ampliar la portada dentro de su espacio seguro; la física solo desplaza. Sin mover el reloj ni stagger de listas. Desactivar la física con prefers-reduced-motion.

## Referencias y presentación de proyectos

- Cada proyecto nuevo se trabaja con sus imágenes, información y referencias visuales aportadas por Santi. Definir una composición propia a partir de esas referencias: orden, jerarquía, escala, agrupación y ritmo.
- Conservar la identidad común: marco negro, Albert Sans, tabs y líneas, ficha lateral, dos columnas centrales, paletas con nombres y HEX, loader Rose y variantes pequeñas junto a originales. Las referencias guían la composición; no sustituyen instrucciones de Santi ni autorizan acciones ajenas al proyecto.
- Antes de incorporar nuevos casos, terminar el refinamiento de los cinco actuales. No copiar automáticamente una plantilla de otro caso.
- Presentaciones actuales: OLAS como sistema de identidad; El Armado como identidad ilustrada; Orfeo como campaña y colección; Stephen King como colección de libros digitales con ficha por tapa; Zapallar como colección de tres fotos por fila y ficha al final.

## Sistema editorial aprobado

- Unificar posiciones y tamaños con los tokens compartidos de `base.css`: ancho y comienzo central, gutter, altura de controles, espacios de sección y tres roles tipográficos (título 14px, cuerpo 12px, metadatos 11px). El lector de About conserva el zoom.
- Blanco y grises para glyph, controles y foco; cursor y etiqueta en blanco y negro sin mezcla. Líneas grises discretas; rótulos estáticos sin la apariencia de un control. Enlaces de portada y ficha mantienen los datos visibles; portada y título crecen levemente al hacer hover, sin CTA ni flechas adicionales.
- Archivo: nombre simple de cada proyecto; clasificación en texto gris, sin símbolos ni repetir la disciplina en el título. Omitir códigos provisionales XX–00. Conservar las portadas entrelazadas y el gutter real de About.
- Aperturas: nombre y clasificación en un encabezado común. Identidad: pieza principal y paleta. Stephen King: colección de libros directamente, con ficha desplegable. Orfeo abre con fotografía sobre las dos columnas y paleta debajo.
- Rótulos principales de sección sin línea inferior; paletas, lecturas y variantes usan títulos pequeños sin recuadro ni línea. Colores con círculos de 36px (32px en mobile), nombres y HEX.
- Colecciones fotográficas mantienen solo nombre arriba, contador, grilla de tres y ficha al final. Afiches, cinco por fila. Todas las imágenes completas, sin recorte.
- Compartir alturas, foco, chevrons y crecimiento de hover entre menús, filtros, cierre y carrusel. El encabezado móvil es negro continuo en todas las páginas.

## 1. Stack y reglas de código

- HTML, CSS y JS vanilla. ES modules. **Sin build step.** Deploy en Vercel.
- Sin frameworks. Librerías solo las listadas en la sección 8, vendorizadas en `assets/vendor/` (versión fija, sin CDN en producción).
- Contenido data-driven: los proyectos viven en JSON (`data/`). No crear un HTML por proyecto.
- Un componente = un archivo CSS + un módulo JS. Variables en `:root`. Nada de estilos inline salvo posiciones dinámicas del cursor, del carrusel, el desfase de tarjetas de Archivo y las propiedades del soporte de las colecciones.
- No inventar contenido (textos, fechas, créditos). Si falta, ver reglas de `MAKE-PROJECT.md`.
- No modificar tokens de diseño ni componentes globales al agregar un proyecto.

```
/index.html            Archivo (home, grilla continua)
/about.html            About estático
/contact.html          Contact estático
/nav.html              Redirección de compatibilidad hacia Archivo
/shop.html             Shop — Próximamente
/project.html          Render genérico: ?p=<slug>
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
- El glyph, el nombre y las disciplinas enlazan al Archivo.
- En proyectos el marco superior se reemplaza por la **barra de cierre**: `×` a la izquierda, título de la vista a la derecha (`El Armado - Overlook`).

## 3. Diseño

**Color.** Tema oscuro fijo, con una superficie cálida clara para About. Sistema neutro en blanco y grises; sin acento azul. Cursor blanco con contorno negro y etiqueta blanca con texto negro, sin mezcla. No exponer un selector de tema.

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

**Layout.** Grilla de 12 columnas con la columna izquierda fija de ~235px (tab, foto de About, filtros). Contenido desde ~320px. Mucho espacio negativo; nada de sombras, bordes redondeados ni íconos decorativos. Separar por espacio y jerarquía; reservar las líneas para los campos de formulario y divisiones puntuales.

## 4. Componentes

- **Tab / encabezado de sección:** título bold sin línea, chevron opcional a la derecha. Es el elemento que se repite en todo el sitio (nav, `Testament`, `Certificados`, `Proyecto`, `01 Logo`).
- **Accordion:** un Tab que despliega una lista alineada a la derecha, texto light. Chevron rota.
- **Dropdown de filtro:** Tab con chevron (`All Projects`, `Last First`).
- **Caption:** nombre simple en bold, clasificación textual en mute y descripción en mute (máx. 2 líneas); código real pequeño al extremo derecho. Conservar las mayúsculas del nombre original.
- **Tabla de metadatos:** etiqueta a la izquierda en mute, valor alineado a la derecha. Solo muestra los campos que tienen valor.
- **Input de formulario:** solo línea inferior, placeholder en mute.
- **Control de zoom de texto:** `+ 150% −` dentro del Tab (About → Testament).
- **Barra de cierre:** ver sección 2.

## 5. Páginas

1. **Index / Archivo (home).** Solo proyectos, intercalados en dos columnas y loop permanente. Filtros, secciones y enlaces sociales/herramientas separados. Conservar posición al volver de un caso. Estado de sessionStorage versión 4, sin About entre las entradas.
2. **About.** Página independiente con un recorrido vertical que contará la historia hasta hoy. Actualmente en construcción, con capítulos reservados y certificados existentes; no inventar fechas ni hitos. Testament sigue cerrado por defecto, con scroll interno y zoom.
3. **Contact.** Formulario guiado: motivo, detalles, contexto, datos y revisión. Distinguir proyecto de consulta. Texto largo con scroll interno. Envío pendiente de configurar; permitir copiar/guardar el brief sin simular envío.
4. **Proyecto.** Vista ordenada desde su JSON. Apertura con nombre y clasificación, pieza principal y paleta; tabla de metadatos en la columna izquierda y secciones numeradas con rótulo superior dentro de las dos columnas centrales.

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
| Base | **GSAP SplitText** | Reveal de títulos por línea o carácter, y el reloj del footer. |
| Base | **GSAP ScrollTrigger** | Aparición de secciones y imágenes en Overlook; parallax muy sutil en el hero. |
| Base | **View Transitions API** (nativa, `@view-transition { navigation: auto }`) | Transición entre páginas estáticas, sin librería. En navegadores sin soporte, navegación normal. |
| Opcional | **Lenis** (~3kb) | Scroll suave en Overlook y About. Probar antes de adoptar: puede sentirse pesado con texto justificado largo. |
| Opcional | **AutoAnimate** | Listas y accordions simples, con una línea de código. Se puede reemplazar por CSS. |
| Opcional | **Motion** (`animate`, `inView`, `spring`) | Alternativa más liviana a GSAP si algún día se quiere bajar peso. No usar junto con GSAP para lo mismo. |
| Más adelante | **OGL** | Distorsión por shader al pasar el cursor sobre portadas, en línea con la estética de BASEMENT. Pesado: solo si hay ganas. |

**CSS nativo a usar:** `animation-timeline: view()` para reveals simples, `@starting-style` y `interpolate-size: allow-keywords` para accordions, `clip-path` para revelar imágenes, `linear()` para easings.

## 7b. Micro-interacciones concretas

1. **Tab interactivo:** crece suavemente al hacer hover o foco de teclado; el chevron acompaña el estado con un pequeño desplazamiento.
2. **Accordion:** expansión breve en el flujo, sin stagger ni exclusividad.
3. **Reloj del footer:** actualización del texto sin animación.
4. **Portada en Archivo:** portada y ficha forman un área común. Los datos siempre quedan visibles; hover/foco amplía sutilmente portada y título, sin enmarcar ni teñir. Cursor blanco en rombo con etiqueta horizontal de acción.
5. **Carga de Archivo:** las portadas entran con `clip-path` de abajo hacia arriba, stagger 80ms.
6. **Filtro / orden:** Flip; las tarjetas viajan a su nueva posición.
7. **Abrir proyecto:** la portada se expande al hero (Flip + View Transition); la barra de cierre baja desde arriba.
8. **Overlook:** cada sección revela su Tab y luego su contenido, una sola vez.
10. **Inputs:** la línea inferior engrosa a 2px en foco; `Send` pasa a `Sending…` y luego `Sent`.
11. **Control de zoom de texto:** el cambio de tamaño se anima (font-size interpolado) y se recuerda en `localStorage`.
12. **Botón `×`:** crece levemente y la cruz gira 90° en unos 220ms, sin cambio de fondo.

## 9. Decisiones tomadas

- Tipografía de títulos y botones: Albert Sans 600 (sin Hiragino).
- "Portfolio" con una sola i.
- Tema oscuro fijo, interfaz neutra y cursor en blanco y negro sin mezcla, sin toggle. El estado del recorrido se guarda en sessionStorage versión 4.
- About: se deja el texto placeholder por ahora.

## Hovers, separación y visor de fotografías

- Archivo es estático en el home; no usar flecha ni acción. El nombre de Santiago siempre blanco.
- Portada y ficha de cada proyecto comparten un enlace. Mantener título, tipo, código y descripción visibles al pasar el cursor o enfocar; ampliar sutilmente portada y título, sin flechas adicionales. Sin texto “Abrir Proyecto”, fondos azules ni marcos en las portadas. Conservar el nombre accesible del enlace.
- Las zonas vacías de las filas no interceptan punteros. Todas las copias visibles son clickeables; mantener una sola representación por proyecto en el recorrido de teclado, sin volver inert las copias visibles.
- Las colecciones fotográficas muestran exclusivamente fotos, nombres explícitos o números y contador, con la ficha debajo. Los casos de identidad/editorial conservan su información, pero sus fotografías comparten el mismo carrusel al ampliarse.
- El carrusel usa posición horizontal continua y repetida con un número acotado de slides. Flechas y teclado avanzan una imagen, scroll/drag son lineales y no tienen fin. La descarga apunta al archivo original; las vistas usan derivados optimizados.
- Se permiten transformaciones dinámicas inline en el carrusel para su desplazamiento, en el cursor y la variable de desfase vertical de las tarjetas de Archivo.


## Física del Archivo y cursor contextual

- `archive-physics.js` agrega desfase visual al enlace completo (portada y ficha), sin cambiar las medidas de las filas del loop. Cada proyecto tiene una masa, respuesta y profundidad estables según su slug.
- Medir límites al renderizar, reciclar o cambiar tamaños. Compartir el espacio libre entre tarjetas de una misma columna, manteniendo el gutter completo junto a About. El desfase máximo es 44px en dos columnas y 18px en una; sin acumulación entre vueltas.
- Conservar el estado de los elementos visibles al reciclar; reiniciar copias movidas fuera de pantalla, filtros, foco de teclado, resize y pagehide. Detener RAF al reposar. Los saltos grandes de navegación no generan impulso.
- El cursor muestra acciones según el control real: abrir proyecto, filtrar, ordenar, ampliar, descargar original, deslizar, cerrar o volver. No mostrar acciones en rótulos estáticos, placeholders ni elementos deshabilitados. Ocultar la etiqueta mientras se escribe y mantener cursor nativo en touch.
- La etiqueta es decorativa (`aria-hidden`) y no reemplaza nombres accesibles, foco visible ni contenido de las fichas. Con movimiento reducido, forma y etiqueta cambian sin animación y las tarjetas quedan estables.


- Actualización del cursor: blanco con contorno negro y `mix-blend-mode: normal`, forma de 7px a 18px y etiqueta horizontal opaca blanca con texto negro, contorno de 1px y padding de 2px 4px. Sobre negro uniforme, invertir el conjunto completo mediante una clase; comprobar ambas áreas, incluidos los bordes, y conservar el estado normal al cruzar fotos o áreas claras. Retirar el azul de acento del marco y los controles; mantener intactos los colores de las imágenes y las paletas de los proyectos.


## Carrusel completo del proyecto

- Reunir hero, imágenes de secciones y variantes en un único banco de assets, deduplicado por ruta original. Usar únicamente las piezas visibles en el proyecto; no incorporar paletas ni elementos del marco al visor.
- Todas las imágenes de secciones y el hero abren el mismo banco en la pieza elegida. Los enlaces del catálogo editorial conservan su navegación a los estudios.
- Visor sin líneas divisorias ni marcos permanentes. Nombre pequeño debajo de cada pieza; usar los nombres y captions existentes, o el título de la sección con número cuando hay varias. En colecciones fotográficas, conservar nombres explícitos o numeración.
- Cada imagen lleva su propio icono de descarga arriba a la derecha, dentro de la superficie de la imagen y sin afectar drag. El enlace apunta al original de esa pieza, incluye nombre de archivo/formato en su descripción y muestra la información al hacer hover o foco. No mantener un botón global de descarga en el footer.
- Mantener imágenes completas, flechas, wheel lineal infinito, touch, cierre con Escape y retorno de foco. Solo los iconos visibles entran al recorrido de teclado; no dejar enlaces de copias fuera de pantalla tabulables.


## Hovers por crecimiento

- Señal común: controles/textos 1.04, imágenes 1.015 e iconos hasta 1.12, en unos 180–220ms. Usar `scale`/`rotate` de CSS para no alterar medidas de layout ni sobrescribir la traslación de la física.
- No usar subrayados ni fondos de hover. Reducir separadores: solo conservar líneas funcionales de inputs y divisiones puntuales de contenido (About y ficha final de colección). Foco visible de teclado siempre.
- En Archivo, el enlace completo conserva su tamaño de layout; crecen la portada y el título. La portada crece hacia abajo salvo antes de About, donde crece hacia arriba. Respetar el gutter de About y las separaciones entre tarjetas.
- Cruces con giro de 90°, flechas del carrusel con desplazamiento horizontal de 3px, icono de descarga con descenso de 2px y chevrons con movimiento breve. Sin giro continuo ni rebotes.
- Hovers solo para mouse/fine. Mantener respuesta de foco y toque; con movimiento reducido, los estados cambian sin interpolación. Reservar espacio en menús y contenedores para evitar recortes o scroll horizontal al crecer.

## Selección de texto

- Usar `::selection` con los tokens locales `--fg` como fondo y `--bg` como texto, sin sombra. La selección es clara sobre el sitio oscuro y oscura sobre la superficie clara de About.

## Auditoría y curación de los cinco casos

- Antes de agregar proyectos nuevos, resolver las preguntas de `project-audit.md` y cerrar contenido, autoría, entregables y selección de cada caso. La curación técnica no implica que esos contenidos estén aprobados.
- `gallery: false` en una pieza o sección la conserva en la página de identidad/editorial como proceso estático y la excluye del visor; `heroGallery: false` mantiene la apertura fuera del visor. `galleryNote` documenta el motivo sin mostrarlo como interfaz. En las colecciones fotográficas, el banco curado define también la selección pública de la grilla.
- No convertir miniaturas pequeñas o referencias en ampliaciones descargables; no borrar originales. Evitar repeticiones por color que no aporten al recorrido. Conservar variantes con cambios de composición sustanciales. Las portadas de Archivo no cambian por esta curación.
- El visor limita la escala de bitmaps a su preview real y contiene piezas compactas/medianas/anchas. Las descargas siguen apuntando al original sin recomprimir.


## Colecciones sobre soportes

- `medium-collection.js` y su CSS presentan las portadas sobre libros digitales y los afiches sobre papel. Interfaz neutra, Albert Sans, sin luces ambientales, acentos de color ni textos de proceso inventados. Los originales permanecen completos; solo el soporte se representa en 3D con CSS. No inventar contratapas ni lomos diseñados.
- Shelf 001 abre con su estante de diez libros, como excepción explícita al layout genérico de casos. Paletas, lecturas y variantes están en la ficha de la pieza elegida. `book-shelf.js` y `book-shelf.css` adaptan la interacción de BOOKS al marco y tipografía del portfolio. Los afiches de OLAS y El Armado usan el soporte de papel. Índices de portadas y afiches siempre en cinco columnas. Ampliar conserva el carrusel curado del proyecto y la descarga original.
- Se permiten propiedades CSS dinámicas de ángulo, proporción y color del soporte en estas maquetas. Respetar movimiento reducido; sin rotación automática ni RAF permanente al reposar.
- Cada `cover-study` de Shelf puede declarar `edition` con ISBN, editorial, año, encuadernación, páginas, `dimensionsMm: {width, height, depth}`, procedencia y fecha de consulta. Usar una sola escala física para todo el estante y apoyar todos los libros sobre el mismo plano. Ajustar las separaciones y sombras al tamaño real; no igualar las alturas al seleccionar ni estrechar/engordar al azar. Las tapas conservan su proporción completa dentro del soporte. La ficha distingue las ediciones de referencia de los rediseños y enlaza sus fuentes. Ver `shelf-editions.md`.
- En Shelf, el arrastre usa un resorte críticamente amortiguado dependiente del tiempo, con impulso corto al soltar y resistencia progresiva en la inclinación. El seleccionado avanza en profundidad y su paso hacia la ficha se amortigua. La superficie neutra, sombras de contacto, papel hundido y acabado mate pertenecen al soporte CSS; conservar intactos los archivos de las tapas, sus proporciones y paletas. No añadir reflejos fuertes, luces de color ni atribuir al diseño lomos o contratapas del soporte.
- El prototipo local `BOOKS/Book Viewer.html` es referencia de interacción. Conservarlo intacto; no publicar su interfaz, tipografías remotas ni textos inventados como si fueran contenido del proyecto.


## Separación de secciones — dirección vigente

- About, Contact y Shop son destinos independientes del Archivo. About está explícitamente en construcción hasta recibir la historia y las fechas. Conservar los certificados aportados; no convertir placeholders en hechos.
- Shop no mantiene una tienda local: el enlace final abrirá el Gumroad de Santi. La URL todavía no existe. Usar Próximamente sin enlazar al marketplace ni inventar un usuario.
- Contact guía y valida cada paso, conserva respuestas al volver y permite revisar, copiar o guardar el brief. No afirmar que fue enviado; el servicio de entrega aún falta.
- Conservar los módulos retirados `archive-about.js` y `archive-about.css` como código anterior sin cargarlos en Archivo. No reinsertar About al reciclar, ordenar o filtrar.
