# Santiago Barbieri — Portafolio

El único home es `index.html`: Archivo, con proyectos intercalados en dos columnas y loop continuo. Sobre mí es un recorrido independiente en construcción. El lateral separa filtros, Sobre mí/Contacto/Tienda y Redes/Herramientas. Contacto abre otra pestaña; Tienda abrirá Gumroad cuando exista su URL. `nav.html` redirige al home y `project.html?p=<slug>` muestra cada proyecto. Tienda y el retrato de Sobre mí están pendientes de contenido. El logo vuelve al Archivo.

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

El archivo abre cada proyecto en otra pestaña. El Armado es el primer sitio autónomo (`el-armado.html`): usa su paleta, sus ilustraciones y una composición propia. Su ficha genérica anterior redirige al piloto. Club de Economía replica ese recorrido en `club-de-economia.html`. OLAS y Orfeo conservan sus presentaciones actuales. Los destinos personales se llaman **Librería** y **Exploraciones**, con rutas conservadas.

El piloto incluye contenido HTML accesible sin JavaScript, navegación por secciones, alternancia color/trazo, visor de seis piezas y descargas originales. Las pruebas pequeñas de afiches no integran el visor. Los nuevos WebP son derivados; los originales no se modificaron.


### El Armado · modelo de Figma

La página reconstruye la ficha por scroll: marca fija al costado izquierdo, encabezado descriptivo, secciones que se acumulan, grilla de afiches uniforme y vista completa al final. En pantallas compactas el recorrido es vertical y las secciones se apilan como solapas. El contador indica sección actual y total. Con movimiento reducido se muestra la lectura normal.

Anybody está autoalojada como WOFF2 variable, con peso 900, ancho 53.5, estilo normal y tamaño de referencia 57px. Fuente y licencia oficial: https://github.com/google/fonts/tree/main/ofl/anybody. No se incorpora Druk. Los proyectos para terceros usan zoom individual con tamaño limitado a la resolución real, sin controles de descarga. Librería y Exploraciones mantienen sus visores personales. Las variantes de afiches de El Armado quedan pendientes de las exportaciones mayores de Santi.

### Club de Economía · ficha acumulativa

`club-de-economia.html` replica el recorrido de El Armado con seis etapas: presentación, paleta, síntesis, sistema de marca, plantillas para redes y trama. La marca queda fija en la columna izquierda; el scroll reúne reversiblemente la ficha en escritorio y apila solapas en móvil. Las plantillas conservan sus datos de ejemplo. La portada del Archivo sigue siendo VARIANTE.png y la ruta genérica anterior redirige a la nueva página. Se conservan los originales, las exclusiones del visor, el zoom individual sin descarga, Rose y la lectura sin JavaScript o con movimiento reducido.

Anybody es la fuente común de títulos, autoalojada y centralizada en `css/typography.css`, con peso 900 y ancho 53.5. Albert Sans queda en textos, navegación y datos. Los títulos pequeños se ajustan a una escala legible sin modificar las piezas originales.
