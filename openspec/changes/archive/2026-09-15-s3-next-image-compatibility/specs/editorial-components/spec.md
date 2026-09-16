## ADDED Requirements

### Requirement: Media de Payload se renderiza sin depender de una lista de hosts fijada en build
Cualquier componente presentacional que renderice Media de Payload (incluyendo, sin limitarse a, `ResponsiveMedia` y `ArticleMetadata`) SHALL mostrar exitosamente esa Media sin importar qué origen de almacenamiento (local o S3-compatible) esté configurado en el entorno de ejecución, y SHALL NOT depender de que ese origen haya sido conocido en el momento del build de la aplicación.

#### Scenario: Media servida desde almacenamiento local en desarrollo
- **WHEN** un componente renderiza Media cuya URL es servida por el almacenamiento local (sin Object Storage S3-compatible configurado)
- **THEN** la imagen se solicita y se muestra correctamente

#### Scenario: Media servida desde un origen S3-compatible en producción
- **WHEN** un componente renderiza Media cuya URL apunta a un origen de Object Storage S3-compatible configurado en el entorno de ejecución
- **THEN** la imagen se solicita directamente a ese origen y se muestra correctamente, sin ser rechazada por el optimizador de imágenes del framework

#### Scenario: El mismo build se reconfigura contra un origen S3-compatible distinto
- **WHEN** la misma imagen construida de la aplicación se ejecuta con un origen de Object Storage S3-compatible diferente al usado en un despliegue anterior, sin reconstruir la aplicación
- **THEN** la Media servida desde el nuevo origen se muestra correctamente

#### Scenario: Ancho, alto y aspect-ratio permanecen estables
- **WHEN** se renderiza Media de Payload bajo cualquier origen de almacenamiento soportado
- **THEN** el espacio reservado en el layout (ancho, alto o aspect-ratio, según corresponda) no cambia respecto al comportamiento ya especificado por el contrato de `ResponsiveMedia`
