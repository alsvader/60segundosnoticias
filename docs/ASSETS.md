# 60 Segundos — Visual Asset Pack

Este directorio contiene los assets visuales mínimos necesarios para iniciar la implementación del proyecto junto con `docs/60-segundos-spec.md`.

## Assets de producción

### `public/branding/logo.svg`
Logo principal de **60 Segundos Noticias**. Usar como identidad principal en Header/Footer cuando la composición lo permita.

**Nota técnica:** el archivo es actualmente un SVG autocontenido que incrusta la versión PNG aprobada para conservar exactamente su apariencia. Esto evita pérdida o reinterpretación del logo, pero no es una vectorización real por paths. Puede reemplazarse posteriormente por un SVG vectorial maestro manteniendo el mismo nombre de archivo y sin cambiar componentes.

### `public/branding/logo-mark.svg`
Isotipo/marca reducida “60”. Uso recomendado: mobile header, favicon derivado, estados vacíos/404 y recursos de marca.

**Nota técnica:** al igual que el logo principal, conserva de forma exacta el PNG aprobado dentro de un contenedor SVG. Puede sustituirse posteriormente por un SVG vectorial maestro.

### `public/textures/paper-grain.webp`
Textura base de papel, 2048×2048. Debe utilizarse de manera muy sutil sobre `#F7F3EC`. No debe reducir la legibilidad.

### `public/textures/newspaper-pattern.webp`
Patrón editorial de periódico, 2048×2048. Uso recomendado en Hero y zonas decorativas, normalmente con una opacidad visual aproximada de 3–7%.

## Referencias — no usar como contenido público

### `docs/references/home-reference.jpeg`
North Star visual del proyecto. Es una referencia de composición, jerarquía y estilo; no debe renderizarse como background final de la Home.

### `docs/references/branding/logo-original.jpg`
Logo JPG originalmente proporcionado. Se conserva únicamente como referencia.

### `docs/references/branding/logo-source.png`
Fuente raster aprobada utilizada para `public/branding/logo.svg`.

### `docs/references/branding/logo-mark-source.png`
Fuente raster aprobada utilizada para `public/branding/logo-mark.svg`.

## Reglas para el agente de código

- No rediseñar los logos sin aprobación explícita.
- No generar nuevos logos mediante CSS o texto.
- No usar `home-reference.jpeg` como imagen de producción.
- No inventar texturas alternativas si las incluidas satisfacen el diseño.
- Las fotografías de noticias pertenecen a Payload Media / Object Storage, no a `public/`.
- Los iconos de interfaz deben provenir de Lucide y los primitivos de shadcn/UI según el Master Spec.
- Si en el futuro se entrega un SVG vectorial maestro real, reemplazar `logo.svg`/`logo-mark.svg` conservando sus rutas públicas.
