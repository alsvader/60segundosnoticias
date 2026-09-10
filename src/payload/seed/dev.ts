import path from 'node:path'

import { getPayload } from 'payload'

import config from '../../../payload.config.ts'
import type { Category, Post } from '../../payload-types.ts'

/**
 * `seed:dev` - development/demo content only. Never invoke this from
 * application startup or a production deploy; it is meant to be run
 * explicitly by a developer against a local database.
 */

const DEV_PASSWORD = 'DevOnlyPass123!'

const payload = await getPayload({ config })

const findOrCreateWriter = async (email: string, displayName: string) => {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })
  if (existing.docs.length > 0) {
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'users',
    data: { active: true, displayName, email, password: DEV_PASSWORD, role: 'writer' },
    overrideAccess: true,
  })
  console.log(`created writer: ${email}`)
  return created
}

const writerOne = await findOrCreateWriter('writer.uno@example.dev', 'Writer Uno (dev)')
const writerTwo = await findOrCreateWriter('writer.dos@example.dev', 'Writer Dos (dev)')

const existingMedia = await payload.find({
  collection: 'media',
  limit: 1,
  overrideAccess: true,
  where: { alt: { equals: 'Imagen de prueba (dev seed)' } },
})
const media =
  existingMedia.docs[0] ??
  (await payload.create({
    collection: 'media',
    data: { alt: 'Imagen de prueba (dev seed)' },
    filePath: path.resolve(process.cwd(), 'public/textures/paper-grain.webp'),
    overrideAccess: true,
    user: writerOne,
  }))
if (!existingMedia.docs[0]) {
  console.log('created dev Media')
}

const categories = await payload.find({ collection: 'categories', limit: 100, overrideAccess: true })
const categoryBySlug = new Map<string, Category>(categories.docs.map((category) => [category.slug, category]))
const primaryCategory = categories.docs[0]
if (categories.docs.length === 0) {
  console.log('no Category found - run `pnpm seed:initial` first for a fully realistic set of example content.')
}

const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const richTextFromParagraphs = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const upsertPost = async (slug: string, title: string, data: Partial<Post>) => {
  const existing = await payload.find({
    collection: 'posts',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  if (existing.docs.length > 0) {
    console.log(`skip (already exists): post ${slug}`)
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'posts',
    data: { slug, title, ...data },
    overrideAccess: true,
  })
  console.log(`created post: ${slug}`)
  return created
}

await upsertPost('borrador-de-prueba-dev', 'Borrador de prueba (dev)', {
  author: writerOne.id,
  content: richText('Este es un borrador de ejemplo generado por seed:dev.'),
})

const publishedPost = primaryCategory
  ? await upsertPost('noticia-de-prueba-dev', 'Noticia de prueba (dev)', {
      _status: 'published',
      author: writerOne.id,
      content: richText(
        'Este es un artículo de ejemplo publicado por seed:dev, con suficiente contenido para calcular un reading time real.',
      ),
      excerpt: 'Un resumen de ejemplo para la noticia de prueba de desarrollo.',
      featuredImage: media.id,
      primaryCategory: primaryCategory.id,
    })
  : undefined

/**
 * Representative example posts across every seeded category, so the Home
 * page has enough real content to evaluate visually (latest posts, posts by
 * category, featured posts, hero, etc.). Keyed by Category slug from
 * `seed:initial`'s `INITIAL_CATEGORIES`.
 */
type CategoryPostSeed = {
  slug: string
  title: string
  excerpt: string
  paragraphs: string[]
}

const CATEGORY_POSTS: Record<string, CategoryPostSeed[]> = {
  noticias: [
    {
      slug: 'cabildo-aprueba-presupuesto-2027',
      title: 'Cabildo de Villahermosa aprueba el presupuesto 2027',
      excerpt: 'El ayuntamiento definió las prioridades de gasto para el próximo año, con énfasis en obra pública y seguridad.',
      paragraphs: [
        'El Cabildo de Villahermosa aprobó anoche, en sesión extraordinaria, el paquete de presupuesto para el ejercicio fiscal 2027, luego de casi seis horas de debate entre las distintas fracciones.',
        'El monto total asciende a más de 3 mil millones de pesos, de los cuales una tercera parte se destinará a obra pública, mientras que el resto se reparte entre seguridad, servicios municipales y programas sociales.',
        'El presidente municipal señaló que la prioridad para el próximo año será concluir las obras de drenaje pluvial que quedaron pendientes tras la temporada de lluvias, además de reforzar la vigilancia en las principales avenidas de la ciudad.',
      ],
    },
    {
      slug: 'alerta-lluvias-chontalpa',
      title: 'Alerta por lluvias intensas en la región de la Chontalpa',
      excerpt: 'Protección Civil pidió a los habitantes de la zona mantenerse atentos a los avisos oficiales durante los próximos días.',
      paragraphs: [
        'La Coordinación Estatal de Protección Civil emitió una alerta amarilla para los municipios de la región de la Chontalpa, luego de que el Servicio Meteorológico Nacional pronosticara lluvias intensas para las próximas 48 horas.',
        'Las autoridades recomendaron a la población evitar cruzar arroyos y ríos con corriente, así como retirar de los techos cualquier objeto que pueda representar un riesgo.',
        'Se habilitaron refugios temporales en al menos cuatro municipios de la zona, y se pidió a los agricultores resguardar el ganado en las partes altas de sus predios ante el riesgo de desbordamientos.',
      ],
    },
    {
      slug: 'nuevo-hospital-regional',
      title: 'Arranca la construcción del nuevo hospital regional',
      excerpt: 'La obra beneficiará a más de 200 mil habitantes de la zona centro del estado, según autoridades de salud.',
      paragraphs: [
        'Autoridades estatales colocaron la primera piedra del nuevo hospital regional que se construirá en la zona centro de Tabasco, una obra que se había prometido desde hace más de una década.',
        'El proyecto contempla 120 camas censables, áreas de urgencias, quirófanos y una unidad de cuidados intensivos, con una inversión estimada superior a los 500 millones de pesos.',
        'Se espera que la primera etapa esté concluida en 18 meses, aunque especialistas consultados advirtieron que el reto real estará en garantizar personal médico suficiente una vez que el hospital abra sus puertas.',
      ],
    },
    {
      slug: 'feria-tabasco-arranca',
      title: 'La Feria Tabasco abre sus puertas con récord de expositores',
      excerpt: 'Más de 800 expositores locales y nacionales participan este año en el evento ferial más importante del estado.',
      paragraphs: [
        'Con un desfile inaugural que recorrió las principales calles de Villahermosa, arrancó oficialmente la edición de este año de la Feria Tabasco, considerada la más grande en la historia del evento por número de expositores.',
        'Los organizadores destacaron que este año se amplió el área ganadera y se incorporó un nuevo pabellón dedicado a emprendedores tabasqueños, con más de 150 espacios para negocios locales.',
        'La feria permanecerá abierta durante tres semanas, con actividades culturales, palenque y una cartelera musical que incluye a varios artistas nacionales.',
      ],
    },
    {
      slug: 'transporte-publico-nuevas-rutas',
      title: 'Anuncian nuevas rutas de transporte público para la zona metropolitana',
      excerpt: 'El proyecto busca reducir los tiempos de traslado entre los municipios conurbados y la capital del estado.',
      paragraphs: [
        'La Secretaría de Movilidad presentó un plan de reordenamiento del transporte público que contempla ocho nuevas rutas para conectar la zona metropolitana de Villahermosa con los municipios vecinos.',
        'El plan incluye unidades con aire acondicionado y sistema de pago electrónico, además de paraderos techados en los puntos de mayor afluencia.',
        'Las nuevas rutas comenzarán a operar de manera gradual durante los próximos tres meses, empezando por los corredores con mayor demanda de usuarios.',
      ],
    },
  ],
  vlog: [
    {
      slug: 'un-dia-cubriendo-carnaval',
      title: 'Un día completo cubriendo el Carnaval de Tabasco',
      excerpt: 'Nuestro equipo pasó doce horas en calle para traerte la cobertura completa del desfile y las comparsas.',
      paragraphs: [
        'Este video documenta un día entero de cobertura del Carnaval de Tabasco, desde la preparación de las comparsas en la madrugada hasta el cierre del desfile ya entrada la noche.',
        'El equipo de producción explica cómo se organizó la logística para cubrir tres puntos distintos del recorrido de manera simultánea, con cámaras fijas y un dron para las tomas aéreas.',
        'También se incluyen entrevistas rápidas con organizadores y participantes, que compartieron cómo se preparan durante meses para este evento.',
      ],
    },
    {
      slug: 'detras-de-camaras-noticiero',
      title: 'Detrás de cámaras: así armamos el noticiero cada noche',
      excerpt: 'Un recorrido por la redacción para ver cómo se construye la edición nocturna, minuto a minuto.',
      paragraphs: [
        'En este vlog mostramos el proceso completo detrás de la edición nocturna del noticiero, desde la reunión editorial de la tarde hasta la salida al aire.',
        'Se explica cómo el equipo de reporteros prioriza las notas del día, cómo se decide el orden de la emisión y qué pasa cuando surge una noticia de último momento.',
        'El video cierra con un vistazo al control máster durante la transmisión en vivo, con el equipo técnico coordinando cámaras, audio y gráficos en tiempo real.',
      ],
    },
    {
      slug: 'vlog-mercado-pino-suarez',
      title: 'Recorrido en video por el mercado Pino Suárez',
      excerpt: 'Una caminata por uno de los mercados más emblemáticos de Villahermosa, con sus sabores y personajes.',
      paragraphs: [
        'Este recorrido en video nos lleva por los pasillos del mercado Pino Suárez, uno de los puntos más tradicionales del centro de Villahermosa.',
        'Conversamos con locatarios que llevan décadas trabajando ahí, quienes compartieron anécdotas sobre cómo ha cambiado el mercado a lo largo de los años.',
        'El video también muestra algunos de los platillos típicos que se pueden encontrar en el lugar, preparados al momento frente a los visitantes.',
      ],
    },
    {
      slug: '24-horas-con-los-reporteros',
      title: '24 horas con el equipo de reporteros en campo',
      excerpt: 'Seguimos a dos reporteros durante un día completo de cobertura, desde la primera nota hasta la última.',
      paragraphs: [
        'Este vlog sigue a dos de nuestros reporteros durante veinticuatro horas de trabajo en campo, cubriendo desde una rueda de prensa matutina hasta un evento comunitario nocturno.',
        'Se muestra el trabajo detrás de cada nota: la investigación previa, la búsqueda de fuentes y el proceso de edición antes de que la información llegue a la audiencia.',
        'El video también aborda los retos logísticos de moverse entre distintos puntos de la ciudad en poco tiempo, sin perder calidad en la cobertura.',
      ],
    },
    {
      slug: 'como-editamos-nuestros-videos',
      title: 'Cómo editamos nuestros videos: el proceso paso a paso',
      excerpt: 'Un vistazo al flujo de trabajo del equipo de edición, desde el material bruto hasta el video final.',
      paragraphs: [
        'En este video explicamos el flujo de trabajo completo que sigue el equipo de edición, desde que se recibe el material grabado en campo hasta que el video queda listo para publicarse.',
        'Se detallan las herramientas que se usan para organizar el material, elegir las mejores tomas y ajustar el ritmo de cada pieza según el tema que se está cubriendo.',
        'También se comparten algunos consejos prácticos para quienes están empezando a editar contenido de video de manera profesional.',
      ],
    },
  ],
  experiencias: [
    {
      slug: 'pueblos-magicos-tabasco',
      title: 'Lo que aprendí recorriendo los pueblos mágicos de Tabasco',
      excerpt: 'Una crónica de viaje por los rincones menos conocidos del estado, entre historia y tradición.',
      paragraphs: [
        'Durante una semana recorrí varios de los pueblos mágicos de Tabasco, buscando entender qué los hace tan particulares más allá del nombramiento oficial.',
        'En cada lugar encontré historias distintas: artesanos que mantienen técnicas heredadas de generaciones anteriores, plazas centenarias y una gastronomía que cambia notablemente de un municipio a otro.',
        'Lo que más me sorprendió fue la calidez de la gente, siempre dispuesta a compartir una anécdota o recomendar el siguiente lugar que valía la pena visitar.',
      ],
    },
    {
      slug: '48-horas-selva-calakmul',
      title: 'Crónica: 48 horas en la selva de Calakmul',
      excerpt: 'Dos días desconectado de todo, entre ruinas mayas y la selva que las rodea.',
      paragraphs: [
        'Pasar 48 horas en la selva de Calakmul significó, sobre todo, aceptar que ahí el tiempo se mide distinto: sin señal de teléfono, con el sonido de la selva como única compañía constante.',
        'La zona arqueológica, apenas visible entre la vegetación, ofrece una perspectiva muy diferente a otros sitios mayas más conocidos y concurridos.',
        'La experiencia terminó siendo menos sobre las ruinas y más sobre la selva misma: los sonidos al amanecer, los monos araña cruzando entre los árboles y una sensación de escala que es difícil de describir sin haberla vivido.',
      ],
    },
    {
      slug: 'ruta-cacao-comalcalco',
      title: 'La ruta del cacao: una tarde en las haciendas de Comalcalco',
      excerpt: 'Un recorrido por las haciendas cacaoteras que explican por qué Tabasco es cuna del chocolate en México.',
      paragraphs: [
        'La ruta del cacao en Comalcalco permite entender, de primera mano, por qué esta región es considerada una de las cunas del chocolate en México.',
        'En las haciendas visitadas se puede seguir el proceso completo, desde la cosecha de la mazorca hasta la molienda tradicional que da origen al chocolate artesanal.',
        'El recorrido cierra con una degustación que deja claro por qué el cacao tabasqueño tiene un lugar tan particular en la historia gastronómica del país.',
      ],
    },
    {
      slug: 'navegando-rio-usumacinta',
      title: 'Navegando el río Usumacinta: una experiencia distinta',
      excerpt: 'Un viaje en lancha por uno de los ríos más importantes del sureste mexicano.',
      paragraphs: [
        'Navegar el río Usumacinta ofrece una perspectiva del sureste mexicano que rara vez se ve desde tierra: comunidades ribereñas, fauna abundante y un paisaje que cambia constantemente.',
        'El recorrido incluyó paradas en pequeñas comunidades donde los pobladores compartieron cómo el río sigue siendo, hasta hoy, una vía fundamental de transporte y sustento.',
        'La combinación de historia, naturaleza y vida cotidiana hace de este viaje una de las experiencias más completas que se pueden vivir en la región.',
      ],
    },
    {
      slug: 'amanecer-pantanos-centla',
      title: 'Ver amanecer en los Pantanos de Centla',
      excerpt: 'Una madrugada distinta en una de las reservas de humedales más grandes de América.',
      paragraphs: [
        'Llegar antes del amanecer a los Pantanos de Centla tiene una recompensa clara: ver despertar a una de las reservas de humedales más importantes de América.',
        'Entre la niebla que se levanta poco a poco sobre el agua, empiezan a aparecer garzas, cocodrilos y una enorme variedad de aves que hacen de este ecosistema uno de los más ricos del país.',
        'La visita, guiada por cooperativas locales, también sirvió para entender los esfuerzos de conservación que buscan proteger la zona ante la presión del crecimiento urbano.',
      ],
    },
  ],
  recomendaciones: [
    {
      slug: 'donde-comer-pejelagarto',
      title: '5 lugares para comer pejelagarto en Villahermosa',
      excerpt: 'Una selección de restaurantes donde probar uno de los platillos más representativos de la cocina tabasqueña.',
      paragraphs: [
        'El pejelagarto es, para muchos, el platillo más representativo de la cocina tabasqueña, y en Villahermosa hay varios lugares que lo preparan con recetas propias.',
        'Esta selección incluye desde fondas tradicionales del centro de la ciudad hasta restaurantes más recientes que reinterpretan la receta clásica sin perder su esencia.',
        'En todos los casos, la recomendación es acompañarlo con un buen pozol, la bebida tradicional que completa la experiencia.',
      ],
    },
    {
      slug: 'mejores-miradores-cerca-ciudad',
      title: 'Guía rápida: los mejores miradores cerca de la ciudad',
      excerpt: 'Sitios ideales para una escapada de medio día sin salir demasiado lejos de Villahermosa.',
      paragraphs: [
        'Para quienes buscan una escapada de medio día sin alejarse demasiado de la ciudad, esta guía reúne algunos de los mejores miradores de la zona.',
        'Se incluyen recomendaciones sobre el mejor horario para visitarlos, según la luz y la afluencia de personas, así como consejos prácticos de acceso.',
        'Todos los lugares seleccionados son accesibles en menos de una hora desde el centro de Villahermosa, ideales para un plan de fin de semana.',
      ],
    },
    {
      slug: 'cafeterias-para-trabajar',
      title: 'Cafeterías ideales para trabajar desde Villahermosa',
      excerpt: 'Espacios con buen café, wifi estable y ambiente tranquilo para quienes trabajan de forma remota.',
      paragraphs: [
        'Esta lista reúne cafeterías en Villahermosa que combinan buen café con las condiciones necesarias para trabajar de forma remota: wifi estable, enchufes disponibles y ambiente tranquilo.',
        'Cada recomendación incluye horarios pico a evitar y una breve descripción de la carta, para quienes buscan algo más que solo un espacio de trabajo.',
        'La selección abarca desde cadenas conocidas hasta cafeterías independientes que vale la pena descubrir.',
      ],
    },
    {
      slug: 'regalos-locales-recomendados',
      title: 'Diez productos locales que puedes regalar esta temporada',
      excerpt: 'Una guía de productos tabasqueños para regalar, desde artesanías hasta chocolate y café de la región.',
      paragraphs: [
        'Esta guía reúne diez productos elaborados por productores y artesanos tabasqueños, ideales para regalar en cualquier temporada del año.',
        'La selección incluye chocolate artesanal, café de la sierra, textiles hechos a mano y piezas de artesanía elaboradas con técnicas tradicionales.',
        'Cada producto viene acompañado de una breve nota sobre dónde conseguirlo y por qué vale la pena apoyar a los productores locales.',
      ],
    },
    {
      slug: 'rutas-para-andar-bicicleta',
      title: 'Las mejores rutas para andar en bicicleta por la ciudad',
      excerpt: 'Opciones seguras y accesibles para salir a rodar, tanto para principiantes como para ciclistas experimentados.',
      paragraphs: [
        'Villahermosa cuenta cada vez con más opciones para quienes buscan salir a andar en bicicleta de forma segura, y esta guía reúne las mejores rutas disponibles.',
        'Se incluyen recorridos cortos ideales para principiantes, así como rutas más largas pensadas para ciclistas con mayor experiencia.',
        'La recomendación general es evitar las horas de mayor tráfico y, cuando sea posible, optar por los tramos que ya cuentan con ciclovía.',
      ],
    },
  ],
  entretenimiento: [
    {
      slug: 'cartelera-cine-esta-semana',
      title: 'Lo nuevo en cartelera esta semana',
      excerpt: 'Un repaso de los estrenos más esperados que llegan a las salas de cine esta semana.',
      paragraphs: [
        'Esta semana llegan a cartelera varios estrenos que han generado expectativa, desde producciones de gran presupuesto hasta propuestas independientes.',
        'El repaso incluye una breve sinopsis de cada título, así como una primera impresión sobre cuáles podrían ser las apuestas más sólidas de la semana.',
        'También se incluyen los horarios generales de las principales cadenas de cine en la ciudad, para quienes ya tienen decidido qué ir a ver.',
      ],
    },
    {
      slug: 'entrevista-artista-local-gira',
      title: 'Entrevista con artista local antes de su gira nacional',
      excerpt: 'Conversamos sobre el proceso creativo detrás de su nuevo material y lo que viene en los próximos meses.',
      paragraphs: [
        'Antes de salir de gira por el país, conversamos con este artista tabasqueño sobre el proceso creativo detrás de su más reciente material.',
        'En la entrevista habla sobre cómo sus raíces influyen en su música y qué significa para él presentarse por primera vez fuera del estado con un proyecto propio.',
        'También adelantó algunos detalles sobre las fechas de la gira y lo que el público puede esperar de los próximos shows.',
      ],
    },
    {
      slug: 'conciertos-septiembre-tabasco',
      title: 'Los conciertos que no te puedes perder este mes en Tabasco',
      excerpt: 'Una agenda con las fechas, sedes y precios de los conciertos más destacados del mes.',
      paragraphs: [
        'Este mes llega a Tabasco una agenda musical variada, con propuestas que van desde artistas emergentes hasta nombres consolidados en distintos géneros.',
        'La agenda incluye fechas, sedes y un rango aproximado de precios, para quienes quieran planear con tiempo su asistencia.',
        'Varios de los eventos ya reportan una alta demanda de boletos, por lo que se recomienda no esperar hasta el último momento.',
      ],
    },
    {
      slug: 'series-recomendadas-streaming',
      title: 'Tres series que están dando de qué hablar en streaming',
      excerpt: 'Una selección de series recientes que vale la pena tener en la lista de pendientes.',
      paragraphs: [
        'Esta selección reúne tres series recientes que se han convertido en tema de conversación entre los usuarios de plataformas de streaming.',
        'Cada recomendación incluye una breve descripción sin adelantar detalles importantes de la trama, pensada para quienes aún no las han visto.',
        'La lista busca abarcar géneros distintos, desde el drama hasta la comedia, para que cada lector encuentre una opción a su gusto.',
      ],
    },
    {
      slug: 'festival-musica-independiente',
      title: 'Regresa el festival de música independiente a Villahermosa',
      excerpt: 'La nueva edición reunirá a bandas locales y nacionales en un solo fin de semana.',
      paragraphs: [
        'Tras un año de ausencia, el festival de música independiente regresa a Villahermosa con una edición que reunirá a bandas locales y nacionales en un mismo escenario.',
        'Los organizadores destacaron el esfuerzo por dar espacio a proyectos emergentes de la escena tabasqueña, que compartirán cartel con actos ya consolidados.',
        'El evento se realizará durante un fin de semana completo, con actividades adicionales como mercado de vinilos y talleres para músicos independientes.',
      ],
    },
  ],
}

const createdPostsByCategory: Record<string, Post[]> = {}
let authorToggle = 0

for (const [categorySlug, seeds] of Object.entries(CATEGORY_POSTS)) {
  const category = categoryBySlug.get(categorySlug)
  if (!category) {
    console.log(`skip category posts (category not found): ${categorySlug} - run \`pnpm seed:initial\` first.`)
    continue
  }
  const createdForCategory: Post[] = []
  for (const seed of seeds) {
    const author = authorToggle % 2 === 0 ? writerOne : writerTwo
    authorToggle += 1
    const created = await upsertPost(seed.slug, seed.title, {
      _status: 'published',
      author: author.id,
      content: richTextFromParagraphs(seed.paragraphs),
      excerpt: seed.excerpt,
      featuredImage: media.id,
      primaryCategory: category.id,
    })
    createdForCategory.push(created)
  }
  createdPostsByCategory[categorySlug] = createdForCategory
}

/**
 * Appends representative Home blocks (never replaces the existing
 * layout - `seed:initial`'s baseline, or a real Admin's configuration,
 * stays untouched) using a fixed marker per block as the idempotency
 * key, the same "look it up before creating" convention as the rest of
 * this script. Covers all 8 Home block types so each can be verified
 * visually against real content.
 */
const home = await payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true })
const existingLayout = home.layout ?? []
const devBlocks: NonNullable<typeof home.layout> = []

// EditorialIntro depends only on Media, never on a Post - unlike LatestPosts/
// FeaturedPosts below, it does not need `publishedPost`.
const EDITORIAL_INTRO_HEADLINE_PRIMARY = 'Noticias al'
if (
  !existingLayout.some(
    (block) => block.blockType === 'editorialIntro' && block.headlinePrimary === EDITORIAL_INTRO_HEADLINE_PRIMARY,
  )
) {
  devBlocks.push({
    blockType: 'editorialIntro',
    headlinePrimary: EDITORIAL_INTRO_HEADLINE_PRIMARY,
    headlineAccent: 'Momento',
    description: 'Noticias, videos y contenido editorial de Tabasco y el mundo, actualizado al momento.',
    backgroundImage: media.id,
    foregroundImage: media.id,
    cta: {
      label: 'Ver últimas noticias',
      type: 'external',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/`,
    },
  })
}

const noticiasPosts = createdPostsByCategory.noticias ?? []
const vlogPosts = createdPostsByCategory.vlog ?? []
const experienciasPosts = createdPostsByCategory.experiencias ?? []
const recomendacionesPosts = createdPostsByCategory.recomendaciones ?? []
const entretenimientoPosts = createdPostsByCategory.entretenimiento ?? []
const anyPublishedPost = publishedPost ?? noticiasPosts[0] ?? vlogPosts[0]

// heroNews is a page-level singleton (one "main story" section per Home) -
// skip if ANY heroNews already exists, whether seeded or admin-configured,
// rather than only matching this script's own marker.
if (noticiasPosts[0] && !existingLayout.some((block) => block.blockType === 'heroNews')) {
  devBlocks.push({
    blockType: 'heroNews',
    eyebrow: 'Lo más reciente',
    headline: 'Historias que no te puedes perder (dev)',
    contentMode: 'manual',
    mainPost: noticiasPosts[0].id,
    secondaryPosts: [vlogPosts[0], experienciasPosts[0], recomendacionesPosts[0]]
      .filter((post): post is Post => Boolean(post))
      .map((post) => post.id),
  })
}

if (anyPublishedPost) {
  const LATEST_POSTS_TITLE = 'Últimas noticias (dev)'
  const FEATURED_POSTS_TITLE = 'Destacadas (dev)'

  if (!existingLayout.some((block) => block.blockType === 'latestPosts' && block.title === LATEST_POSTS_TITLE)) {
    devBlocks.push({ blockType: 'latestPosts', title: LATEST_POSTS_TITLE, limit: 6, layout: 'grid' })
  }

  const featuredCandidates = [
    publishedPost,
    noticiasPosts[0],
    vlogPosts[0],
    experienciasPosts[0],
    recomendacionesPosts[0],
    entretenimientoPosts[0],
  ].filter((post): post is Post => Boolean(post))

  if (
    featuredCandidates.length > 0 &&
    !existingLayout.some((block) => block.blockType === 'featuredPosts' && block.title === FEATURED_POSTS_TITLE)
  ) {
    devBlocks.push({
      blockType: 'featuredPosts',
      title: FEATURED_POSTS_TITLE,
      posts: featuredCandidates.map((post) => post.id),
      layout: 'grid',
    })
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  noticias: 'Noticias',
  vlog: 'Vlog',
  experiencias: 'Experiencias',
  recomendaciones: 'Recomendaciones',
  entretenimiento: 'Entretenimiento',
}
for (const [categorySlug, posts] of Object.entries(createdPostsByCategory)) {
  const category = categoryBySlug.get(categorySlug)
  if (!category || posts.length === 0) {
    continue
  }
  const title = CATEGORY_LABELS[categorySlug] ?? category.name
  if (!existingLayout.some((block) => block.blockType === 'postsByCategory' && block.title === title)) {
    devBlocks.push({
      blockType: 'postsByCategory',
      title,
      category: category.id,
      limit: 6,
      layout: 'grid',
      showViewAll: false,
    })
  }
}

// videoFeature is also a page-level singleton - skip if any already exists.
if (vlogPosts[0] && !existingLayout.some((block) => block.blockType === 'videoFeature')) {
  devBlocks.push({
    blockType: 'videoFeature',
    title: 'Video destacado (dev)',
    source: 'post',
    post: vlogPosts[0].id,
    headline: vlogPosts[0].title,
    description: 'Un vistazo detrás de cámaras a nuestro trabajo diario.',
  })
}

const BANNER_TITLE = 'Síguenos en nuestras redes (dev)'
if (!existingLayout.some((block) => block.blockType === 'banner' && block.title === BANNER_TITLE)) {
  devBlocks.push({
    blockType: 'banner',
    title: BANNER_TITLE,
    description: 'No te pierdas ninguna noticia: síguenos en redes sociales para contenido al momento.',
    image: media.id,
    variant: 'editorial',
    link: {
      label: 'Síguenos',
      type: 'external',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/`,
    },
  })
}

if (devBlocks.length > 0) {
  await payload.updateGlobal({
    slug: 'home',
    data: { layout: [...existingLayout, ...devBlocks], _status: 'published' },
    overrideAccess: true,
  })
  console.log(`appended dev Home blocks: ${devBlocks.map((block) => block.blockType).join(', ')}`)
} else {
  console.log('skip (already exists): dev Home blocks')
}

const existingPage = await payload.find({
  collection: 'pages',
  limit: 1,
  overrideAccess: true,
  where: { slug: { equals: 'pagina-de-prueba-dev' } },
})
if (existingPage.docs.length === 0) {
  await payload.create({
    collection: 'pages',
    data: { slug: 'pagina-de-prueba-dev', title: 'Página de prueba (dev)' },
    overrideAccess: true,
  })
  console.log('created dev Page')
} else {
  console.log('skip (already exists): page pagina-de-prueba-dev')
}

console.log('seed:dev done.')
process.exit(0)
