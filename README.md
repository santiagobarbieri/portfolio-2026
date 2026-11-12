# Santiago Barbieri — Portfolio

El único home es `index.html`: Archivo, con proyectos intercalados en dos columnas y loop continuo. About es un recorrido independiente en construcción. El lateral separa filtros, About/Contact/Shop y Socials/Tools. Contact abre otra pestaña; Shop abrirá Gumroad cuando exista su URL. `nav.html` redirige al home y `project.html?p=<slug>` muestra cada proyecto. Shop y el retrato de About están pendientes de contenido. El logo vuelve al Archivo.

## Publicación

- Sitio: https://portfolio-2026-ruby-three-66.vercel.app
- GitHub (privado): https://github.com/santiagobarbieri/portfolio-2026
- Proyecto de Vercel: `portfolio-2026`. La rama `main` está conectada para publicar automáticamente cada push.

Vercel sirve HTML, CSS, JavaScript y JSON directamente: no hay instalación ni compilación. `.vercelignore` excluye notas internas, el prototipo local BOOKS y el video fuente pendiente de convertir. Los originales de las piezas publicadas se conservan para sus descargas.

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

El Archivo contiene cinco proyectos con imágenes. Contact guía el brief en cinco pasos y permite copiarlo o descargarlo. El envío sigue pendiente de configurar; no se simula un envío exitoso.


## Presentación de proyectos

- **Shelf 001 - Stephen King** abre un estante a pantalla completa basado en BOOKS: diez libros con rotación por arrastre, navegación por flechas y ficha individual con paleta, lectura visual y variantes. El carrusel y las descargas conservan el banco curado. El soporte incorpora respuesta amortiguada al arrastre, selección en profundidad, superficie de apoyo y materiales discretos; deja de animarse al reposar y respeta movimiento reducido. Los diez volúmenes varían su altura y grosor con referencias de ediciones identificadas por ISBN. El ancho sigue la proporción de cada tapa para cubrir el frente completo, sin márgenes ni deformaciones; la ficha muestra páginas y formato, y los datos editoriales completos permanecen documentados. Referencias y conversiones en [shelf-editions.md](./shelf-editions.md). OLAS y El Armado presentan afiches sobre papel. Los índices mantienen cinco columnas; las fichas se despliegan bajo demanda.
- Las maquetas usan CSS, imágenes propias y controles nativos. Sin dependencias nuevas, rotación automática ni textos inventados del prototipo BOOKS.

El trabajo actual se concentra en refinar los cinco proyectos existentes.

## Categorías del Archivo

- **Books**: biblioteca propia en books.html; Shelf 001 - Stephen King mantiene el estante de tapas. El enlace anterior sigue funcionando.
- **Posters**: afiches personales en una vista simple, aún sin piezas.
- **Self Made**: archivo personal visual, claro e infinito, con libros y fotografías autorizados.
- **Proyectos**: Orfeo, OLAS y El Armado; trabajos para terceros, con su disciplina de identidad visual.
- **Colecciones**: Fotos en Zapallar; grilla fotográfica y carrusel.

En Shelf, un toque sobre cualquier libro abre una ficha breve con paleta, nota de la tapa, técnica y sinopsis con fuente. El estante permanece estable. La rueda/trackpad y el arrastre del fondo recorren los libros con ajuste de posición; el libro central se puede girar por arrastre o con el control de rotación. El índice permite elegir una tapa. Se recuerdan selección, posición, orientación y variante durante la sesión. Los lomos y contratapas son soportes neutros hasta recibir originales diseñados.

## Self Made y carga de imágenes

`self-made.html` sigue la referencia con siete columnas en desktop, fondo claro, números y logo pequeño. `posters.html` usa la misma base para futuros afiches personales, sin incluir piezas para terceros. Books tiene su propia página.

El catálogo `data/personal-work.json` contiene 17 originales únicos autorizados: 11 tapas/variantes y 6 fotos de Zapallar. Las 17 miniaturas nuevas de 400px pesan juntas unos 413 KiB. Los originales se conservaron intactos. La vista asigna las URLs solo cerca del viewport y recicla las filas. El visor también materializa solo imágenes cercanas, con el catálogo completo disponible por rueda/flechas/touch y descarga original por imagen.

Validación local con 200 entradas simuladas, viewport 1512×982, CPU a 4× y red de 500.000 bytes/s con 80ms de latencia: 35 miniaturas del grid solicitadas al inicio, 105 celdas constantes y 4 imágenes materializadas al abrir el visor; primer contenido visible y preparado a los 3,63s. Estas cifras describen esa prueba y sus condiciones. Los fixtures no se publican.
