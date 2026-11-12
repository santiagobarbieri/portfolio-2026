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

- **Ediciones**: nombre propuesto para trabajos breves autoiniciados; Shelf 001 - Stephen King abre en un estante de libros. Las futuras series se presentan en su medio, cuando existan sus recursos.
- **Proyectos**: Orfeo, OLAS y El Armado; trabajos para terceros, con su disciplina de identidad visual.
- **Colecciones**: Fotos en Zapallar; grilla fotográfica y carrusel.

En Shelf, un toque sobre cualquier libro abre una ficha breve con paleta, nota de la tapa, técnica y sinopsis con fuente. El estante permanece estable. La rueda/trackpad y el arrastre del fondo recorren los libros con ajuste de posición; el libro central se puede girar por arrastre o con el control de rotación. El índice permite elegir una tapa. Se recuerdan selección, posición, orientación y variante durante la sesión. Los lomos y contratapas son soportes neutros hasta recibir originales diseñados.
