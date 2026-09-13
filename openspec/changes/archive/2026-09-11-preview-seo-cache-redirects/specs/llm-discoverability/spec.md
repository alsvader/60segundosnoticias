## Purpose

Expone un documento `/llms.txt` público y curado que ayuda a agentes/LLMs a orientarse en el contenido publicado del sitio, complementario a metadata, JSON-LD, sitemap y robots — sin sustituirlos ni garantizar posicionamiento, citación o inclusión en entrenamiento de modelos.

## ADDED Requirements

### Requirement: Endpoint público de llms.txt
El sistema SHALL exponer `GET /llms.txt` públicamente, respondiendo con contenido Markdown y un `Content-Type` apropiado para ese formato.

#### Scenario: Se solicita /llms.txt
- **WHEN** cualquier cliente solicita `GET /llms.txt`
- **THEN** responde 200 con contenido Markdown

Referencia: AC-LLM-001

### Requirement: Estructura llms.txt v2
El documento SHALL seguir la estructura llms.txt v2: un encabezado H1 con la identidad del sitio, un blockquote de resumen, y cero o más secciones delimitadas por encabezados H2 conteniendo listas de enlaces Markdown.

#### Scenario: Se audita la estructura del documento
- **WHEN** se inspecciona el contenido de `/llms.txt`
- **THEN** comienza con un H1, seguido de un blockquote de resumen, y sus listas de contenido están organizadas en secciones H2

Referencia: AC-LLM-002

### Requirement: Solo contenido publicado
El documento SHALL incluir únicamente Categorías públicas y Posts/Pages publicados. Ningún Draft SHALL aparecer.

#### Scenario: Existe un Post en Draft
- **WHEN** se genera `/llms.txt` y existe un Post en Draft
- **THEN** ese Post no aparece en el documento

Referencia: AC-LLM-003

### Requirement: URLs absolutas y canónicas
Todos los enlaces del documento SHALL ser URLs absolutas construidas con el origen de sitio canónico centralizado (capability `public-url-system`). Los Posts SHALL enlazarse usando su `primaryCategory`.

#### Scenario: Se audita un enlace de Post en el documento
- **WHEN** se inspecciona el enlace de un Post listado en `/llms.txt`
- **THEN** es una URL absoluta que usa la categoría primaria del Post

Referencia: AC-LLM-004

### Requirement: Listado de Posts recientes acotado
El listado de Posts recientes SHALL estar acotado a un número curado y razonable, nunca un volcado histórico completo del contenido publicado.

#### Scenario: El sitio tiene cientos de Posts publicados
- **WHEN** se genera `/llms.txt` sobre un sitio con un historial extenso de Posts
- **THEN** el listado de Posts recientes permanece acotado, no incluye el historial completo

Referencia: AC-LLM-005

### Requirement: Revalidación ante cambios de contenido representado
El documento SHALL invalidarse/revalidarse cuando cambie contenido representado en él (publicación, despublicación, o cambio de los campos usados en el documento — título, extracto, slug, categoría).

#### Scenario: Se publica un nuevo Post
- **WHEN** se publica un Post que calificaría para el listado de recientes
- **THEN** el documento se revalida y refleja ese Post en su siguiente generación

Referencia: AC-LLM-006

### Requirement: Texto seguro ante caracteres especiales de Markdown
Los caracteres con significado estructural en Markdown presentes en campos editoriales (título, extracto, descripción) SHALL escaparse o neutralizarse antes de interpolarse en el documento, de forma que no puedan corromper su estructura de encabezados/listas/enlaces.

#### Scenario: Un título contiene caracteres especiales de Markdown
- **WHEN** el título de un Post contiene corchetes, paréntesis o un carácter `#` al inicio
- **THEN** el documento generado permanece válido y esos caracteres no alteran su estructura

### Requirement: Sin alternativas Markdown de página completa
Esta capability SHALL NOT incluir alternativas Markdown de páginas individuales (por ejemplo, un mirror en `/<category>/<post>.md` o `/<page>.md`). Esto queda explícitamente diferido.

#### Scenario: Se solicita una alternativa Markdown de un Article
- **WHEN** se solicita una ruta Markdown de un Article individual
- **THEN** esa ruta no existe en esta capability

### Requirement: Terminología sin promesas de posicionamiento
Cualquier documentación o texto de producto relacionado con esta capability SHALL describirla como "LLM / Agent Discoverability" y SHALL NOT afirmar que garantiza posicionamiento en buscadores de IA, citación, o inclusión en entrenamiento de modelos.

#### Scenario: Se documenta esta capability
- **WHEN** se escribe documentación de producto sobre `/llms.txt`
- **THEN** usa el término "LLM / Agent Discoverability" y no promete ranking, citación ni inclusión en entrenamiento
