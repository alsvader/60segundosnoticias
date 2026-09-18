# cms-integration-testing Specification

## Purpose

Verifica, mediante llamadas reales al Local API de Payload contra una base
de datos Postgres desechable e inicializada por migraciones, que el
control de acceso, el ciclo de vida de publicación, las redirecciones, la
sincronización de búsqueda, la autorización de preview y la invalidación
de caché se comportan según lo especificado, y que la cadena de
migraciones por sí sola produce un esquema completamente operable.

## Requirements

### Requirement: La cadena de migraciones produce un esquema operable
Ejecutar la cadena completa de migraciones versionadas contra una base de
datos Postgres vacía SHALL producir un esquema en el que cada colección y
global requerido por la aplicación (Navigation, Footer, SiteSettings,
Home, Posts, Pages, Categories, Search, Redirects, Users, Media) pueda
leerse y escribirse vía el Local API de Payload.

#### Scenario: Lectura de humo tras la cadena de migraciones desde cero
- **WHEN** la cadena completa de migraciones se ejecuta contra una base de
  datos vacía
- **THEN** una lectura de cada uno de Navigation, Footer, SiteSettings,
  Home, Posts, Pages, Categories, Search y Redirects vía el Local API
  SHALL completarse sin error

#### Scenario: El estado de migraciones queda limpio tras la cadena
- **WHEN** la cadena de migraciones se ha aplicado por completo
- **THEN** `payload migrate:status` SHALL reportar cero migraciones
  pendientes

### Requirement: Límites de permisos del rol Writer
Un Writer SHALL poder crear y editar sus propios Posts, SHALL estar
bloqueado de editar el Post de otro Writer, y este límite SHALL aplicarse
en el servidor sin importar los valores de campo enviados por el cliente.

#### Scenario: Writer edita su propio Post
- **WHEN** el Writer A actualiza un Post cuyo autor es el Writer A
- **THEN** la actualización SHALL completarse exitosamente

#### Scenario: Writer bloqueado en el Post de otro writer
- **WHEN** el Writer A intenta actualizar un Post cuyo autor es el
  Writer B
- **THEN** la actualización SHALL ser rechazada por el control de acceso

#### Scenario: La autoría no puede falsificarse
- **WHEN** una solicitud de creación/actualización envía un campo `author`
  que nombra a un usuario distinto del Writer autenticado
- **THEN** el sistema SHALL persistir al Writer autenticado como autor,
  ignorando el valor enviado

#### Scenario: Admin administra cualquier Post
- **WHEN** un Admin actualiza cualquier Post sin importar el autor
- **THEN** la actualización SHALL completarse exitosamente

### Requirement: La lectura pública excluye contenido en borrador
Las lecturas anónimas y de cara al público SHALL nunca devolver un Post o
Page cuyo estado sea borrador.

#### Scenario: Post en borrador ausente de la lectura pública
- **WHEN** una solicitud anónima consulta contenido publicado
- **THEN** ningún Post con estado de borrador SHALL estar incluido en el
  resultado

### Requirement: Ciclo de vida de borrador y publicación
Un borrador recién creado SHALL NOT ser visible públicamente; publicarlo
SHALL hacerlo visible públicamente; guardar una nueva revisión en borrador
sobre un documento publicado SHALL dejar la versión pública sin cambios
hasta que se vuelva a publicar; despublicar SHALL eliminar la visibilidad
pública; volver a publicar SHALL restaurarla.

#### Scenario: Publicar hace el contenido público
- **WHEN** un Post en borrador transiciona a estado publicado
- **THEN** una lectura pública subsecuente SHALL devolver ese Post

#### Scenario: La revisión en borrador no afecta la versión publicada
- **WHEN** un Post publicado recibe una nueva revisión en borrador sin
  publicar
- **THEN** la lectura pública SHALL seguir devolviendo el contenido
  previamente publicado

#### Scenario: Despublicar elimina la visibilidad pública
- **WHEN** un Post publicado se despublica
- **THEN** una lectura pública subsecuente SHALL NOT devolver ese Post

### Requirement: Creación de redirecciones y aplanado de cadenas
Cambiar el slug o la categoría principal de un Post publicado, el slug de
una Page, o el slug de una Category, SHALL crear una redirección de la URL
canónica anterior a la nueva; un cambio simultáneo de slug y categoría
SHALL producir una única redirección directamente al destino final; una
cadena de redirecciones existente SHALL aplanarse de modo que cualquier
origen resuelva directamente a su destino final, respetando el límite de
saltos documentado; un ciclo SHALL detectarse y las redirecciones
involucradas SHALL desactivarse en lugar de producir un bucle.

#### Scenario: Cambio simultáneo de slug y categoría produce un solo salto
- **WHEN** el slug y la categoría principal de un Post publicado cambian
  en la misma actualización
- **THEN** SHALL crearse exactamente una redirección, de la URL original
  directamente a la URL final

#### Scenario: Aplanado de cadena
- **WHEN** ya existe una redirección de A a B y se crea una nueva
  redirección de B a C
- **THEN** una solicitud a A SHALL resolver directamente a C

#### Scenario: Protección contra ciclos
- **WHEN** crear una redirección completaría un ciclo de vuelta a una URL
  ya visitada en la cadena
- **THEN** las redirecciones involucradas en el ciclo SHALL desactivarse
  en lugar de causar un bucle de resolución

#### Scenario: Eliminar no inventa una redirección
- **WHEN** un Post o Page se elimina sin haber sido renombrado ni
  recategorizado mientras estaba publicado
- **THEN** ninguna redirección SHALL crearse como resultado de la
  eliminación

### Requirement: Sincronización del índice de búsqueda y límites documentados de V1
Solo los Posts y Pages publicados SHALL aparecer en resultados de
búsqueda; un borrador SHALL nunca indexarse; despublicar o eliminar un
documento SHALL eliminarlo del índice; una reindexación manual SHALL ser
idempotente (sin entradas duplicadas en ejecuciones repetidas). La
coincidencia insensible a acentos, la coincidencia entre campos distintos,
la tolerancia a errores de tipeo y el ranking más allá de
prioridad+fecha están explícitamente fuera de alcance según el V1
documentado.

#### Scenario: Borrador nunca indexado
- **WHEN** un Post se guarda como borrador
- **THEN** SHALL NOT aparecer en ningún resultado de búsqueda

#### Scenario: Publicar indexa el contenido
- **WHEN** un Post se publica
- **THEN** una búsqueda que coincida con su título SHALL devolverlo

#### Scenario: La reindexación es idempotente
- **WHEN** la operación manual de reindexación se ejecuta dos veces
  consecutivas
- **THEN** el número de resultados de búsqueda para una consulta fija SHALL
  ser idéntico después de ambas ejecuciones

#### Scenario: La coincidencia insensible a acentos no es requerida
- **WHEN** una consulta usa la forma sin acentos de un término que solo
  aparece acentuado en el contenido
- **THEN** el sistema NO está obligado a devolver ese contenido como
  coincidencia

### Requirement: Autorización de preview
Un usuario SHALL poder previsualizar únicamente el borrador que está
autorizado a ver (Admin: cualquiera; Writer: solo su propio contenido
autorado); el destino de la redirección de preview SHALL derivarse del
documento resuelto en el servidor, nunca de parámetros enviados por el
cliente; un secreto de preview inválido o ausente SHALL denegar el acceso
siempre, sin importar el estado de autenticación.

#### Scenario: Writer previsualiza su propio borrador
- **WHEN** un Writer autenticado solicita previsualizar su propio Post en
  borrador
- **THEN** el sistema SHALL redirigir al contenido renderizado del
  borrador

#### Scenario: Writer denegado en el borrador de otro writer
- **WHEN** un Writer autenticado solicita previsualizar un Post en
  borrador autorado por otro Writer
- **THEN** el sistema SHALL denegar el acceso

#### Scenario: Secreto inválido denegado
- **WHEN** una solicitud de preview envía un secreto que no coincide con
  el secreto de preview configurado
- **THEN** el sistema SHALL denegar el acceso sin importar el estado de
  autenticación del solicitante

#### Scenario: El destino de la redirección no es controlable por el atacante
- **WHEN** los parámetros `collection` o `id` de una solicitud de preview
  son manipulados
- **THEN** el destino de la redirección resultante SHALL derivarse
  únicamente de los campos del documento resuelto, nunca de los parámetros
  manipulados de la solicitud

### Requirement: Invalidación de caché ante cambios que afectan lo publicado
Publicar, actualizar o despublicar un Post, una Page, o un Global
(Navigation, Footer, SiteSettings, Home) SHALL invalidar exactamente las
etiquetas de caché que hacen observable el cambio en la siguiente
solicitud pública; editar un documento que nunca ha sido publicado SHALL
NOT invalidar ninguna etiqueta de caché de cara al público; una falla
durante la invalidación SHALL nunca impedir que la escritura subyacente se
complete exitosamente.

#### Scenario: Publicar actualiza la página pública
- **WHEN** el contenido de un Post publicado se actualiza
- **THEN** la siguiente solicitud pública de la página de ese Post SHALL
  reflejar la actualización

#### Scenario: Edición solo-borrador no invalida nada público
- **WHEN** se edita un Post que nunca ha sido publicado
- **THEN** ninguna etiqueta de caché de cara al público SHALL invalidarse
  como resultado

#### Scenario: Una falla de invalidación no bloquea la escritura
- **WHEN** el paso de invalidación de caché falla por cualquier motivo
- **THEN** la escritura de Payload que lo desencadenó SHALL persistirse
  exitosamente de todas formas
