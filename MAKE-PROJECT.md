# MAKE-PROJECT.md — cómo crear la página de un proyecto

## Capas opacas y loader legible · 24 de noviembre de 2026

El loader corredor se ve unos 1,35 segundos (700 ms de preparación mínima y barrido de 650 ms); espera más solo si faltan recursos. Recorre el ancho de la pantalla con el borde del color. Movimiento reducido conserva 1,3 segundos sin barrido. En proyectos aparece primero el fondo, luego el PNG transparente nativo; logo y fondo salen mediante la misma opacidad del contenedor, sin rectángulo propio ni fallback a portada. OLAS usa verde profundo; Club gris y logo monocromo para el contraste. Las secciones, transiciones y loaders excluyen por completo al escenario del loop con display:none para que las tarjetas recicladas no escapen por visibility. Contacto colorea toda la firma en rojo igual que Sobre mí en verde. No añadir bordes ni fondos a medios del lector. Las portadas derivadas conservan RGBA: Club, Orfeo y El Armado tienen una franja transparente inferior que nunca debe convertirse a RGB negro; las caras del carrusel tampoco pintan un fondo detrás de esa franja.

## Foco previo a la apertura y cierre vacío · 24 de noviembre de 2026

Clic o toque en una tarjeta de la pila entra primero en modo foco; solo una segunda activación de la tarjeta enfocada y asentada, o Abrir proyecto desde su ficha, abre el caso. Enter sigue la misma regla. Sin foco, rueda continua; con foco, una tarjeta por gesto y reconocimiento de inercia para evitar saltos múltiples. También aceptar rueda sobre la ficha de foco, sin interceptar formularios, desplegables ni el lector. Escape cierra el foco. Los iconos direccionales comparten la esquina sin asta del nav, orientada según la acción, con trazo de un píxel que no engrosa al escalar. El hover conserva fondo y tinta y desplaza el icono tres píxeles en su dirección; el control de foco se eleva dos píxeles. Mantener foco visible y omitir el desplazamiento con movimiento reducido. Se retiran Fin del proyecto y los comandos finales, conservando un espacio blanco de cierre; las flechas laterales siguen disponibles.

## Cargas sin espera artificial · 24 de noviembre de 2026

Santiago pidió reducir la demora del loader: se elimina el mínimo fijo de cinco segundos. La capa se cierra al decodificar los recursos necesarios, con un barrido breve de 240 ms. El inicio espera únicamente portadas; una entrada directa espera solo los recursos de esa sección o proyecto. Los logos transparentes se preparan al abrir su caso. Conservar errores, reintentos, cancelación y preparación detrás de la capa opaca, sin mostrar contenido por defecto. Este criterio reemplaza las esperas mínimas anteriores. Los seis logos de apertura usan PNG transparentes, en proporción nativa y con encaje contain sin recortes. Orfeo abre sobre gris claro para que su marca negra sea visible; las portadas del inicio no cambian.

## Loop V21 con foco · 24 de noviembre de 2026

El inicio adopta el modelo «Loop de tarjetas - Scroll focus V21.html»: una pila diagonal continua, foco frontal, navegación por pasos y rueda con detección de gestos, indicador circular por vuelta y contador de seis proyectos. El índice centra y enfoca el elegido; el centro del indicador permite entrar o salir de foco. Las flechas recorren las tarjetas y Escape cierra el foco. Portada y Abrir proyecto entran a la misma ficha, en la pestaña actual. `assets/scripts/focus-loop.js` conserva la geometría y máquina de estados del modelo; `css/focus-loop.css` adapta sus controles a la identidad existente. Suspender el motor detrás de secciones, cargas, menú, visor y pestaña oculta; respetar movimiento reducido.

Las seis portadas nuevas vienen de la carpeta subida en dist/assets/Project Cover. Los PNG originales se preservan ahora en assets/Project Cover, ignorados por Git y excluidos del build; sus derivados públicos viven en assets/images/project-covers. No guardar originales únicamente dentro de dist, porque se regenera. No deformar ni recortar las portadas: conservar su relación 2015:1350. La apertura actual muestra primero el color y luego el logo original, antes del recorrido finito. Esta secuencia reemplaza la aparición simultánea anterior, manteniendo el loader corredor de unos cinco segundos, lector y navegación vigentes.

## Wildfolk, aperturas y navegación · 24 de noviembre de 2026

Esta actualización reemplaza las secuencias de apertura y las reglas de menú anteriores cuando entren en conflicto. El home reúne seis casos: Apolo Studios, Orfeo, OLAS Di Tella, Club de Economía — UTDT, El Armado y Wildfolk. El carrusel del inicio conserva la cámara aprobada, avance continuo, previews, selección táctil y sonido solo por hover real. Club sigue mostrando únicamente su portada.

Wildfolk se presenta como proyecto personal de 2026 para una marca ficticia de cerveza artesanal: cuatro latas, cuatro afiches, firma/isotipo, seis personajes, paleta y dos mockups. No atribuirle un cliente real, fabricación ni resultados comerciales. Explicar brevemente la exploración asistida por IA y la selección de personajes. Las cuatro versiones de afiche de Escritorio tienen 2480 × 3508 px y reemplazan sus exportaciones pequeñas. `assets/images/wildfolk-web/` contiene derivados optimizados y variantes de ampliación; los originales de `assets/images/wildfolk/` permanecen locales, ignorados por Git y excluidos del build. No borrar ni sobrescribir esos originales.

La entrada a cada sección principal o proyecto usa una capa opaca de su color durante un mínimo de cinco segundos y hasta que sus recursos críticos estén decodificados. El logo corredor original cruza la pantalla con un barrido al revelar la vista; `css/section-load.css` contiene esta capa. Preparar la página detrás del loader, nunca mostrar el contenido por defecto antes. El color del proyecto y su logo se presentan juntos, después se acerca la pieza y se revela el lector blanco. Recalcular geometría si cambia el viewport durante la espera. Movimiento reducido conserva la espera y omite el barrido/zoom. Cancelar timers, animaciones y preparación obsoleta al salir; error real mantiene reintento y regreso accesibles.

Todos los lectores usan el logo original transparente en negro, sin fondo. `assets/images/project-marks/` reúne las variantes de Apolo, Orfeo y Club; OLAS y El Armado conservan sus originales y Wildfolk su firma transparente. Mantener proporción nativa y encaje, sin deformar ni extraer marcas de capturas. Las portadas completas del home siguen independientes. Las fichas mantienen dos columnas centrales en computadora, una en móvil y recorrido finito, sin loop interior ni descargas de assets de clientes.

Solo hay un símbolo de Santiago, junto a su nombre. Sobre mí colorea de verde el bloque completo de firma, incluido el logo, con el mismo borde negro fino de las demás tiras. Cursor e indicación de acción vuelven a blanco y negro. Los menús desplegables son exclusivos y animan apertura y cierre; Proyectos permanece siempre desplegado, también en móvil. La rueda o el gesto vertical cambia entre Testamento y Credenciales al llegar al límite de su contenido; si un panel desborda, primero permite leerlo. Estos cambios internos no reinician la espera de cinco segundos. Conservar foco, teclado, historial y gestos nativos.

Archivo continúa con candado. Retrato definitivo, texto final de Sobre mí, destinos de Tienda/Redes y transporte real de Contacto siguen pendientes. No inventarlos.

## Recorrido finito y apertura de logos · 23 de noviembre de 2026

Por indicación de Santiago, las fichas recuperan la composición editorial anterior: tarjetas completas alternadas entre dos columnas centrales en computadora, imagen o grilla arriba y texto debajo; una columna en móvil. Medir la altura completa de cada tarjeta, reservar separación entre piezas y mantener los controles fuera de la lectura. El recorrido tiene un final real: sin recycler, clones de contenido ni regreso automático al inicio. El home conserva su carrusel continuo en perspectiva y sus gestos.

`css/project-reader.css` aísla este lector; `setupFiniteReader` dispone tarjetas y controla una rueda suave, acotada al inicio/final y con un desfase mínimo. Touch, teclado y movimiento reducido conservan desplazamiento nativo. Limpiar listeners, observadores y animaciones al navegar. Las referencias de VERSION 1 se consultan fuera del repositorio; no son una dependencia pública.

La apertura acerca primero la pieza, luego llena el fondo con el color del proyecto y finalmente revela el lector blanco. Este orden reemplaza la apertura histórica color→logo. OLAS y El Armado usan los originales transparentes en proporción nativa; su encaje inicial corresponde al logo dentro de la portada, sin estirar el rectángulo de object-fit. La tinta del lector y del cierre se conserva mediante máscara; usar URLs resueltas contra el documento. Decodificar las instancias de imagen antes de mostrarlas y comprobar cancelación antes de crear capas. Escape, historial y resize no deben dejar clones ni controles bloqueados.

## Auditoría, navegación y entrada por capas · 22 de noviembre de 2026

Santiago movió VERSION 1 - PORTFOLIO fuera del repositorio: no recrearla ni depender de ella en runtime. Su traslado se registra en Git; el respaldo externo permanece intacto. El sitio actual se publica desde index.html y sus assets activos mediante build.mjs.

La apertura muestra primero el color, después la pieza ascendente y por último textos y demás contenido. Usar openingArt cuando exista un original transparente adecuado; las portadas del carrusel siguen completas. El Armado usa Logo.png hueso y OLAS su Logo.svg; los otros casos conservan sus portadas hasta tener variantes con contraste. No borrar fondos por código ni extraer gráficos de capturas.

La navegación utiliza historial real, conserva lectura y permite volver con Atrás/Adelante. Las pestañas de Sobre mí se identifican por tab en la URL y tienen roles, asociación de panel y teclado. Escape en un desplegable no cierra la sección. Retrato, texto biográfico definitivo, tienda/perfiles y envío de contacto siguen pendientes: no inventarlos.

## Publicación vigente · 22 de noviembre de 2026

La prueba `carousel-study.html` se convierte en el `index.html` público por indicación de Santiago. El carrusel, los cinco casos y las vistas personales funcionan dentro de esa página. Los enlaces antiguos se conservan mediante redirecciones a `?project=<slug>` o `?view=<sección>`. El resto de los HTML, módulos y recursos sin uso actual pasa a `VERSION 1 - PORTFOLIO/`, con inventario de rutas y SHA-256. No usar esa carpeta como fuente pública ni borrar sus originales. AUDIT sigue siendo una colección local ignorada por Git dentro de la versión archivada.

`node build.mjs` genera únicamente `dist/index.html`, `dist/assets/` y `dist/css/`. Vercel sirve `dist/`; la versión anterior nunca se incluye en el deploy. Se conserva el aviso móvil hasta 900px. La descripción de arquitecturas anteriores que aparece más abajo es historial, no el árbol vigente. Al actualizar contenido, editar el catálogo incorporado en `index.html` y conservar imágenes completas, cargas bajo demanda, cursor contextual y reproducción silenciosa de videos. Contacto no simula envíos; los perfiles y tienda pendientes no tienen URLs inventadas.

## Apolo — identidad, prendas y campañas · 21 de noviembre de 2026

El recorrido de Apolo avanza por apertura/rol, distintas firmas, colores observados, producción y preparación, Everywhere, Circles, Sahara y Menorca, video de Menorca y cierre. Santi autorizó buscar más material en sus carpetas: se incorporan derivados de fotos cotejadas con sus referencias y prendas, conservando originales. Las dos imágenes de producción son contexto general; no atribuir todas las prendas de esos encuadres a Circles o Everywhere. La foto del café de Everywhere coincide con Figma. No fijar fechas individuales, autoría fotográfica ni una cronología entre las variantes de marca. No publicar planes internos ni colecciones no confirmadas.

Mantener el marco de cuatro columnas y las dos centrales en loop. Cada campaña tiene una selección breve y distintas vistas, con carousel sin descargas; no sumar tomas casi iguales o muy oscuras por cantidad. `apolo-story.css` ajusta únicamente esta ficha. Las paletas son valores observados en las piezas y la prenda marrón, no una especificación de producción. El preview de Apolo en Proyectos toma una imagen de cada drop; las portadas y el motor del home no cambian. La reestructuración del home como feed de piezas queda como propuesta para conversar con Santi. Videos automáticos, en loop, mudos y sin controles, con pausas fuera de pantalla; móvil sigue pausado.

## Videos automáticos y silenciosos · 20 de noviembre de 2026

Todos los videos públicos se reproducen automáticamente, en loop y sin sonido. Con JavaScript, `project-videos.js` reproduce solo las ocurrencias visibles y pausa el resto; las copias de medición y del buffer no deben arrancar. Reanudar al volver a la pestaña, al escritorio o al cerrar un visor. Presentar únicamente el video: sin controles, foco de teclado, arrastre, picture-in-picture ni reproducción remota. El video no recibe interacción de puntero; el scroll de la página sigue disponible sobre su superficie. Conservar dimensiones, póster, tiempo de reproducción y originales. Esta política sustituye la reproducción manual anterior. El aviso móvil no reproduce contenido oculto.

## Club de Economía — proceso paso a paso · 20 de noviembre de 2026

El caso separa referencia institucional, exploración, síntesis y aplicaciones antes del cierre. Cada bloque responde qué decisión se tomó y por qué. Marca vectorial nítida; exploraciones pequeñas sin zoom; variantes junto a su original; posts 4:5 e historias 9:16 separados; motion vertical con póster y reproducción automática, silenciosa y en loop. Los nuevos pasos viven en el HTML esencial y los metadatos acompañan el mismo orden. No extrapolar este rediseño a otros proyectos sin revisarlos con Santi.

Atribuir la marca UTDT como referencia. No inventar autores, métricas, eventos, anuncio de relanzamiento ni fotos faltantes. Los anuncios publicados son plantillas con datos de ejemplo; los valores HEX provienen de las piezas. Mantener las dos columnas y auditar alturas completas con notas/captions y continuidad en ambas direcciones. El hover de Club en Proyectos sigue desactivado.

## Archivo — vistas compactas intercaladas · 20 de noviembre de 2026

La vista de dos columnas conserva su geometría. En cuatro y seis, acomodar cada pieza en la columna que termina antes, midiendo imagen y caption completos. Usar inicios desfasados y separaciones de 32/28px por columna, en vez de trasladar a todas las piezas el avance vertical de la vista de dos. La física se limita a los espacios reales. Mantener el marco, la calle central, el loop bidireccional, la pieza anclada al cambiar densidad, filtros, visor y carga bajo demanda. La navegación con flechas sigue la ubicación visual de las piezas.

## Archivo personal — recorrido y densidad · 20 de noviembre de 2026

`self-made.html` adopta POSTERS REFFFF: fondo negro, controles fijos en el lateral izquierdo y símbolo pequeño en el derecho. La vista inicial de dos columnas alterna piezas completas con nombre, formato/colección y descarga debajo. El selector 2/4/6 subdivide únicamente las dos columnas centrales del marco compartido, conservando la calle central. Búsqueda y filtros nativos por formato y orden desplazan sus controles en el lateral. No inventar fechas ni cargar afiches de clientes como trabajo personal; el catálogo actual conserva 84 piezas: 67 afiches A4, 11 tapas y 6 fotografías. Los afiches A4 se seleccionaron de ALT y Descargas, omitiendo mockups, estampas, materiales de consulta y piezas de clientes. Se preservan las imágenes originales en sus carpetas locales; las nuevas publicaciones y descargas son WebP de tamaño completo, con versiones de 400, 800 y 1600 px para carga bajo demanda. No anunciar estos WebP como archivos fuente originales. El inventario local de incorporaciones queda en AUDIT para revisión.

El loop se mantiene en ambas direcciones, con física limitada por las separaciones reales y DOM acotado. Los cambios de densidad conservan la pieza y su posición; los filtros, densidad y desplazamiento se recuerdan por sesión. El visor pausa el fondo y conserva descargas de originales personales, foco y selección filtrada. Sin JavaScript existe una selección completa en HTML. Móvil sigue pausado hasta 900px.

## Navegación vigente — 20 de noviembre de 2026

El home `index.html` se llama **Proyectos**. La sección personal antes llamada Lado B se activa como **Archivo**, en `self-made.html`, con su grilla visual y visor existentes. Los botones de regreso al home dicen Proyectos; Archivo identifica únicamente el trabajo personal. Librería, Sobre mí, Contacto y Tienda conservan sus estados pendientes. Esta activación no autoriza rediseñar las áreas restantes ni implementar las propuestas de la auditoría.

## Vista previa contenida — 20 de noviembre de 2026

Las vistas previas del Archivo muestran la pieza completa centrada dentro del 82% de la caja, sin fondo auxiliar ni recorte; conservar los fondos propios de las imágenes. La portada se oculta visualmente durante el preview y vuelve al salir, sin cambiar la geometría. Club de Economía conserva solo su portada y no tiene secuencia de hover.

## Apolo y dirección vigente — 20 de noviembre de 2026

Datos y comandos en el lateral izquierdo; símbolo de Santiago en el derecho. Las dos columnas centrales conservan el recorrido infinito. Todos los casos usan el blanco del portfolio `--portfolio-paper: #f1ece0`; los colores de las piezas originales se preservan.

Apolo Studios presenta identidad, variantes, video de Menorca y cuatro drops: Everywhere, Circles, Sahara y Menorca. Santiago confirmó el espejo como Circles, la serie del subte como Sahara y VIDEO 1.mov como Menorca. Everywhere queda identificado por nombre; sus fotos y las adicionales de Circles están pendientes. No asignar imágenes de otras campañas. Conceptos y Orbit se retoman después. Las imágenes públicas son derivados WebP y el video MP4 bajo demanda; los originales locales se conservan.

La sección personal se llama **Lado B**, aún con candado. Las cinco portadas nuevas de assets reemplazan las anteriores. Hover y foco muestran una selección del caso, sin alterar la geometría de las tarjetas ni precargar el catálogo completo. Con movimiento reducido se muestra una sola vista previa.

## Cuatro columnas y piezas sin soportes — 19 de noviembre de 2026

La marca comparte una grilla de cuatro columnas en Archivo y los cuatro casos publicados: lateral izquierdo con logo; dos columnas centrales de contenido con scroll infinito; lateral derecho con datos y comandos. Los laterales son más angostos (proporción 1 / 1,7 / 1,7 / 1). `portfolio-grid.css` define el mismo marco, columnas y calles para las cinco páginas. Mantener las piezas y sus referencias dentro de la columna central que les corresponde; los laterales permanecen fijos. No volver a barras superiores que crucen el recorrido. La versión móvil sigue pausada hasta 900px.

No agregar fondos auxiliares a paletas ni a piezas de poco contraste. Las paletas conservan sus colores y HEX reales, sin paneles grises. Omitir del caso las versiones raster blancas que necesitaban un soporte para verse: dos descartados y el isotipo claro de Club, el banner PNG de OLAS y las dos estampillas claras de Orfeo. El SVG de marca OLAS y el fragmento vectorial claro 4 se presentan negros sobre el lienzo. La marca también se amplía en negro con un velo claro. Los vectores que ya tienen color y contraste conservan sus colores. Preservar los fondos que formen parte de la pieza original, sus archivos y la selección de descargas desactivada para clientes.


## Corrección de grilla y solapamientos — 19 de noviembre de 2026

Mantener siempre las dos columnas exteriores, también en afiches y en «Fin del recorrido». Ningún bloque puede ocupar ambas. OLAS muestra cuatro afiches (1, 2, 3 y 5) en una grilla 2×2 dentro de su columna; el 4 se omite por redundancia editorial y su archivo original se conserva.

Las imágenes, botones, captions y referencias deben caber en sus celdas reales: tracks `minmax(0,1fr)` y mínimos cero impiden que el tamaño intrínseco de las imágenes invada textos o filas. Las referencias de El Armado se mantienen dentro de su propia columna, al costado de la ilustración. Medir las alturas completas, con captions/notas, y reservar separación para la física y el hover. El cierre separa todas las piezas antes del siguiente inicio, conservando ancho de una columna. Auditar hijos y captions, además de los contenedores, en múltiples tamaños y con el loop en ambas direcciones.

## Dirección vigente — recorrido editorial de clientes · 17 de noviembre de 2026

Santi autorizó extender la prueba de «El Armado Redo.png» a Club de Economía, OLAS y Orfeo. Esta dirección reemplaza las instrucciones anteriores de carpetas, apilado y Colapsar para esos cuatro casos. Las piezas se leen de arriba hacia abajo en dos columnas alternadas, con títulos y textos debajo. `project-editorial.css`, `project-editorial.js` y `project-editorial-loop.js` comparten presentación, carga y reciclaje. No modificar el loop del Archivo ni los originales para esta adaptación.

- El recorrido termina con «Fin del recorrido», el nombre del caso y «Volvemos al inicio», con espacio antes de la siguiente apertura. El marcador no tiene franja de fondo ni detiene el loop. Cada vuelta conserva la composición; la apertura comienza a la izquierda.
- La cabecera es transparente: Cerrar, nombre/objetivo y símbolo pequeño flotan sobre el recorrido, sin barra opaca que tape imágenes. Solo usar enlaces oficiales confirmados.
- El Armado conserva la referencia crema/vino y variantes 2×2. Club usa gris y sus piezas originales, con la aclaración de que las piezas de redes son plantillas. OLAS reúne cuatro afiches en 2×2 dentro de una sola columna. Orfeo mantiene Multimedia con diez fotos y separa sellos, ornamentos y estampillas por familias.
- Conservar fuentes, paletas y notas sobre valores muestreados. No reinsertar nombres personales retirados de Orfeo ni atribuir toda su identidad a Santiago. No inventar cuentas o créditos.
- Reutilizar scroll suave y física del Archivo, con límites según los espacios reales. Reciclar solo fuera de pantalla con compensación exacta; mantener un h1, IDs únicos, una representación accesible por bloque y foco estable. El visor pausa el fondo. Sin JavaScript, la ficha completa sigue en HTML; movimiento reducido conserva el loop sin resortes.
- Ampliación individual limitada por resolución, sin descargas de assets de clientes. Solo Multimedia de Orfeo usa el carrusel sin descargas. El aviso móvil hasta 900px y Rose antes de revelar el contenido siguen vigentes.


## El Armado — prueba editorial exclusiva del 17 de noviembre de 2026

Solo El Armado sigue ahora «El Armado Redo.png»: fondo crema #F2EDE3, wordmark y símbolo vino y dos columnas alternadas. El recorrido es ahora infinito en ambos sentidos, con reciclaje fuera de pantalla y compensación exacta del scroll, reutilizando el movimiento y los resortes del Archivo. Imagen y texto comparten el desfase; el espacio real de las referencias limita la física para evitar choques. La paridad de cada aparición mantiene la alternancia también entre vueltas. Conservar un solo h1, IDs únicos, una representación accesible por bloque y copias visibles clickeables. El visor pausa el fondo y conserva su foco; movimiento reducido mantiene el loop con scroll nativo y sin física. Sin JS queda la ficha estática completa. Apertura y afiche final a la izquierda, paleta rectangular y cuatro variantes en 2×2 a la derecha; ilustración con referencias pequeñas al costado. Cada texto queda debajo de su pieza. Sin carpetas, Colapsar ni motor de apilado en este caso. `el-armado.css` y su módulo de entrada son locales; conservar los otros tres proyectos y el Archivo. Albert Sans, Rose antes de revelar, ampliación individual sin descargas y aviso móvil hasta 900px siguen vigentes. Los originales permanecen intactos; la marca vino usa su alfa como máscara CSS. Esta excepción no reemplaza las reglas de carpetas de Club, OLAS ni Orfeo.


Instrucciones para Codex. Santi sube las imágenes de un proyecto a `assets/images/<slug>/` y te pide: *"armá el proyecto `<slug>`"*. Tu trabajo es leer esa carpeta, generar el JSON del proyecto y registrarlo. Los casos existentes usan `project.html` desde su JSON. La dirección posterior de Santi autoriza páginas autónomas: El Armado es el primer piloto, en `el-armado.html`. No convertir los otros casos automáticamente. Lee primero `AGENTS.md` (diseño, componentes, movimiento).

## Solapas en dos columnas — 16 de noviembre de 2026

Cada solapa de escritorio tiene explicación a la izquierda y piezas principales a la derecha. `.folder-copy` reúne título, texto, enlaces confirmados, notas de paleta y referencias pequeñas; `.folder-art` reúne la imagen principal, la grilla o Multimedia. Las referencias se mantienen dentro de la columna izquierda y conservan su escala y ampliación. No volver a una cabecera horizontal de ancho completo.

El área de contenido reserva una franja inferior amplia, calculada según el viewport y las carpetas estacionadas. Ninguna pieza, caption o control debe quedar bajo la siguiente hoja cerrada. Ajustar las grillas al área real; no recortar contenido, agregar scroll interno ni ocultarlo por progreso. Mantener Colapsar como única acción para cerrar la pila completa y los bordes siempre negros.

Club usa superficies en escala de grises. La entrega final de El Armado usa hueso, y su símbolo pequeño y favicon también son hueso. Evitar repetir fondos de acento intensos; conservar los colores originales de las piezas y de las muestras de paleta. Se retiraron los créditos personales visibles de Orfeo por indicación de Santi; no reinsertarlos ni convertir la omisión en una atribución de toda la marca a Santiago. El desarrollo móvil continúa pausado.

## Cierre explícito de carpetas — 16 de noviembre de 2026

Una vez que toda la pila se abrió —con scroll o al tocar una solapa— queda abierta. La rueda, Home/End y volver hacia arriba no cierran el conjunto. «Colapsar» aparece arriba junto al logo y es la única acción que devuelve todas las carpetas a la apertura. Las solapas siguen intercambiándose en su lugar. Mantener el estado al redimensionar y al cerrar un visor, sin reanudar el scroll de fondo mientras la pila esté abierta. Con movimiento reducido o sin JS se conserva la lectura normal. El borde SVG de todas las carpetas es siempre negro (#000), independientemente de su superficie o texto.

## Solapas sin negro — 16 de noviembre de 2026

Las superficies y sus solapas nunca usan negro ni carbón. Elegir otro color de la paleta del proyecto o un gris claro con contraste suficiente; Trama de Club usa el gris claro #D9D9D9. La tarjeta Paleta conserva su gris neutro. Esta regla no recolorea las imágenes originales ni cambia el aviso móvil.

## Identidad y aperturas compartidas — 16 de noviembre de 2026

Dirección posterior de Santi para los cuatro casos del Archivo:

- Las aperturas comparten la composición de Orfeo: logo a la izquierda y nombre, contexto e introducción a la derecha. Nunca usar una fotografía como apertura. Las fotografías de Orfeo se reúnen en Multimedia; no atribuir la autoría de la marca a Santiago.
- `project-identity.css` centraliza apertura, barra fija y colores de cada carpeta. Las solapas usan colores de la paleta del caso, con texto que contraste. Paleta conserva una superficie gris neutra ajena a la identidad. No teñir ni modificar los originales.
- La barra mantiene Cerrar, nombre/objetivo y enlaces oficiales siempre visibles. Usar únicamente URLs confirmadas por Santi; no inferir cuentas por nombre. La marca pequeña de Santiago y el favicon conservan un color propio de la identidad. El contorno del favicon aporta contraste sin aclarar todas las marcas ni añadir fondos.
- Al tocar una solapa desde la pila cerrada, las hojas suben ordenadamente con un desfase corto. Después se conserva el cambio de orden en el mismo lugar. El scroll puede retomar el recorrido sin esperar ni quedar atrapado; no ocultar el contenido durante el apilado.
- Los casos con muchas fotos pueden usar `data-multimedia`: una imagen con nombre/contador y flechas dentro de la carpeta, sin scroll interno; al activarla se abre el carrusel de fotografías. Sin descargas en trabajos para clientes. Las imágenes esenciales existen en HTML; la lectura reducida o sin JS permanece disponible. No borrar ni reemplazar originales.
- Las portadas del loop son logos o afiches, con fondos distintos del negro. Club usa el isotipo blanco sobre celeste; Orfeo, su logotipo sobre marfil. Los captions muestran disciplina concreta, año confirmado y descripción breve completa. Retirar códigos arbitrarios y los recortes con puntos suspensivos. Conservar loop, física y regreso al punto del Archivo.
- Móvil continúa pausado con su aviso hasta 900px. Librería, Exploraciones, Sobre mí y Contacto siguen con candado y Coming soon.

## Escritorio primero — 16 de noviembre de 2026

La experiencia móvil está pausada por indicación de Santi. Las páginas públicas muestran un aviso temporal hasta 900px y reservan los módulos interactivos para escritorio mediante `desktop-gate.js`. Mantener la pantalla y la carga cubierta por Rose; no desarrollar nuevas grillas, transiciones o controles móviles hasta que se retome esa fase. El contenido de cada proyecto sigue existiendo en HTML y el fallback de escritorio permanece disponible sin JS.

## Corrección vigente: todo visible dentro de cada solapa

Santi retiró el scroll interno y los desplegables de las carpetas de los cuatro casos. Cada sección usa una `.folder-board` con piezas y captions estáticos, o una paleta completa. El motor mide el espacio, conserva proporciones y ajusta la grilla; el scroll de página únicamente mueve las hojas. Textos y créditos son breves y visibles. No añadir lectores, disclosures ni paginación para hacer caber contenidos. Verificar límites reales, sin usar `overflow: clip` para ocultar piezas sobrantes. La máscara sirve para el apilado. El zoom individual conserva el acceso a la resolución original y las exclusiones de la selección existente. El fallback usa scroll normal de la página.

## Extensión a OLAS y Orfeo — 15 de noviembre de 2026

La extensión a los dos casos restantes está autorizada. Los cuatro proyectos del Archivo usan carpetas; OLAS y Orfeo comparten el controlador `project-case.js` y las composiciones de `project-case.css`. Sus HTML autónomos contienen textos, imágenes y disclosures sin depender del JSON para la lectura. El registro conserva metadatos y rutas compatibles. No modificar la selección, autoría o correspondencia de fotografías por adoptar la estructura común. Usar las piezas existentes, respetar `gallery: false`, zoom individual sin descargas y la procedencia de los HEX. Librería y Exploraciones conservan su experiencia, actualmente deshabilitada en la navegación.

## Interiores y continuidad — 15 de noviembre de 2026

El Armado, Club, OLAS y Orfeo están autorizados para este refinamiento. En escritorio usar una cabecera breve y una grilla ancha para las piezas, centrando la composición si sobra alto. En móvil priorizar título, resumen y pieza principal, con padding de 20–24px y referencias/variantes en `details` nativos. Los grupos adicionales se abren por defecto desde 768px. El proceso puede desplegarse sin agregar texto al recorrido principal. Mantener nombres, proporciones, paletas, archivos originales y aclaraciones de procedencia.

No ocultar contenido por porcentaje de scroll: solo la superficie opaca de otra carpeta debe sacarlo de vista. Las piezas estacionadas entran desde fuera de pantalla con su hoja; reservar el alto de los escalones fuera del área de lectura de cada carpeta. `inert` depende de la cobertura geométrica. Restaurar el offset leído al recuperar una carpeta y recalcular el recorrido al abrir/cerrar desplegables sin mover la página. Probar ida/vuelta alrededor de cada cambio de sección, disclosures, ventanas bajas, teclado, zoom y fallback normal antes de publicar.

## Carpetas completas — REWORK del 14 de noviembre de 2026

El Armado y Club comparten el recorrido `project-folders.js` / `project-folders.css` en escritorio y móvil. La apertura permanece fuera de las carpetas. Cada sección posterior es una hoja de ancho completo con su solapa unida físicamente al borde; al inicio asoman desde abajo y el scroll las sube hasta apilarlas con escalones de 12px, sin escala ni profundidad. Esta dirección reemplaza el ensamblado de escritorio y el rail separado de solapas.

En móvil se conserva la secuencia horizontal: reducir el tamaño de los nombres y usar ellipsis cuando todavía no entren, manteniendo el nombre completo accesible. No trasladar solapas a otra fila ni convertirlas en botones separados de la hoja. Tocar una intercambia su lugar con la frontal sin desplazar la página. Conservar lectura completa de piezas largas, zoom individual, carga cubierta por Rose y lectura vertical normal sin JS o con movimiento reducido. Las tarjetas de paleta usan gris neutro ajeno a la identidad (#C8C8C8), sin bordes en los colores. No migrar los otros proyectos hasta recibir sus referencias.

### Verificación de proporciones y scroll

Las hojas dibujan su contorno con un único SVG de stroke constante. Medir la reserva inferior según cantidad de solapas y safe area, además del viewport real. Revisar teléfono vertical/horizontal, tablet, escritorio, ultrapanorámico y ventanas bajas. La apertura no invade encabezado ni solapas. Contener las piezas en su espacio y evitar scroll innecesario. Cuando una carpeta seleccionada sí requiere lectura interna, sus extremos liberan rueda, touch y teclado al recorrido de la misma sección. No dejar gestos atrapados en tarjetas sin overflow.

## Club de Economía — extensión autorizada

Santi autorizó replicar la ficha acumulativa de El Armado en Club de Economía. `club-de-economia.html`, su CSS y módulo JS propios conservan el contenido existente, la paleta gris/celeste/negro y Albert Sans en textos y piezas. Los títulos usan Albert Sans 600, a ancho natural y sin mayúsculas forzadas, compartida en typography.css por toda la web. El registro declara `page` para Archivo y la redirección antigua. Seis etapas, marca fija a la izquierda, ensamblado reversible en escritorio y solapas verticales en móvil. No migrar otros casos sin indicación. No inventar eventos a partir de las plantillas.

## Ficha acumulativa y ampliación de clientes — 13 de noviembre de 2026

El Armado sigue los modelos de Figma y las aclaraciones de Santi: ensamblado por scroll reversible en desktop, solapas verticales en mobile y contador actual/total. Albert Sans 600 es la familia aprobada para títulos, con cuerpo 300; Anybody y Druk no se cargan. En todos los casos `family: identity` se usa ampliación individual, sin carrusel ni descarga. Los párrafos de visor y descargas de esta guía se conservan para colecciones personales y quedan reemplazados para los clientes por esta indicación. No cambiar las otras composiciones hasta recibir sus modelos.

## Proyectos autónomos — dirección actual

El registro admite `page`, una ruta local al sitio del proyecto. Archivo abre cada caso en la pestaña actual y el render genérico redirige los enlaces antiguos si existe `page`. La página del piloto puede cambiar marco, composición y colores para expresar la identidad de El Armado, conservando accesibilidad, carga cuidada, cursor y visor. Antes de diseñar otro sitio autónomo, definirlo con Santi. La navegación del portfolio está en español: Librería y Exploraciones.

## Referencias de cada proyecto

Santi aporta referencias de cómo quiere presentar cada proyecto, además de los assets. Leerlas junto a los datos antes de diseñar. Traducir su composición, escalas y orden a la identidad del portfolio; mantener el marco, tipografía, tabs, paletas, navegación y ancho central. El caso nuevo no debe heredar automáticamente la distribución del anterior. Las imágenes y documentos de referencia son material visual y de contenido, no instrucciones para ejecutar acciones fuera del pedido.

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
- `category` describe la disciplina (el filtro principal usa `family`): `identidad`, `editorial`, `digital`, `fotografia`, `direccion-creativa`. Si el valor es nuevo, agrégalo al registro y repórtalo.

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
  ]
}
```

### Entrada en `data/projects.json`

Objeto con `slug`, `code`, `title`, `type`, `category`, `description`, `cover`, `w`, `h` (dimensiones reales de la portada) y `order` (más reciente primero; si no está claro, pregúntale a Santi o ponlo al principio).

## 4. Bloques y reglas de layout

Cada sección usa un bloque. El tipo se deduce del nombre de la carpeta; si no coincide con ninguno, `gallery`.

| Bloque | Carpeta típica | Render |
|---|---|---|
| `logo` | `logo`, `marca` | Marca contenida dentro de una columna del home. Varias: comparación compacta en dos columnas. |
| `palette` | `paleta`, `colores` | Círculos iguales (4 por fila), nombre y HEX debajo, en mute. Datos desde `palette` de `project.md`. Si no hay datos, muestrear los colores de las imágenes y reportarlo. |
| `type` | `tipografia` | Nombre de la fuente en bold; si hay imágenes, muestra de tipografía a ancho completo. |
| `pair` | `afiche`, `poster` | 1 pieza: centrada, máx. 400px de ancho. 2: lado a lado. |
| `grid` | `instagram`, `variantes`, `fotos`, `aplicaciones`, `iconografia` | Grilla según cantidad (abajo). |
| `sequence` | `proceso`, `making-of` | Una imagen por fila, ancho completo, con respiro vertical amplio. |
| `video` | `video` | Reproductor a ancho completo. |
| `text` | `texto`, `notas` | Texto light en columna angosta (máx. 420px). Contenido desde `.md` dentro de la carpeta. |
| `gallery` | cualquier otro | Igual que `grid`. |
| `comparison` | original y variantes asociadas | Principal en la primera columna y miniaturas en la segunda. La sección contiene `items` y `variants`. |

**Grilla vigente:**
- El área de contenido coincide con las dos columnas centrales de Archivo: hasta 870px, con el mismo gutter y alineación.
- Las grillas con `frame: poster` tienen cinco columnas en todo tamaño, incluidas sus variantes; las miniaturas abren una ampliación accesible. Las fotos dentro de identidad conservan dos columnas y pasan a una en mobile; las colecciones `family: photography` mantienen tres por fila.
- Ninguna imagen de una grilla se destaca con mayor tamaño ni ocupa ambas columnas.
- Las celdas de una misma grilla tienen el mismo ancho y alto. `frame` define su proporción: `poster`, `portrait`, `landscape`, `square` o `story`.
- Proporción original siempre; las imágenes se contienen completas en las celdas, sin recortes ni `object-fit: cover`.
- Las marcas y pruebas pequeñas conservan escala contenida para no ampliar archivos de baja resolución.

**Apertura de identidad/editorial:** encabezado común con nombre y clasificación textual. `00-hero` ocupa la primera columna central, con la paleta a su lado; en una campaña fotográfica como Orfeo, la foto ocupa las dos columnas y la paleta queda inmediatamente debajo. La ficha y el índice permanecen fijos en la columna lateral izquierda. En mobile se despliegan desde un control fijo.

**Numeración:** las secciones se numeran `01`, `02`… por orden de carpeta. El hero y los metadatos no se numeran (`Proyecto` es el primer Tab).

### Composición por sección

`layout` permite variar la presentación conservando el marco y la tipografía compartidos:

| Layout | Uso |
|---|---|
| `brand-board` | Comparación de marcas e ilustraciones contenidas, sin ampliar logos al ancho completo. |
| `uniform-grid` | Fotos en dos columnas y afiches en cinco, con celdas iguales y sin jerarquías de tamaño. `frame` define la proporción de la celda. |
| `contact-sheet` | Variantes y recursos pequeños en una plancha de escala controlada. |

En las marcas se puede declarar `size: compact|medium|wide`. Los logos quedan dentro de una columna central: una marca cuadrada llega a unos 300px y un monograma a 120–180px. No usar diferencias de tamaño ni alineaciones escalonadas en grillas de fotos o afiches.

La propiedad raíz `palette` contiene `title`, `description`, `source` y `colors: [{name, hex, source?}]`. En identidad/editorial se presenta junto al hero o debajo si el hero fotográfico ocupa ambas columnas; las colecciones fotográficas omiten este bloque. `source` distingue valores provistos, colores de las piezas, muestras de aplicaciones o paletas fotográficas. Los nombres y HEX quedan visibles; si son valores muestreados, explicitar que son de referencia. Stephen King usa `source: per-cover` y conserva las paletas individuales.

Las variantes van en `variants: [{src, w, h, alt, caption, sources?}]` de la sección que contiene su principal. `variantsTitle` puede distinguir exploraciones, aplicaciones de color u otras versiones verificadas. Se muestran como pruebas pequeñas, sin ampliar originales ni recortar. `cover-study` también admite `variants`, junto a la paleta y lectura visual. Mantener aparte las piezas que pertenecen a otra familia o no tienen relación demostrable.

Para piezas editoriales individuales, `block: cover-study` muestra una tapa y una ficha lateral. La sección incluye un único `item`, `colors: [{name, hex}]` e `inspiration` como lectura visual breve. Si no existen referencias originales, describir solamente motivos visibles; no atribuir influencias al autor. En Stephen King los colores están muestreados de cada portada y esta lectura fue autorizada por Santi.

## 5. Visor y colecciones

El visor del proyecto usa el banco curado de `project-assets.js`, con piezas deduplicadas por original, nombres existentes y exclusiones `gallery: false`. El logo y el cierre del proyecto vuelven al Archivo.

Para una colección editorial con `catalogue`, los bloques `cover-study` alimentan la colección de libros de `medium-collection.js`. Su ficha desplegable conserva `colors`, `inspiration` y `variants`. Los afiches con `frame: poster` usan el mismo componente sobre papel, con cinco miniaturas por fila. No inventar información de contratapas o lomos; son maquetas digitales del frente disponible.

## 6. Imágenes

- No modifiques ni muevas los originales de Santi.
- Lee el ancho y alto reales y escríbelos en el JSON para evitar saltos de layout.
- Si ejecutas optimización, genera `*-1600.webp` y `*-800.webp` junto al original y úsalos en `srcset`. No pierdas la referencia al original.
- `alt`: descriptivo y corto, en español. Si no lo puedes saber, usa `"<Título> — <Sección>"`.
- Nombres con espacios, tildes o mayúsculas: no los renombres; escapa la URL.

## 7. Casos límite

- **Proyecto de una sola imagen:** solo hero + metadatos; sin secciones.
- **Proyecto fotográfico (ej. Fotos En Zapallar):** `family: photography` activa la colección de tres fotos por fila y el carrusel compartido; la ficha va debajo y `meta` puede ser solo `Lugar` y `Año`.
- **Sin portada:** usa la primera imagen disponible y repórtalo.
- **Proyecto sin texto:** descripción `"Completar"` en Archivo; no dejes el campo vacío.
- **Proyecto que ya existe:** actualiza; no dupliques en `projects.json`.

## 8. Checklist y reporte final

Antes de terminar, verifica que `project.html?p=<slug>` abre sin errores en consola, que ninguna imagen devuelve 404 y que el proyecto y la mesa global cargan. Responde con:

1. Archivos creados o modificados.
2. Secciones generadas (número, título, bloque, cantidad de imágenes).
3. Campos que quedaron en `"Completar"` o vacíos.
4. Archivos de la carpeta que no pudiste clasificar y dónde los pusiste.
5. Cualquier decisión que tomaste que Santi debería revisar.

La propiedad raíz `family` usa `identity`, `books`, `posters` o `photography` según la clasificación confirmada por Santi. Se declara también en el registro. Es independiente de `category` y no permite inferir encargos o clientes.

### Composiciones refinadas

- `presentation`: clase de composición a nivel proyecto, con variantes implementadas `identity-system`, `illustrated-identity`, `fashion-campaign`, `editorial-series` y `photo-essay`. Mantienen el mismo marco y ancho central.
- `layout: symbol-grid`: símbolos contenidos en cinco columnas en desktop y dos en mobile.
- `layout: reference-sheet`: referencias pequeñas, cuatro columnas en desktop y dos en mobile, sin ampliar originales de baja resolución.
- `layout: product-triptych`: tres piezas iguales alineadas, con captions y ampliación. Mantiene tres columnas y las imágenes completas.
- `catalogue: {title}`: colección de los bloques `cover-study` sobre libros digitales, con índice de cinco tapas por fila y ficha desplegable por pieza. No duplica datos de paleta ni variantes.
- La navegación de secciones usa reemplazo de hash para que cerrar el proyecto vuelva directamente al Archivo. Los rótulos de sección acompañan el contenido con sticky, dejando libre la barra superior y la ficha móvil.

`heroSources: [{src, w, h}]` permite reutilizar las versiones responsive de la apertura sin cargar siempre el archivo más grande. Mantener las dimensiones y rutas reales.

## Home vigente

Archivo contiene solo proyectos. About es una página independiente en construcción y no forma parte del registro ni del loop. Los filtros, About/Contact/Shop y Socials/Tools ocupan tres grupos separados. Conservar cursor, física, loop impar y estado de sesión versión 4 al incorporar casos. Shop abrirá Gumroad cuando exista su URL; no inventar enlaces.

En ORFEO, las prendas confirmadas son Viamonte (marrón tejido), Talcahuano (negro liso) y Lavalle (azul tejido). La foto `IMG_4452` del modelo junto al árbol pertenece a Viamonte. Verificar visualmente las piezas antes de agruparlas; no inferir la prenda por la ubicación o por un alt previo.

## Colecciones fotográficas y ampliaciones

Para `family: photography`, usar la vista de colección: tres imágenes por fila, imágenes completas, contador y `name` solo si se proporcionó un nombre real. No generar nombres a partir de `alt` ni de nombres de archivo. No mostrar paletas, análisis o capítulos en la grilla. La ficha se presenta debajo de las fotos.

El carrusel reúne el hero, las imágenes de todas las secciones y sus variantes por ruta original, sin duplicar exportaciones. Cada pieza muestra su nombre debajo (o número si una fotografía no tiene nombre explícito). Visor sin líneas, con flechas, rueda/trackpad horizontal continuo e infinito y gesto horizontal. Cada imagen lleva un icono de descarga en su esquina superior derecha, con nombre del archivo y formato en hover/foco; no usar una descarga global. `original` es la ruta de descarga en calidad original; las previews usan WebP. Incluir los originales de descarga en el deploy, sin modificar ni recomprimir los archivos fuente.


## Escala editorial compartida

Los tokens de `base.css` fijan el ancho y el comienzo del contenido, el gutter, la altura de controles, los espacios de sección y tres roles tipográficos. No introducir tamaños de metadatos distintos por proyecto. Marcas de apertura contenidas en 260–280px; paletas de círculos de 36px (32px en mobile). Los títulos de variantes y lecturas no llevan la clase de control `tab`; los rótulos principales de sección no llevan línea inferior. La clasificación es texto gris sin símbolos adicionales. Ver el sistema editorial aprobado en AGENTS.md.


El sistema de hover usa crecimiento breve de controles e imágenes, sin subrayados ni fondos. No añadir líneas decorativas al incorporar casos. Conservar la composición de transformaciones: la física de Archivo traslada el enlace y el hover escala su portada/título; las ampliaciones y descargas conservan sus áreas de interacción.

## Selección editorial del visor

`gallery: false` en un item o una sección excluye esa pieza del carrusel y desactiva su ampliación, conservándola en pequeño como proceso en identidad/editorial. `heroGallery: false` hace lo mismo con la apertura. `galleryNote` y `heroGalleryNote` documentan el criterio para futuras revisiones. En `family: photography`, el banco curado es también la selección de la grilla pública. No usar estos campos para borrar originales ni confundir una variante editorial con un archivo técnicamente defectuoso.

El visor usa una preview optimizada y limita el tamaño raster a los píxeles disponibles; los originales mantienen sus enlaces de descarga. Las marcas y recursos compactos conservan escala contenida. Ver `project-audit.md` para las preguntas y decisiones de los cinco casos actuales.

## Estantes de libros

`presentation: "book-shelf"` y `shelf: {number, author}` presentan los bloques `cover-study` como una colección CSS 3D a pantalla completa con ficha individual. Shelf 001 - Stephen King conserva su slug y la portada original del Archivo. Los libros toman imágenes, proporciones, paletas y lecturas de las secciones existentes; no duplicar tapas, ni inventar lomos o contratapas. El soporte neutro es una maqueta. Las variantes con `gallery: false` permanecen pequeñas y no sustituyen la tapa del libro ni entran en el visor. El arrastre del libro central gira con resistencia según su volumen; el fondo y la rueda recorren el estante con ajuste al libro más cercano. Un toque sobre cualquier libro abre directamente una ficha compacta modal, sin reacomodar la escena ni hacer zoom. No agregar Ver ficha. El índice de tapas permite saltar a cada libro; posición, rotaciones y variantes se recuerdan en sessionStorage. Mantener teclado, touch, reduced motion y Rose antes de revelar el estante. La sección se abre en books.html?shelf=<slug>; project.html?p=<slug> conserva una redirección compatible. No publicar el prototipo local BOOKS.

Cada bloque de libro puede incluir `edition: {isbn, publisher, year, binding, pages, dimensionsMm: {width, height, depth}, measurementStatus, sources: [{label, url, fields}], verifiedAt}`. Mantener ISBN y formato consistentes entre las fuentes; diferenciar medidas comerciales reportadas de estimaciones. No inferir páginas ni lomo solo por el título, ni mezclar cifras de distintas ediciones. `book-shelf.js` usa las alturas y grosores de referencia a una escala común. Adapta el ancho a la proporción nativa de la tapa activa, con la misma línea de apoyo y distancias según el ancho resultante. El frente queda cubierto completo, sin estirar, recortar ni agregar márgenes; las variantes y cambios responsive deben actualizar esa proporción. Las medidas editoriales de la ficha conservan su valor documental y no son las medidas de producción del rediseño. Los datos completos de edición y sus fuentes se conservan en el JSON y en shelf-editions.md; la ficha pública se mantiene breve.

Cada libro puede definir `designNote`, `technique`, `synopsis` y `synopsisSource: {label, url}`. `shelf.technique` contiene la técnica común declarada por el autor; no inferirla de la imagen. La ficha muestra paleta, una nota breve de diseño, técnica y argumento sin spoilers, con fuentes de sinopsis verificadas. Los detalles completos de edición permanecen en los datos y en `shelf-editions.md`. Distinguir tapa dura y rústica en los bordes del soporte. Mientras no existan originales de lomos o contratapas, conservar soportes neutros. Para futura navegación entre estantes, registrar `shelf: {number}` en el índice; solo mostrar destinos realmente publicados.

## Archivo personal (Self Made / Posters)

Registrar exclusivamente piezas personales autorizadas en `data/personal-work.json`, sin convertir materiales para terceros en ejercicios personales. Santi aprobó las tapas de Stephen King y las seis fotos de Zapallar; los afiches actuales de OLAS/El Armado no forman parte de Posters ni de Self Made.

Cada pieza usa `id` estable, `kind: book|poster|photo|logo`, `src`, `original`, dimensiones reales, `alt`, `name` opcional, `sources` y `thumbnail: {src,w,h}`. La miniatura de 400px es una copia optimizada nueva, en assets/images/personal-previews/, con la proporción completa. Preservar el original y las previews mayores para el visor y su descarga. Excluir las piezas no ampliables/de proceso según la curación de origen. Evitar duplicar exports del mismo original.

Las vistas comparten grilla calmada, sin análisis ni metadatos visibles además del número. Posters filtra `kind: poster` y comunica el estado vacío mientras no haya piezas. Self Made mezcla los tipos. Mantener el fallback estático de imágenes, la memoria de posición, flechas de teclado y el reciclado independiente de cuántos archivos tenga el catálogo.

## Biblioteca, Archivo y Obra propia

`archive: false` en el registro excluye casos de la home sin borrar sus datos ni romper sus URLs. Books y Fotos en Zapallar están fuera del loop. Los casos para terceros, incluido Club de Economía — UTDT, se mantienen visibles. En la home, no mostrar filtros de familias sin entradas.

Books sin `shelf` abre un índice de estantes, no el primer proyecto automáticamente. El registro `shelf: {number, author, bookCount, preview: [{src,w,h,scale}]}` usa miniaturas ya existentes y proporciones de referencia. Al entrar al estante, la barra superior vuelve a la biblioteca.

`heroSize: compact|medium|wide` limita la apertura dentro del visor compartido sin modificar el archivo original. El tamaño de cada item conserva su prioridad. Obra propia es el nombre público del archivo personal en self-made.html; Posters está retirado temporalmente.

En Club de Economía, mostrar la paleta muestreada #42AEBD / #D9D9D9 / #000000, declarar el origen de los valores, conservar las plantillas como plantillas y no añadir aplicaciones descritas pero no entregadas. El código de proyecto sigue pendiente (XX–00, oculto en la UI).

## Relatos y selección de los casos de clientes · 21 de noviembre de 2026

La revisión posterior a Apolo alcanza El Armado, OLAS, Orfeo y Club. Conservar el home y su estructura mientras Santi define el feed. El Armado conecta color, construcción de la ilustración, pruebas, afiche final y adaptación a historia. OLAS explica la O/ola, sus recursos y la campaña; sus cuatro afiches existentes usan ahora derivados de originales grandes cotejados visualmente. Orfeo distingue las tres prendas con galerías de frente, detalle y contexto, más una selección de campaña; no atribuir a Santiago toda la marca, la fotografía ni los resultados comerciales. Club conserva su secuencia reciente, las plantillas y el estudio de movimiento como ejemplos. No agregar fotos genéricas ni entregables ausentes.

Los cuatro HTML contienen la historia esencial; `story` en sus datos registra su orden y textos. Los derivados nuevos conservan proporción, procedencia y originales locales. Sin descargas en casos de clientes. Videos mudos, automáticos y sin controles. Mantener cuatro columnas, galerías accesibles, loop, cierre explícito y móvil pausado. La selección y correspondencias quedan documentadas en AUDIT. Las variantes pequeñas de El Armado siguen pendientes de exportaciones mayores; no inventar detalle.

## Inicio permanente en dos mitades · 21 de noviembre de 2026

El home Proyectos presenta un panel izquierdo fijo de media pantalla con identidad, filtros y navegación, y el loop en dos columnas dentro de la mitad derecha. Esta indicación sustituye el marco anterior solo en el inicio; los proyectos y Archivo personal mantienen su composición. El panel puede plegarse a una franja de 104px con marca, nombre y control de expansión, conservando el punto del recorrido y el acceso a la pausa. Estado recordado por sesión. Sin JavaScript, panel completo y catálogo HTML legible.

El recorrido avanza a 22px/s tras cinco segundos de inactividad en la zona de proyectos. Interacción de puntero, rueda o teclado lo detiene; una tarjeta en hover o con foco impide el avance. Usar la mitad izquierda no lo interrumpe. Pausa manual visible, suspensión al ocultar/salir de la página y movimiento reducido sin automatismo. Nunca desplazar automáticamente los interiores de proyectos. Móvil sigue pausado. Herramientas permanece retirada y Redes sigue como lista visible.

## Presentación personal, contraste y transiciones · 21 de noviembre de 2026

Santi autorizó refinar la web con mayor contraste y un panel más personal. En el inicio, la mitad izquierda usa el blanco del portfolio #f1ece0 y tinta #171714; la derecha conserva negro y dos columnas de proyectos. Este contraste local reemplaza el nombre blanco dentro del panel claro, sin recolorear piezas originales. El texto habla de identidad, dirección creativa, web y fotografía, e incluye el rol confirmado de cofundador y director creativo de Apolo. Proyectos y Archivo son los destinos principales; Librería, Sobre mí, Contacto y Tienda se agrupan como En preparación. Redes continúa visible, con perfiles pendientes sin URLs inventadas; Herramientas no vuelve.

El plegado usa una View Transition puntual con fallback inmediato, conservando anclaje y foco; nunca interpolar el ancho real del loop por frame. La entrada del texto sucede después de Rose y no oculta contenido del HTML de respaldo. Los previews alternan dos imágenes decodificadas, sin fondo añadido ni huecos, y Club mantiene solo su portada. El rótulo En recorrido enlaza al caso visible. Contraste mayor en textos secundarios, descripciones a 14px en los casos y captions más legibles en el inicio. En el home el nombre y la descripción usan todo el ancho; año y disciplina comparten la fila intermedia. Conservar movimiento reducido, pausa manual, autonomía del panel izquierdo, videos mudos sin controles y móvil pausado.


## Dirección vigente — entregas, color y recorrido único · 21 de noviembre de 2026

El inicio usa negro continuo en presentación, feed y comandos, separado por líneas grises finas. Acentos #03B047, #D3532E y #01A2F2; texto pequeño de color solo sobre negro con contraste suficiente. El gris claro #D9D9D9 reemplaza al crema del portfolio, sin modificar colores ni fondos originales de las piezas.

El panel de presentación izquierdo permanece fijo y ya no tiene opción de plegado ni estado de toggle. Su lista Proyectos permite saltar dentro del loop y señala el caso visible; enlaces HTML conservan navegación sin JavaScript. El feed ocupa el ancho completo de su zona en una sola columna de portadas, una debajo de otra, con captions en flujo y separación real para la física. La nueva firma del catálogo invalida geometrías de la antigua doble columna. Los interiores de clientes y Archivo personal conservan sus composiciones propias.

Filtros y opciones de recorrido se ubican en el lateral derecho del feed, mediante iconos y desplegables nativos. Un solo panel abierto, cierre exterior/Escape, foco visible y pausa del avance automático mientras se usan. Se conserva avance a 22px/s tras cinco segundos de inactividad, pausa manual, suspensión en pestaña oculta, movimiento reducido y loader Rose. No automatizar el scroll de las fichas. El aviso móvil hasta 900px continúa vigente.

Las cinco fichas muestran primero las entregas: El Armado (afiche e historia), OLAS (afiches y stickers), Club (marca y plantillas), Orfeo (campaña y prendas) y Apolo (cuatro colecciones y video). Títulos literales y explicaciones breves. Pruebas descartadas y referencias de proceso quedan fuera del recorrido principal; originales y datos anteriores se preservan. No atribuir resultados, autorías ni eventos no confirmados. Club mantiene las aclaraciones de plantillas y valores de ejemplo. Videos automáticos, mudos, en loop y sin controles; sin descargas de clientes.


## Proyectos — carrusel central en perspectiva · 21 de noviembre de 2026

El home reemplaza el feed vertical por una hilera horizontal con leve ascenso diagonal, basada en la grabación de referencia. Planos paralelos con perspectiva CSS, inclinación moderada (16° en Y, 3° en Z), escala y superposición; no un aro ni coverflow de caras enfrentadas. El escenario ocupa el centro y el panel izquierdo queda más compacto con presentación y lista de saltos. Colores, líneas finas, comandos a la derecha y el pequeño símbolo se conservan.

`project-carousel.js` y `project-carousel.css` aíslan la presentación del inicio; no modificar por esta prueba los interiores de clientes ni el Archivo personal. Rueda, arrastre con umbral y pequeño impulso, teclado, Anterior/Siguiente y lista izquierda recorren el mismo catálogo infinito. Los siete planos del buffer se reciclan fuera de vista; no copiar todo el catálogo indefinidamente. Click real abre la ficha en la pestaña actual; un arrastre nunca abre un enlace. Nombre, disciplina y descripción del seleccionado permanecen legibles fuera de la perspectiva.

Conservar portadas completas y previews decodificados, sin deformar ni recolorear originales; Club mantiene solo su portada. Rose cubre la preparación de imágenes y disposición. Pausa de sesión, automatismo tras cinco segundos, suspensión en comandos/hover/foco/pestaña oculta y movimiento reducido se conservan mediante adaptadores del panel. El gesto manual prevalece; al abrir comandos se detiene también la inercia automática residual. El estado del carrusel es independiente de posiciones verticales antiguas. Sin JS permanecen las cinco tarjetas y enlaces de salto HTML. Móvil continúa en desarrollo hasta 900px.
