## Purpose

Establece los gates de calidad de E2E, accesibilidad, regresión visual y
performance que verifican que los journeys críticos de la aplicación
pública, el comportamiento relevante para WCAG, y los presupuestos de
Lighthouse de laboratorio se mantienen sobre un build de producción, más
un smoke test de la imagen Docker de producción.

## ADDED Requirements

### Requirement: Journeys críticos de E2E pasan en cada pull request
Los siguientes journeys SHALL pasar como pruebas automatizadas de
navegador antes del merge: lectura pública (Home → Category → Article),
búsqueda (HeaderSearch se expande → se envía la consulta → resultados →
paginación), navegación móvil, una Page de CMS, una URL desconocida que
renderiza el 404 de marca, una URL legacy que resuelve vía redirección a
su destino canónico, un flujo autenticado de preview y salida de preview,
y un login de Admin que alcanza una colección core.

#### Scenario: Journey de lectura pública
- **WHEN** un navegador navega de Home a una Category y luego a un
  Article
- **THEN** cada página SHALL renderizar su contenido principal esperado
  sin error

#### Scenario: Journey de búsqueda
- **WHEN** un usuario expande HeaderSearch, envía una consulta y pagina
  los resultados
- **THEN** el navegador SHALL navegar a `/buscar` con resultados
  coincidentes y SHALL poder moverse entre páginas de resultados

#### Scenario: URL desconocida muestra el 404 de marca
- **WHEN** un navegador solicita una URL sin ruta ni redirección
  coincidente
- **THEN** la respuesta SHALL renderizar la página 404 de marca del
  proyecto

### Requirement: Escaneo automatizado de accesibilidad en páginas representativas
Home, una Category, un Article, una Page, la página de resultados de
Search, la página 404, MobileNav en su estado abierto, y HeaderSearch en
su estado expandido SHALL escanearse con una herramienta automatizada de
accesibilidad y SHALL reportar cero violaciones detectables
automáticamente. El escaneo automatizado por sí solo no se considera
prueba de conformidad WCAG completa.

#### Scenario: Escaneo automatizado en Article
- **WHEN** la página de Article se escanea con la herramienta
  automatizada de accesibilidad
- **THEN** SHALL reportarse cero violaciones

#### Scenario: Escaneo automatizado en un estado interactivo
- **WHEN** MobileNav se abre y se escanea
- **THEN** SHALL reportarse cero violaciones

### Requirement: Regresión visual selectiva en superficies estables de alto valor
Home, un Article, HeaderSearch en su estado expandido, y MobileNav en su
estado abierto SHALL tener una captura de referencia; un pull request
SHALL fallar esta verificación únicamente cuando una de estas cuatro
superficies diverja visualmente de su referencia más allá de una
tolerancia acordada; la regresión visual SHALL nunca ser la única
aserción para un comportamiento que también está cubierto por una prueba
semántica.

#### Scenario: Cambio visual inesperado en Home
- **WHEN** un pull request cambia el layout renderizado de Home más allá
  de la tolerancia
- **THEN** la verificación de regresión visual SHALL fallar y SHALL
  requerir una actualización explícita de la referencia

#### Scenario: Sin referencia visual fuera de las cuatro superficies aprobadas
- **WHEN** se añade una nueva ruta o componente
- **THEN** NO SHALL crearse una nueva referencia de regresión visual para
  esa ruta o componente como parte de la suite por defecto de esta
  capacidad

### Requirement: QA responsive en viewports representativos
Home, Category, Article, Page y Search SHALL verificarse libres de
desbordamiento horizontal y de contenido ilegible o recortado en
aproximadamente los anchos de viewport 375px, 768px, 1024px y 1440px,
incluyendo los estados interactivos de MobileNav abierto y HeaderSearch
expandido.

#### Scenario: Sin desbordamiento horizontal en ancho móvil
- **WHEN** cualquiera de las páginas representativas se renderiza a un
  ancho de ~375px
- **THEN** la página SHALL NOT producir scroll horizontal

### Requirement: Presupuestos de calidad de Lighthouse sobre un build de producción
Medidos con la mediana de 3 corridas contra un build de producción (no
modo desarrollo) sobre Home, una Category poblada, un Article
representativo, una Page representativa y Search con resultados
deterministas: Lighthouse Performance SHALL ser ≥85, Accessibility ≥95,
Best Practices ≥95, SEO ≥95; el LCP de laboratorio SHALL ser ≤2.5s; el CLS
SHALL ser ≤0.10; el TBT SHALL ser ≤200ms. Un Article que contenga embeds
de terceros SHALL auditarse con las mismas métricas pero su resultado es
diagnóstico y SHALL NOT bloquear un pull request.

#### Scenario: Presupuesto cumplido en Home
- **WHEN** Home se mide contra un build de producción con la mediana de 3
  corridas de Lighthouse
- **THEN** Performance SHALL ser ≥85 y CLS SHALL ser ≤0.10

#### Scenario: Article con embeds no bloquea el merge
- **WHEN** un Article representativo que contiene un embed de terceros
  falla un presupuesto de Lighthouse
- **THEN** el pull request SHALL NOT bloquearse únicamente por ese
  resultado, aunque el hallazgo SHALL reportarse igualmente

#### Scenario: Las métricas de laboratorio no se presentan como datos de campo
- **WHEN** se reporta un valor de LCP/CLS/TBT derivado de Lighthouse
- **THEN** SHALL etiquetarse como una medición de laboratorio y SHALL NOT
  presentarse como datos reales de campo de Core Web Vitals

### Requirement: Verificación de smoke de Docker de producción
Partiendo de una base de datos Postgres desechable, ejecutar el migrator
de un solo uso, y luego iniciar la imagen runner de producción SHALL
resultar en: una respuesta saludable de `/api/health`, una respuesta
exitosa de la ruta de inicio, una ruta de Category conocida, una ruta de
Article conocida, `/buscar`, y una página de login de Admin alcanzable.

#### Scenario: La secuencia completa de smoke tiene éxito
- **WHEN** la secuencia Postgres desechable → migrator → runner se
  completa
- **THEN** `/api/health` SHALL responder con éxito y cada una de las
  rutas públicas listadas SHALL responder exitosamente

#### Scenario: El runner no corre como root
- **WHEN** se inspecciona el contenedor runner de producción
- **THEN** su proceso SHALL estar corriendo como un usuario no-root
