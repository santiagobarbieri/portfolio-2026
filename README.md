# Santiago Barbieri — Portfolio

La versión actual vive en `index.html`: carrusel continuo de proyectos en perspectiva, navegación y fichas dentro de la misma página. Parte de la prueba de movimiento aprobada y conserva sus aperturas, cierres, cursor y loaders.

## Publicación

- Repositorio: https://github.com/santiagobarbieri/portfolio-2026
- Web: https://portfolio-2026-ruby-three-66.vercel.app
- Vercel publica la rama `main`. Ejecuta `node build.mjs` y sirve únicamente `dist/`.
- No hay dependencias npm, servidor propio ni instalación. El build copia solamente `index.html`, `assets/` y `css/`.

El símbolo del encabezado se transforma en un corredor al pasar el puntero o recibir foco de teclado. Conserva su tamaño de 17px y toma el color de la sección o proyecto abierto; sobre la portada usa un contorno de contraste. Al salir completa la zancada y vuelve al logo. No mantiene animaciones en segundo plano, durante transiciones, detrás del visor o del menú móvil; con movimiento reducido muestra una pose estática.

Las cargas usan el logo corriendo con los mismos diez fotogramas originales del hover. El inicio espera las portadas antes de revelarse; imágenes, visor y formulario reutilizan indicadores pequeños. Comparten un ciclo de animación, se pausan fuera de vista o con la pestaña oculta y respetan movimiento reducido. El loader Rose y su máscara dejan de utilizarse.

## Lectura de proyectos

Las fichas usan dos columnas centrales alternadas en computadora y una en móvil, con imagen/grilla y texto debajo. El scroll es finito y tiene un cierre; el carrusel del inicio mantiene su loop. La rueda tiene suavizado acotado, mientras touch, teclado y movimiento reducido conservan scroll nativo. `css/project-reader.css` contiene la distribución del lector.

La apertura acerca el logo, adopta el color del proyecto y revela la ficha blanca. OLAS y El Armado conservan sus proporciones y el cierre mantiene la tinta visible. No se reutilizan archivos del respaldo VERSION 1 en el sitio publicado.

## Estado del contenido

Cinco proyectos: Apolo Studios, Orfeo, OLAS Di Tella, Club de Economía — UTDT y El Armado. El Archivo conserva 84 afiches, tapas y fotografías personales y permanece bloqueado con candado. Sobre mí presenta Testamento y Credenciales con datos confirmados; el retrato original y el texto definitivo siguen pendientes. Contacto valida y permite revisar la consulta; su transporte de envío está implementado pero falta configurar el destino real. Tienda y URLs aún no definidas siguen indicadas como pendientes. La versión móvil está activa y conserva la perspectiva del escritorio.

Las portadas están preparadas antes de revelar el inicio. Las imágenes interiores se cargan bajo demanda, conservan sus dimensiones y ofrecen reintento si fallan. El visor amplía cada pieza sin descargas de clientes. Los videos se reproducen mudos, en loop y sin controles; se pausan fuera de vista, detrás del visor o con la pestaña oculta.

## Estructura actual

- `index.html`: interfaz, catálogo y lógica de la versión actual.
- `assets/`: únicamente recursos referenciados por esta versión, más su licencia tipográfica.
- `css/shell.css`: escala de escritorio, firma y navegación delineadas e índice de proyectos.
- `css/mobile.css`: carrusel táctil, menú negro de filas completas, selectores inferiores, lectura y visor.
- `assets/scripts/logo-runner.js` y `css/logo-runner.css`: efecto del logo con los diez fotogramas SVG aportados.
- `css/editorial-update.css`: índice ampliado, previews, estilos del Archivo conservado y formulario guiado.
- `build.mjs`: empaquetado estático para Vercel.
- `vercel.json`: build y compatibilidad con direcciones anteriores.
- `AGENTS.md` y `MAKE-PROJECT.md`: criterios e historial de decisiones.
- `VERSION 1 - PORTFOLIO`: Santiago trasladó este respaldo fuera de la carpeta del proyecto. La web actual no lo utiliza; la revisión local AUDIT permanece allí. El respaldo anterior también se conserva en el historial de Git, en el commit `2893a3e`.

## Vista local

Abrí `index.html` directamente, o ejecutá `python3 preview.command` para servirlo en http://127.0.0.1:4173/. Para revisar exactamente el contenido del deploy:

```sh
node build.mjs
python3 -m http.server 4173 --directory dist
```

No se requiere compilar CSS ni instalar paquetes. Las direcciones anteriores de los proyectos, Sobre mí, Contacto y Archivo se redirigen a la versión actual en Vercel. Los casos también se pueden abrir con `index.html?project=el-armado`; Archivo está temporalmente bloqueado: sus enlaces antiguos vuelven a Proyectos.

## Interfaz según referencias de índice y teléfono

La firma blanca sobre negro, el índice Proyectos y las tiras de navegación comparten bordes finos. En escritorio, la escala crece de 14px a 16px entre 1440 y 1920px y también aumenta el ancho de sus controles. En teléfono, el menú reúne filas completas sobre negro y los desplegables empujan el contenido. El selector inferior permite recorrer tarjetas y abrir la elegida; la selección táctil muestra su descripción sin mover el escenario.

Sobre mí dispone título superior, texto y retrato pendiente en dos columnas, con selector Testamento/Credenciales al pie. Archivo continúa con candado por confirmación del usuario. Los cinco casos, las portadas y la cámara conservan su funcionamiento. Se revisan tamaños de 320 a 2560px con Chrome; la comprobación en dispositivos físicos sigue pendiente.

## Vista previa táctil de Proyectos

El primer toque sobre una tarjeta activa el mismo desplazamiento del hover y alterna imágenes reales del proyecto. La ficha compacta muestra título, descripción, año y ABRIR. El segundo toque sobre la tarjeta o ABRIR entra al caso. Tocar otra cambia la selección; los arrastres y gestos cancelados nunca abren. El loop continúa y limpia la selección al salir de pantalla. Club mantiene solo su portada y touch permanece silencioso.

La selección no se guarda entre vistas. Las respuestas de imágenes tardías se invalidan al cambiar de tarjeta o salir. ABRIR no puede cambiar de destino durante una pulsación sostenida. Se verificaron gestos táctiles, cambio de tarjeta, Club, espacio de ficha en teléfono/tablet/horizontal y regresión del hover de escritorio.

## Móvil y navegación — 23 de noviembre de 2026

La versión móvil conserva el mismo carrusel infinito en profundidad del escritorio: planos paralelos, cámara y separación aprobadas, con escala y arrastre adaptados al espacio disponible. El índice y los enlaces viven en un menú de tres barras con foco contenido, Escape y cierre táctil. Las ventanas angostas de computadora mantienen sus controles y columnas editoriales. El diseño compacto se activa a 600px o hasta 900px con puntero táctil sin hover. Los proyectos conservan flechas laterales al medio y encabezado transparente, con espacio lateral para no cubrir la lectura; no hay franja inferior de color. El visor respeta la resolución nativa; los videos también se reproducen automáticamente en móvil, mudos y sin controles.

Sobre mí vuelve al diseño previo al último cambio, con Testamento y Credenciales. Se retira Gustos y sus enlaces antiguos vuelven a Testamento. El retrato sigue pendiente. Archivo muestra un candado y queda cerrado, también por sus rutas anteriores; se conservan datos y piezas para reactivarlo.

La auditoría de navegador verifica nueve composiciones, incluidas ventanas de computadora de 720/870px, teléfono y tablet, orientación horizontal, gestos táctiles, los cinco proyectos, visor, videos, apertura y cierre, carga directa, historial y navegación con teclado. Se comprueba que no haya desborde horizontal y que el escritorio conserve su cámara. Las pruebas táctiles se ejecutan mediante emulación de Chrome; falta una revisión en dispositivos iOS y Android físicos.

Las aperturas pintan primero el color de la portada, después suben la pieza y, al asentarse, revelan texto y contenido. Esta secuencia también funciona al cambiar de proyecto y por enlace directo. El Armado y OLAS usan logos transparentes originales sobre fondos independientes; los otros tres casos conservan sus portadas completas hasta contar con variantes transparentes que contrasten con sus fondos.

Los cierres retiran el contenido en su posición de lectura y recuperan el color del proyecto antes de revelar el carrusel. El logo visible se desvanece con un desplazamiento de 24px; durante la lectura no se vuelve a la apertura. Se verificaron los cinco casos, Escape durante la transición, cambios de tamaño, foco y movimiento reducido. El logo de OLAS tiene un ancho máximo de 420px en su apertura.

| Área | Resultado de la revisión | Contenido pendiente |
| --- | --- | --- |
| Apolo Studios | Cuatro drops y video existentes cargan; conserva las campañas confirmadas. | Logo transparente que contraste sobre azul. |
| Orfeo | Fotos, marcas y ampliaciones se decodifican sin rutas históricas. | Logotipo completo sin fondo para la apertura. |
| OLAS | Afiches, stickers, vectores y logo transparente cargan. | Revisión editorial de textos y selección, cuando se retome el caso. |
| Club de Economía | Símbolos, plantillas y video cargan; portada única en el inicio. | Variante completa del logo sin fondo con contraste sobre celeste. |
| El Armado | Afiches, historia, ilustración y logo hueso cargan. | Revisión editorial de textos, cuando se retome el caso. |
| Sobre mí | Presentación anterior restaurada; Testamento y Credenciales con teclado e historial. | Retrato original y texto definitivo. |
| Contacto | Validación, revisión, envío asíncrono, error, reintento y confirmación probados con un endpoint local. | Correo de destino y endpoint del proveedor real. |
| Tienda y Redes | Los destinos ausentes indican que están en preparación. | URLs definitivas de tienda y perfiles. |
| Móvil | Carrusel táctil, menú y cinco proyectos adaptados; videos y visor activos. | Revisión en teléfonos físicos. |

No se extrajeron logos de capturas ni se quitaron fondos automáticamente. No se modifican originales del respaldo externo. Los grupos fotográficos de tres piezas conservan su selección actual; su edición visual se puede revisar por proyecto.

## Nuevas interacciones — 22 de noviembre de 2026

Las tarjetas conservan cámara y geometría. Después de 650ms de hover muestran dos o tres piezas decodificadas, alternadas cada 1700ms con la portada, sin fondos auxiliares ni recortes. Club conserva únicamente su portada. Las piezas se solicitan al interactuar, no en la carga inicial; se descartan respuestas obsoletas y se cancela el preview al navegar. Movimiento reducido conserva una sola imagen de preview. El índice delineado señala el caso actual; disciplina y año permanecen en las etiquetas accesibles y en la ficha de preview.

Cinco perfiles breves de ruido filtrado distinguen tela, papel y una señal digital. Se generan localmente y solo suenan ante un hover real tras desbloquear el audio con un gesto; scroll y avance automático continúan silenciosos.

Archivo ofrece una entrada mixta de 84 piezas (67 afiches, 11 tapas y 6 fotos), búsqueda, filtros y densidades 2/4/6. El filtro de fotos conserva tres columnas. La distribución calcula las alturas completas de imagen y caption, con pequeños desfases y sin superposiciones. Se probaron 920, 1024, 1512 y 1920px. No se añadieron archivos originales ni obras ajenas.

### Configurar el envío de Contacto

El objeto `contactSettings` de `index.html` contiene `endpoint` y `email`, ambos vacíos hasta que Santiago indique el destino. No hay un proveedor ni variables de correo configurados en Vercel. Un endpoint público de formulario debe aceptar POST FormData y devolver JSON con `ok: true` o `success: true` tras confirmar la recepción. No poner claves privadas en el HTML. El formulario tiene espera máxima, bloqueo de doble envío, reintento con datos conservados y cancelación al salir. Una respuesta no confirmada nunca muestra éxito.

Con endpoint vacío el envío sigue deshabilitado y permanece disponible Copiar resumen. Si solo se configura email, se ofrece Abrir en mi correo y se explica que el envío se completa en la aplicación de correo. Las pruebas de éxito y fallo se realizaron contra un servidor local aislado, sin enviar correos reales. La conexión final sigue pendiente de la respuesta de Santiago.
