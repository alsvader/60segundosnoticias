## Purpose

Garantiza que el panel de administración del CMS se muestre por completo en español para los editores y administradores de 60 Segundos Noticias. Esto aplica a la interfaz base y a los nombres de colecciones, globals, bloques, campos y opciones, sin alterar identificadores persistidos ni contratos de API.

## ADDED Requirements

### Requirement: Idioma único del admin en español
La interfaz base del admin (login, navegación, acciones, estados de borrador y publicación, mensajes de validación y notificaciones) SHALL mostrarse en español. El español SHALL ser el único idioma disponible del admin y el idioma de respaldo. El admin SHALL NOT ofrecer un selector de idioma.

#### Scenario: Navegador configurado en inglés
- **WHEN** un usuario abre `/admin/login` desde un navegador cuyo `Accept-Language` es `en-US`
- **THEN** el formulario de login se muestra en español: el campo "Correo electrónico", el campo "Contraseña" y el botón "Iniciar sesión"

#### Scenario: Navegador configurado en es-MX
- **WHEN** un usuario abre el admin desde un navegador cuyo `Accept-Language` es `es-MX`
- **THEN** la interfaz se muestra en español

#### Scenario: Sin selector de idioma
- **WHEN** un usuario autenticado abre su cuenta en el admin
- **THEN** no aparece ninguna opción para cambiar el idioma de la interfaz

### Requirement: Nombres en español para colecciones y globals
Cada colección y cada global que aparece en el admin SHALL declarar un nombre en español: singular y plural para colecciones, y un nombre para globals. Esto incluye la colección de índice de búsqueda. El admin SHALL mostrar esos nombres en la navegación, los encabezados, los breadcrumbs y las acciones ("Crear nueva …").

#### Scenario: Navegación lateral
- **WHEN** un Admin autenticado abre el dashboard
- **THEN** la navegación muestra "Usuarios", "Multimedia", "Categorías", "Etiquetas", "Noticias", "Páginas", "Redirecciones" y el índice de búsqueda con un nombre en español, además de los globals "Navegación", "Pie de página", "Configuración del sitio", "Portada" y "Barra lateral de noticias"
- **AND** no aparece ningún nombre de colección o global en inglés

### Requirement: Labels en español para campos, bloques y opciones
Todo campo visible en el admin SHALL mostrar un label en español. Esto incluye campos de grupo, array, tabs, row y collapsible, campos compartidos (SEO, slug, enlaces, redes sociales) y campos de bloques. Todo bloque (de Pages, Home, Article/editor enriquecido o compartido) SHALL declarar nombres en español en singular y plural. Todo array SHALL declarar nombres de fila en singular y plural en español. Toda opción de `select` o `radio` SHALL mostrar un label en español.

#### Scenario: Formulario de Noticia
- **WHEN** un Writer abre el formulario de creación de una Noticia
- **THEN** cada campo muestra un label en español (por ejemplo "Título", "Extracto", "Imagen destacada", "Categoría principal", "Fecha de publicación")
- **AND** ningún campo muestra un label derivado automáticamente de su nombre en inglés

#### Scenario: Selector de bloques
- **WHEN** un Admin agrega un bloque a la Portada, a una Página o al contenido enriquecido de una Noticia
- **THEN** cada bloque disponible aparece con su nombre en español

#### Scenario: Opciones de select
- **WHEN** un Admin edita el rol de un Usuario
- **THEN** las opciones se muestran como "Administrador" y "Redactor"

### Requirement: Identificadores persistidos intactos
La localización del admin SHALL NOT cambiar ningún slug de colección, global o bloque, ningún nombre de campo ni ningún valor almacenado de opciones. El esquema de base de datos y las respuestas de la API SHALL permanecer idénticos.

#### Scenario: Sin migración de base de datos
- **WHEN** se genera una migración de Payload después de aplicar la localización
- **THEN** no se detectan cambios de esquema

#### Scenario: Valores de opciones sin cambio
- **WHEN** un Admin guarda un Usuario con el rol "Administrador"
- **THEN** el valor persistido del campo `role` sigue siendo `admin`
