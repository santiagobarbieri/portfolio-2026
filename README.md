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
- `VERSION 1 - PORTFOLIO/`: web anterior, módulos retirados, fuentes y recursos sin uso actual. El inventario conserva rutas y SHA-256; no se eliminan originales. La antigua colección `AUDIT/` continúa excluida de Git, dentro de esta carpeta.

## Vista local

Abrí `index.html` directamente, o ejecutá `python3 preview.command` para servirlo en http://127.0.0.1:4173/. Para revisar exactamente el contenido del deploy:

```sh
node build.mjs
python3 -m http.server 4173 --directory dist
```

No se requiere compilar CSS ni instalar paquetes. Las direcciones anteriores de los proyectos, Sobre mí, Contacto y Archivo se redirigen a la versión actual en Vercel. Los casos también se pueden abrir con `index.html?project=el-armado`; la vista personal usa `?view=posters` o `?view=photos`.
