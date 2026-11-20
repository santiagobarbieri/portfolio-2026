# Santiago Barbieri — Portafolio

### Club de Economía: relato del proceso

La ficha recorre el contexto institucional, la exploración con flecha, su síntesis en diagonales y la construcción de marca, color, trama, publicaciones e historias. Incorpora la marca vectorial, la referencia UTDT atribuida y un estudio de movimiento de 20s con póster y reproducción automática, silenciosa y en loop. Las aplicaciones con datos de ejemplo se identifican como plantillas. Conserva las dos columnas centrales, el loop bidireccional y la ampliación sin descargas de materiales de cliente.

## Archivo — vistas compactas intercaladas · 20 de noviembre de 2026

La vista de dos columnas conserva su geometría. En cuatro y seis, acomodar cada pieza en la columna que termina antes, midiendo imagen y caption completos. Usar inicios desfasados y separaciones de 32/28px por columna, en vez de trasladar a todas las piezas el avance vertical de la vista de dos. La física se limita a los espacios reales. Mantener el marco, la calle central, el loop bidireccional, la pieza anclada al cambiar densidad, filtros, visor y carga bajo demanda. La navegación con flechas sigue la ubicación visual de las piezas.

## Archivo personal — recorrido y densidad · 20 de noviembre de 2026

`self-made.html` adopta POSTERS REFFFF: fondo negro, controles fijos en el lateral izquierdo y símbolo pequeño en el derecho. La vista inicial de dos columnas alterna piezas completas con nombre, formato/colección y descarga debajo. El selector 2/4/6 subdivide únicamente las dos columnas centrales del marco compartido, conservando la calle central. Búsqueda y filtros nativos por formato y orden desplazan sus controles en el lateral. No inventar fechas ni cargar afiches de clientes como trabajo personal; el catálogo actual conserva 84 piezas: 67 afiches A4, 11 tapas y 6 fotografías. Los afiches A4 se seleccionaron de ALT y Descargas, omitiendo mockups, estampas, materiales de consulta y piezas de clientes. Se preservan las imágenes originales en sus carpetas locales; las nuevas publicaciones y descargas son WebP de tamaño completo, con versiones de 400, 800 y 1600 px para carga bajo demanda. No anunciar estos WebP como archivos fuente originales. El inventario local de incorporaciones queda en AUDIT para revisión.

El loop se mantiene en ambas direcciones, con física limitada por las separaciones reales y DOM acotado. Los cambios de densidad conservan la pieza y su posición; los filtros, densidad y desplazamiento se recuerdan por sesión. El visor pausa el fondo y conserva descargas de originales personales, foco y selección filtrada. Sin JavaScript existe una selección completa en HTML. Móvil sigue pausado hasta 900px.

## Navegación vigente — 20 de noviembre de 2026

El home `index.html` se llama **Proyectos**. La sección personal antes llamada Lado B se activa como **Archivo**, en `self-made.html`, con su grilla visual y visor existentes. Los botones de regreso al home dicen Proyectos; Archivo identifica únicamente el trabajo personal. Librería, Sobre mí, Contacto y Tienda conservan sus estados pendientes. Esta activación no autoriza rediseñar las áreas restantes ni implementar las propuestas de la auditoría.

## Apolo y dirección vigente — 20 de noviembre de 2026

Datos y comandos en el lateral izquierdo; símbolo de Santiago en el derecho. Las dos columnas centrales conservan el recorrido infinito. Todos los casos usan el blanco del portfolio `--portfolio-paper: #f1ece0`; los colores de las piezas originales se preservan.

Apolo Studios presenta identidad, variantes, video de Menorca y cuatro drops: Everywhere, Circles, Sahara y Menorca. Santiago confirmó el espejo como Circles, la serie del subte como Sahara y VIDEO 1.mov como Menorca. Everywhere queda identificado por nombre; sus fotos y las adicionales de Circles están pendientes. No asignar imágenes de otras campañas. Conceptos y Orbit se retoman después. Las imágenes públicas son derivados WebP y el video MP4 bajo demanda; los originales locales se conservan.

La sección personal se llama **Lado B**, aún con candado. Las cinco portadas nuevas de assets reemplazan las anteriores. Hover y foco muestran una selección del caso, sin alterar la geometría de las tarjetas ni precargar el catálogo completo. Con movimiento reducido se muestra una sola vista previa.

El marco compartido usa cuatro columnas: logo a la izquierda, dos columnas centrales de recorrido infinito y datos/comandos a la derecha. Los laterales son más angostos. Archivo y los cuatro proyectos usan los mismos límites en `portfolio-grid.css`. Las paletas se muestran sin fondos auxiliares; se omiten las variantes raster blancas de bajo contraste y la marca vectorial OLAS se presenta en negro. Los originales se conservan.

El único home es `index.html`: Archivo, con proyectos intercalados en dos columnas y loop continuo. Las tarjetas anteriores al punto de entrada permanecen visibles desde el inicio para completar ambas columnas, también al recargar o volver de un proyecto. Sobre mí es un recorrido independiente en construcción. El lateral separa filtros, Sobre mí/Contacto/Tienda y Redes/Herramientas. Contacto abre otra pestaña; Tienda abrirá Gumroad cuando exista su URL. `nav.html` redirige al home y `project.html?p=<slug>` muestra cada proyecto. Tienda y el retrato de Sobre mí están pendientes de contenido. El logo vuelve al Archivo.

## Estado actual

La versión de escritorio es la prioridad de trabajo. Hasta 900px se muestra «Versión móvil en desarrollo.» y una indicación para visitar el sitio desde una computadora. Los módulos interactivos no se inician en la primera carga de esas pantallas; al ampliar la ventana se activa el escritorio con su carga habitual. El aviso existe en HTML/CSS y sigue visible sin JavaScript. El desarrollo de la versión reducida queda pausado.

El Armado, Club de Economía, OLAS y Orfeo comparten la lectura editorial: piezas en dos columnas alternadas, textos debajo y un loop continuo en ambos sentidos. «Fin del recorrido» señala el cierre antes de volver al comienzo. No hay una barra de fondo en la cabecera: los controles flotan sobre el contenido. Todos los bloques, incluido el cierre, respetan las dos columnas. Las referencias permanecen dentro de su columna y las imágenes se ajustan a su celda sin tapar captions.

## Presentación de los proyectos actuales

`project-editorial.css`, `project-editorial.js` y `project-editorial-loop.js` comparten la composición y el movimiento del Archivo. El reciclaje ocurre fuera de pantalla, conserva el foco y mantiene una sola representación accesible por bloque. Sin JavaScript queda la ficha completa; con movimiento reducido, el loop usa scroll nativo y no aplica resortes.

El Armado conserva la referencia crema/vino y variantes 2×2. Club usa gris y distingue sus plantillas de redes. OLAS presenta cuatro afiches en 2×2 dentro de su columna. Orfeo organiza la marca por familias y conserva sus diez fotografías en Multimedia, con flechas y carrusel al ampliar. Todas las piezas originales y las exclusiones de zoom se mantienen. Los clientes no ofrecen descargas y sus visores pausan el fondo.

## Publicación

- Sitio: https://portfolio-2026-ruby-three-66.vercel.app
- GitHub (privado): https://github.com/santiagobarbieri/portfolio-2026
- Proyecto de Vercel: `portfolio-2026`. La rama `main` está conectada para publicar automáticamente cada push.

Vercel sirve HTML, CSS, JavaScript y JSON directamente: no hay instalación ni compilación. `.vercelignore` excluye notas internas, el prototipo local BOOKS y el video fuente pendiente de convertir. Los originales se conservan intactos. Las descargas solo están habilitadas en las colecciones personales que las admiten.

## Vista local

Abrí `preview.command` con doble clic en macOS, o ejecutá:

```sh
python3 preview.command
```

La vista se abre en **http://127.0.0.1:4173/**. Mantené la terminal abierta mientras recorrés el sitio. No hay compilación ni dependencias que instalar.

Los módulos ES y la lectura de JSON necesitan HTTP. Abrir `index.html` como `file://` muestra el HTML de respaldo; el navegador bloquea los módulos y por eso no activa el loop, los filtros ni las interacciones.

## Contenido

- `data/projects.json`: registro, orden y portadas.
- `data/projects/<slug>.json`: detalles y secciones opcionales.
- `assets/images/<slug>/`: originales; no se renombran ni alteran.

El Archivo contiene cinco proyectos con imágenes. Contacto guía el brief en cinco pasos y permite copiarlo o descargarlo. El envío sigue pendiente de configurar; no se simula un envío exitoso.


## Presentación de proyectos

- **Estante 001 - Stephen King** abre un estante a pantalla completa basado en BOOKS: diez libros con rotación por arrastre, navegación por flechas y ficha individual con paleta, lectura visual y variantes. El carrusel y las descargas conservan el banco curado. El soporte incorpora respuesta amortiguada al arrastre, selección en profundidad, superficie de apoyo y materiales discretos; deja de animarse al reposar y respeta movimiento reducido. Los diez volúmenes varían su altura y grosor con referencias de ediciones identificadas por ISBN. El ancho sigue la proporción de cada tapa para cubrir el frente completo, sin márgenes ni deformaciones; la ficha muestra páginas y formato, y los datos editoriales completos permanecen documentados. Referencias y conversiones en [shelf-editions.md](./shelf-editions.md). OLAS y El Armado presentan afiches sobre papel. Los índices mantienen cinco columnas; las fichas se despliegan bajo demanda.
- Las maquetas usan CSS, imágenes propias y controles nativos. Sin dependencias nuevas, rotación automática ni textos inventados del prototipo BOOKS.

El trabajo actual se concentra en refinar los cinco proyectos existentes.

## Categorías del Archivo

- **Librería**: biblioteca propia en books.html; Estante 001 - Stephen King mantiene el estante de tapas. El enlace anterior sigue funcionando.
- **Posters**: sección retirada temporalmente; el enlace anterior lleva a Exploraciones.
- **Exploraciones**: archivo personal visual, claro e infinito, con libros y fotografías autorizados.
- **Proyectos**: Orfeo, OLAS y El Armado; trabajos para terceros, con su disciplina de identidad visual.
- **Colecciones**: Fotos en Zapallar; grilla fotográfica y carrusel.

En Estante, un toque sobre cualquier libro abre una ficha breve con paleta, nota de la tapa, técnica y sinopsis con fuente. El estante permanece estable. La rueda/trackpad y el arrastre del fondo recorren los libros con ajuste de posición; el libro central se puede girar por arrastre o con el control de rotación. El índice permite elegir una tapa. Se recuerdan selección, posición, orientación y variante durante la sesión. Los lomos y contratapas son soportes neutros hasta recibir originales diseñados.

## Exploraciones y carga de imágenes

`self-made.html` sigue la referencia con siete columnas en desktop, fondo claro, números y logo pequeño. `posters.html` usa la misma base para futuros afiches personales, sin incluir piezas para terceros. Librería tiene su propia página.

El catálogo `data/personal-work.json` contiene 17 originales únicos autorizados: 11 tapas/variantes y 6 fotos de Zapallar. Las 17 miniaturas nuevas de 400px pesan juntas unos 413 KiB. Los originales se conservaron intactos. La vista asigna las URLs solo cerca del viewport y recicla las filas. El visor también materializa solo imágenes cercanas, con el catálogo completo disponible por rueda/flechas/touch y descarga original por imagen.

Validación local con 200 entradas simuladas, viewport 1512×982, CPU a 4× y red de 500.000 bytes/s con 80ms de latencia: 35 miniaturas del grid solicitadas al inicio, 105 celdas constantes y 4 imágenes materializadas al abrir el visor; primer contenido visible y preparado a los 3,63s. Estas cifras describen esa prueba y sus condiciones. Los fixtures no se publican.

## Organización actual — 12 de noviembre de 2026

El loop contiene solo cuatro proyectos para terceros: Club de Economía — UTDT, OLAS, El Armado y Orfeo. Stephen King y Zapallar siguen disponibles en Librería y Exploraciones; `archive: false` conserva sus datos sin mostrarlos en la home. El menú de categoría queda oculto cuando solo existe una familia visible; el orden sigue disponible.

Librería abre una biblioteca por estantes, con un único Estante 001 — Stephen King publicado. Un clic entra a los diez libros. El botón superior del estante regresa a la biblioteca. Las miniaturas del índice no requieren descargar el detalle completo de cada colección.

Exploraciones reemplaza el nombre anterior del archivo personal, manteniendo su URL y selección. Posters se retiró de menús y sus URLs redirigen temporalmente a Exploraciones.

El nuevo caso Club de Economía — UTDT conserva los 26 originales aportados. La portada del loop es VARIANTE.png. Se muestran siete secciones y ocho piezas en el visor curado; las pruebas descartadas quedan como proceso pequeño y los iconos de baja resolución no se amplían. Se generaron previews WebP para las cinco aplicaciones de redes, sin sobrescribir fuentes. Los anuncios son plantillas con contenido de ejemplo. Código interno aún sin definir.


### Piloto de sitios independientes

El archivo abre cada proyecto en la pestaña actual y conserva la posición del loop al volver. El Armado es el primer sitio autónomo (`el-armado.html`): usa su paleta, sus ilustraciones y una composición propia. Su ficha genérica anterior redirige al piloto. Club de Economía replica ese recorrido en `club-de-economia.html`. OLAS y Orfeo conservan sus presentaciones actuales. Los destinos personales se llaman **Librería** y **Exploraciones**, con rutas conservadas.

El piloto incluye contenido HTML accesible sin JavaScript, navegación por secciones, alternancia color/trazo, visor de seis piezas y descargas originales. Las pruebas pequeñas de afiches no integran el visor. Los nuevos WebP son derivados; los originales no se modificaron.


### El Armado · modelo de Figma

La página reconstruye la ficha por scroll: marca fija al costado izquierdo, encabezado descriptivo, secciones que se acumulan, grilla de afiches uniforme y vista completa al final. En pantallas compactas el recorrido es vertical y las secciones se apilan como solapas. El contador indica sección actual y total. Con movimiento reducido se muestra la lectura normal.

Albert Sans está autoalojada en los pesos 300 (texto) y 600 (títulos), con ancho natural. Anybody se conserva como referencia y no se carga. No se incorpora Druk. Los proyectos para terceros usan zoom individual con tamaño limitado a la resolución real, sin controles de descarga. Librería y Exploraciones mantienen sus visores personales. Las variantes de afiches de El Armado quedan pendientes de las exportaciones mayores de Santi.

### Club de Economía · ficha acumulativa

`club-de-economia.html` replica el recorrido de El Armado con seis etapas: presentación, paleta, síntesis, sistema de marca, plantillas para redes y trama. La marca queda fija en la columna izquierda; el scroll reúne reversiblemente la ficha en escritorio y apila solapas en móvil. Las plantillas conservan sus datos de ejemplo. La portada del Archivo sigue siendo VARIANTE.png y la ruta genérica anterior redirige a la nueva página. Se conservan los originales, las exclusiones del visor, el zoom individual sin descarga, Rose y la lectura sin JavaScript o con movimiento reducido.

Albert Sans 600 es la fuente común de títulos, centralizada en `css/typography.css`, con ancho natural y sin mayúsculas forzadas. El cuerpo conserva peso 300. Se ajustan tamaños y espaciado para que las fichas acumulativas sigan entrando completas; las piezas originales permanecen intactas.

### Archivo compacto y carpetas de proyecto

Hasta 900px, el Archivo usa una sola barra superior de 64px más safe area y un índice de tres barras para filtros y enlaces. El loop conserva una única columna de portadas contenidas de hasta 300px y 56svh, sin dock inferior. En escritorio se mantienen las dos columnas.

El Armado y Club siguen ahora el modelo REWORK en ambas interfaces. La apertura tiene espacio propio y las carpetas posteriores asoman desde abajo. Cada pestaña está unida a su hoja completa; el scroll la sube hasta formar el apilado con pequeños escalones, sin encoger ni alejar las superficies. La paleta tiene fondo gris neutro y las muestras no llevan contornos.

En móvil las solapas conservan su secuencia horizontal, reducen los nombres y usan «…» cuando hace falta. El nombre completo sigue disponible para tecnologías de asistencia. Tocar una cambia la carpeta frontal sin saltos de página; el contenido largo conserva su lectura completa. Con movimiento reducido o sin JavaScript queda una lectura vertical normal. El Armado abre con ilustración, logotipo y descripción según la referencia; el enlace de Instagram queda pendiente de una URL real.

### Auditoría responsive de las carpetas

El borde de cada hoja usa un trazado SVG continuo, sin cortes en las curvas o diagonales. La reserva inferior considera todas las solapas y las áreas seguras. En ventanas horizontales bajas se compactan encabezado, apertura y grillas para aprovechar el espacio. Se mantiene el texto completo y las proporciones originales de las imágenes.

El lector de una carpeta seleccionada deja pasar el gesto al recorrido al alcanzar su extremo o cuando el contenido ya entra completo. Rueda, touch y teclado retoman la misma sección. Las validaciones abarcan 32 formatos de ambos proyectos, entre 320 y 2560px de ancho, incluyendo ventanas de 320px de alto, además de lectura completa, zoom, rotación y fallbacks.

### Interiores de carpeta y continuidad visual — 15 de noviembre de 2026

El Armado y Club de Economía usan cabeceras más breves y una grilla amplia, con composiciones específicas para paletas, ilustraciones, marcas, afiches y aplicaciones. Cuando sobra altura en escritorio, el conjunto se centra; en móvil se prioriza una pieza principal con más margen y referencias/variantes desplegables. Los grupos adicionales se muestran abiertos en escritorio. Los textos de proceso se consultan bajo demanda. Se conservan las 26 referencias de imagen de ambas páginas y todos sus archivos originales.

Las piezas permanecen dibujadas durante todo el recorrido: la siguiente carpeta las cubre físicamente, sin cortes de visibilidad a mitad de una transición. Las carpetas estacionadas mantienen su contenido fuera del viewport hasta entrar. La lectura se conserva al recuperar una solapa y se recalcula al expandir contenido. Este cambio no migra todavía OLAS u Orfeo.

### OLAS y Orfeo · extensión de las carpetas

Los cuatro proyectos del Archivo comparten el apilado de carpetas, sus controles y la lectura completa. OLAS (`olas-ditella.html`) conserva cinco afiches, marca y exploraciones, iconografía y stickers sobre azul/menta. Orfeo (`orfeo.html`) organiza la colección, las fotografías de campaña y las familias de marca, lacres y estampillas sobre marfil/carbón. Sus 44 piezas únicas existentes se conservan; las exclusiones previas del zoom y los créditos también.

Ambas páginas tienen HTML legible sin JavaScript y usan `project-case.js` / `project-case.css` para las mejoras compartidas. Los enlaces anteriores `project.html?p=olas-ditella` y `project.html?p=orfeo` redirigen a los nuevos destinos; Archivo los abre en la pestaña actual. Las cuatro secciones con Coming soon siguen desactivadas en el índice.

### Carpetas completas, sin lectores ni desplegables

En los cuatro proyectos, el interior de cada solapa es una grilla estática: todas las piezas aparecen directamente. Las filas y columnas se ajustan al área disponible sin deformar las imágenes. Se eliminaron los desplegables y los desplazamientos internos; rueda, touch y teclado mueven las carpetas a través de la página. Los textos son breves y los créditos quedan visibles. Las imágenes conservan la ampliación individual y no se retiraron piezas. Con movimiento reducido o sin JavaScript, sigue disponible la lectura vertical normal.
