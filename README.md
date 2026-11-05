# Santiago Barbieri — Portfolio

El único home es `index.html`: Archivo, con proyectos intercalados en dos columnas y loop continuo. `nav.html`, `about.html` y `contact.html` son pantallas independientes; `project.html?p=<slug>` muestra cada proyecto.

## Publicación

- Sitio: https://portfolio-2026-ruby-three-66.vercel.app
- GitHub (privado): https://github.com/santiagobarbieri/portfolio-2026
- Proyecto de Vercel: `portfolio-2026`. La rama `main` está conectada para publicar automáticamente cada push.

Vercel sirve HTML, CSS, JavaScript y JSON directamente: no hay instalación ni compilación. `.vercelignore` excluye las notas internas, el video fuente pendiente de convertir y los originales que ya tienen versiones WebP en uso. Los originales se conservan en el repositorio.

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

El Archivo contiene cinco proyectos con imágenes. El envío de Contact sigue pendiente de configurar; no se simula un envío exitoso.
