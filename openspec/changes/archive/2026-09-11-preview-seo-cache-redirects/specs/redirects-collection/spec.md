## REMOVED Requirements

### Requirement: Sin generación automática de redirects
**Reason**: Este requirement declaraba explícitamente que la generación automática de redirects "corresponde a una fase posterior (Preview + SEO + Cache + Redirects)". Esa fase es esta change: la generación automática ahora es un requirement aprobado y explícito, definido en la nueva capability `redirects` — disparada por hooks en Posts/Categories/Pages, no por lógica propia de esta Collection.
**Migration**: No aplica ninguna migración de datos. Este requirement queda reemplazado por los requirements de generación automática de la capability `redirects` (por cambio de Post, de Category y de Page). El schema y el control de acceso de la Collection `Redirects` no cambian.
