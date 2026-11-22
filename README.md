# Santiago Barbieri — Portfolio

La versión actual vive en `index.html`: carrusel continuo de proyectos en perspectiva, navegación y fichas dentro de la misma página. Parte de la prueba de movimiento aprobada y conserva sus aperturas, cierres, cursor y loaders.

## Publicación

- Repositorio: https://github.com/santiagobarbieri/portfolio-2026
- Web: https://portfolio-2026-ruby-three-66.vercel.app
- Vercel publica la rama `main`. Ejecuta `node build.mjs` y sirve únicamente `dist/`.
- No hay dependencias npm, servidor propio ni instalación. El build copia solamente `index.html`, `assets/` y `css/`.

## Estado del contenido

Cinco proyectos: Apolo Studios, Orfeo, OLAS Di Tella, Club de Economía — UTDT y El Armado. El Archivo reúne los afiches y fotografías personales existentes. Sobre mí conserva el retrato pendiente y textos en edición; Contacto prepara un resumen sin enviarlo ni guardar datos. Tienda y URLs aún no definidas siguen indicadas como pendientes. Móvil muestra un aviso de desarrollo hasta 900 px.

Las portadas están preparadas antes de revelar el inicio. Las imágenes interiores se cargan bajo demanda, conservan sus dimensiones y ofrecen reintento si fallan. El visor amplía cada pieza sin descargas de clientes. Los videos se reproducen mudos, en loop y sin controles; se pausan fuera de vista, detrás del visor o con la pestaña oculta.

## Estructura actual

- `index.html`: interfaz, catálogo y lógica de la versión actual.
- `assets/`: únicamente recursos referenciados por esta versión, más su licencia tipográfica.
- `css/desktop-gate.css`: aviso temporal de móvil en desarrollo.
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

No se requiere compilar CSS ni instalar paquetes. Las direcciones anteriores de los proyectos, Sobre mí, Contacto y Archivo se redirigen a la versión actual en Vercel. Los casos también se pueden abrir con `index.html?project=el-armado`; la vista personal usa `?view=posters` o `?view=photos`.

## Auditoría y navegación — 22 de noviembre de 2026

Se verificó el sitio con el respaldo histórico fuera del repositorio: no hay dependencias activas faltantes. La auditoría de navegador cubre los cinco proyectos, Archivo, Contacto, las tres vistas de Sobre mí, carga inicial, errores y reintentos, visor, reproducción de videos, foco, teclado y URL directa. Se revisaron composiciones de escritorio de 920, 1024, 1280, 1512 y 1920 px; las pantallas hasta 900 px conservan el aviso móvil. Las 239 rutas de imágenes del catálogo se decodifican correctamente.

Se corrigieron Atrás/Adelante, restauración de lectura y pestañas de Sobre mí, títulos del documento y etiquetas accesibles de la navegación. Escape cierra primero el desplegable enfocado. Sobre mí tiene texto más legible, credenciales separadas y datos organizados sin inventar biografía o retrato.

Las aperturas pintan primero el color de la portada, después suben la pieza y, al asentarse, revelan texto y contenido. Esta secuencia también funciona al cambiar de proyecto y por enlace directo. El Armado y OLAS usan logos transparentes originales sobre fondos independientes; los otros tres casos conservan sus portadas completas hasta contar con variantes transparentes que contrasten con sus fondos.

| Área | Resultado de la revisión | Contenido pendiente |
| --- | --- | --- |
| Apolo Studios | Cuatro drops y video existentes cargan; conserva las campañas confirmadas. | Logo transparente que contraste sobre azul. |
| Orfeo | Fotos, marcas y ampliaciones se decodifican sin rutas históricas. | Logotipo completo sin fondo para la apertura. |
| OLAS | Afiches, stickers, vectores y logo transparente cargan. | Revisión editorial de textos y selección, cuando se retome el caso. |
| Club de Economía | Símbolos, plantillas y video cargan; portada única en el inicio. | Variante completa del logo sin fondo con contraste sobre celeste. |
| El Armado | Afiches, historia, ilustración y logo hueso cargan. | Revisión editorial de textos, cuando se retome el caso. |
| Sobre mí | Tres pestañas con teclado, URL y composición de escritorio. | Retrato original y biografía definitiva. |
| Contacto | Valida el formulario y prepara un resumen honesto. | Conectar el envío real. |
| Tienda y Redes | Los destinos ausentes indican que están en preparación. | URLs definitivas de tienda y perfiles. |
| Móvil | Aviso de desarrollo, sin reproducir el recorrido oculto. | Diseño y desarrollo específicos, aún pausados. |

No se extrajeron logos de capturas ni se quitaron fondos automáticamente. No se modifican originales del respaldo externo. Los grupos fotográficos de tres piezas conservan su selección actual; su edición visual se puede revisar por proyecto.
