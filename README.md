# Santiago Barbieri — Portfolio

## Cargas sin espera artificial · 24 de noviembre de 2026

Santiago pidió reducir la demora del loader: se elimina el mínimo fijo de cinco segundos. La capa se cierra al decodificar los recursos necesarios, con un barrido breve de 240 ms. El inicio espera únicamente portadas; una entrada directa espera solo los recursos de esa sección o proyecto. Los logos transparentes se preparan al abrir su caso. Conservar errores, reintentos, cancelación y preparación detrás de la capa opaca, sin mostrar contenido por defecto. Este criterio reemplaza las esperas mínimas anteriores. Los seis logos de apertura usan PNG transparentes, en proporción nativa y con encaje contain sin recortes. Orfeo abre sobre gris claro para que su marca negra sea visible; las portadas del inicio no cambian.

## Loop V21 con foco · 24 de noviembre de 2026

El inicio adopta el modelo «Loop de tarjetas - Scroll focus V21.html»: una pila diagonal continua, foco frontal, navegación por pasos y rueda con detección de gestos, indicador circular por vuelta y contador de seis proyectos. El índice centra y enfoca el elegido; el centro del indicador permite entrar o salir de foco. Las flechas recorren las tarjetas y Escape cierra el foco. Portada y Abrir proyecto entran a la misma ficha, en la pestaña actual. `assets/scripts/focus-loop.js` conserva la geometría y máquina de estados del modelo; `css/focus-loop.css` adapta sus controles a la identidad existente. Suspender el motor detrás de secciones, cargas, menú, visor y pestaña oculta; respetar movimiento reducido.

Las seis portadas nuevas vienen de la carpeta subida en dist/assets/Project Cover. Los PNG originales se preservan ahora en assets/Project Cover, ignorados por Git y excluidos del build; sus derivados públicos viven en assets/images/project-covers. No guardar originales únicamente dentro de dist, porque se regenera. No deformar ni recortar las portadas: conservar su relación 2015:1350. La apertura actual muestra primero el color y luego el logo original, antes del recorrido finito. Esta secuencia reemplaza la aparición simultánea anterior, manteniendo el loader corredor de unos cinco segundos, lector y navegación vigentes.

La versión actual vive en `index.html`: carrusel continuo de proyectos en perspectiva, navegación y fichas dentro de la misma página. Conserva la cámara aprobada, las aperturas y cierres, el cursor contextual y el logo corredor original.

## Publicación

- Repositorio: https://github.com/santiagobarbieri/portfolio-2026
- Web: https://portfolio-2026-ruby-three-66.vercel.app
- Vercel publica `main`, ejecuta `node build.mjs` y sirve únicamente `dist/`.
- No hay dependencias npm, instalación ni servidor propio.

## Proyectos

Seis casos: Apolo Studios, Orfeo, OLAS Di Tella, Club de Economía — UTDT, El Armado y Wildfolk. Cada ficha tiene dos columnas centrales alternadas en computadora y una en móvil, con imagen o grilla y texto debajo. El recorrido termina; el carrusel del inicio mantiene su loop. La rueda se suaviza con límites y un desfase mínimo; touch, teclado y movimiento reducido conservan scroll nativo.

Wildfolk es un proyecto personal para una marca ficticia de cerveza artesanal. Su recorrido reúne cuatro latas, cuatro afiches, firma e isotipo, seis personajes, paleta y mockups. Los afiches usan las exportaciones de 2480 × 3508 px encontradas en Escritorio. Las imágenes se publican como derivados WebP y se amplían con su variante de mayor resolución, sin superar su tamaño nativo. No se modifican los originales.

Los lectores presentan logos transparentes en negro, sin el fondo de la portada. Apolo, Orfeo y Club usan variantes originales copiadas a `assets/images/project-marks/`; OLAS, El Armado y Wildfolk conservan sus propios originales transparentes. No se extraen marcas de capturas. La portada completa del inicio y la marca del lector son recursos independientes.

## Cargas, aperturas y cierres

Al entrar a una sección principal o proyecto, una capa del color correspondiente muestra el logo corriendo durante al menos cinco segundos y espera la decodificación de sus recursos críticos. El contenido se prepara detrás. Un barrido del corredor revela la vista; el proyecto aparece con fondo y logo al mismo tiempo, acerca la pieza y abre el lector blanco. Redimensionar, cancelar, volver por historial y reintentar una carga fallida conservan un estado limpio. Movimiento reducido omite el barrido y el zoom.

Las imágenes interiores se cargan bajo demanda, con indicadores pequeños y reintento. El visor amplía una pieza por vez y no ofrece descargas de clientes. Los videos se reproducen mudos, en loop y sin controles; se pausan fuera de vista, detrás del visor, durante la carga de una sección o con la pestaña oculta.

El cierre retira el contenido en su posición de lectura y recupera el color del proyecto antes de revelar el carrusel. Si el logo quedó fuera de pantalla, no vuelve a traerlo. El regreso conserva la tarjeta elegida y libera capas, foco y controles.

## Navegación e interacción

Solo aparece un símbolo de Santiago, junto a su nombre. Hover y foco lo transforman en el corredor con los diez fotogramas SVG aportados, sin modificar sus trazados. Los indicadores comparten scheduler, se detienen fuera de vista o con la pestaña oculta y respetan movimiento reducido.

Las tiras de navegación usan borde negro fino. Sobre mí colorea de verde todo el bloque de firma, incluido el símbolo. Los desplegables son exclusivos y animan entrada y salida; la lista de Proyectos permanece siempre visible. Cursor y etiqueta de acción son blancos y negros.

Sobre mí conserva Testamento y Credenciales, sin Gustos. Se puede cambiar por botones, teclado o desplazamiento vertical; cuando el contenido desborda, primero permite leerlo. Estos cambios internos no disparan otro loader de cinco segundos. Se conserva el historial real, los dos certificados y el estado pendiente del retrato y texto definitivo.

Después de 650 ms de hover, las tarjetas alternan dos o tres piezas reales decodificadas con su portada. Wildfolk muestra latas, afiches y personajes; Club conserva únicamente su portada. El sonido es local y solo se produce ante hover de un puntero fino, tras desbloquear el audio con un gesto. Scroll y avance automático son silenciosos.

En teléfono, el primer toque selecciona y desplaza la tarjeta con su preview y ficha; el segundo toque o ABRIR entra al proyecto. Arrastrar o cancelar nunca abre. La vista compacta se activa a 600 px, o hasta 900 px con puntero táctil sin hover; una ventana angosta de computadora conserva sus controles y dos columnas. El menú tiene foco contenido y cierre con Escape.

## Contenido pendiente

Archivo conserva 84 afiches, tapas y fotografías personales y continúa bloqueado con candado, incluidas sus rutas antiguas. Tienda y perfiles sin URL permanecen pendientes. El retrato y el texto final de Sobre mí todavía deben ser aportados por Santiago.

Contacto valida y permite revisar la consulta, pero `contactSettings.endpoint` y `contactSettings.email` siguen vacíos. El envío permanece deshabilitado hasta configurar un destino real; no se simula éxito. Las pruebas de transporte se hacen con un endpoint local aislado, sin correos reales ni claves privadas en el HTML.

## Estructura y vista local

- `index.html`: interfaz, catálogo y lógica vigente.
- `css/shell.css` y `css/mobile.css`: navegación y adaptación responsive.
- `css/project-reader.css`: lectura finita de proyectos.
- `css/section-load.css`: capa de carga de sección y estados de error.
- `css/editorial-update.css`: previews, Archivo conservado y formulario.
- `assets/scripts/logo-runner.js` y `css/logo-runner.css`: logo corredor original.
- `assets/images/wildfolk-web/`: derivados públicos de Wildfolk.
- `assets/images/project-marks/`: tres marcas transparentes originales.
- `build.mjs` y `vercel.json`: empaquetado estático y rutas anteriores.
- `AGENTS.md` y `MAKE-PROJECT.md`: criterios e historial de decisiones, con la dirección vigente primero.

`assets/images/wildfolk/` conserva localmente las subidas originales, ignoradas por Git y excluidas de `dist/`. El respaldo VERSION 1 fue trasladado fuera del repositorio y no es una dependencia de la web. Su historial sigue en Git en el commit `2893a3e`.

Abrí `index.html` directamente o serví el build:

```sh
node build.mjs
python3 -m http.server 4173 --directory dist
```

No hace falta instalar paquetes ni compilar CSS. Los casos pueden abrirse con `index.html?project=wildfolk`; Vercel también conserva las direcciones anteriores.

## Verificación

Se revisan los seis casos, logos, loaders, cancelación temprana con red lenta, error/reintento, historial, menús exclusivos, navegación de Sobre mí y composición de escritorio/móvil en Chrome. Se comprueba que no haya errores JavaScript, recursos faltantes ni desbordes horizontales. La comprobación táctil usa emulación; queda pendiente una revisión en dispositivos físicos iOS y Android.
