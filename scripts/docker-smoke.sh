#!/usr/bin/env bash
# Smoke de Docker de producción (design.md, Decisión 7 - nivel FULL de
# CI): la única capa que efectivamente construye y levanta la imagen
# `runner` real vía `compose.prod.yaml`, con el perfil `self-hosted`
# (Postgres desechable) - la única forma de verificar en vivo el usuario
# no-root, el HEALTHCHECK y la topología `migrate -> app` reales.
#
# Reutiliza el MinIO desechable de `compose.test.yml` (debe estar
# corriendo: `docker compose -f compose.test.yml up -d`) para las
# variables S3_* - los contenedores de `compose.prod.yaml` lo alcanzan vía
# `host.docker.internal`, ya que viven en una red de Compose separada.
#
# AISLAMIENTO DE PROYECTO DE COMPOSE (obligatorio, no opcional - ver
# design.md, sección Risks, incidente real): este script SIEMPRE pasa su
# propio `-p "$SMOKE_PROJECT"` explícito, nunca confía en el `name:` de
# `compose.prod.yaml` ni en el directorio de trabajo. Antes de cualquier
# limpieza destructiva (`down -v`), `assert_smoke_project_is_active()`
# vuelve a confirmar - inspeccionando la etiqueta real
# `com.docker.compose.project` de los contenedores encontrados bajo ese
# nombre de proyecto, no una variable de shell ya asumida como correcta -
# que el proyecto activo es exactamente el esperado, y se niega a limpiar
# si no lo es (fail closed). La primera versión de este script no tenía
# ninguno de los dos, corrió `compose.prod.yaml` bajo el mismo namespace
# de proyecto que el `compose.yaml` de desarrollo (ambos sin `name:` en su
# momento, ambos reusando los nombres de servicio `app`/`db`), y su
# `down -v` de limpieza destruyó el Postgres de desarrollo real.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

SMOKE_PROJECT='60segundosnoticias-smoke'
COMPOSE=(docker compose -p "$SMOKE_PROJECT" -f compose.prod.yaml --profile self-hosted)

# Nombre terminado en `_test`: requerido por
# `tests/setup/assert-test-database.ts` (usado por `scripts/seed-e2e.ts`
# más abajo) - ese guard exige tanto el sufijo `_test` como un host/puerto
# reconocido antes de permitir cualquier siembra contra una base de
# datos, precisamente para que un error de configuración no pueda
# apuntarlo por accidente a una base real. `db:5432` (este servicio
# desechable de `compose.prod.yaml --profile self-hosted`, dentro de la
# red de Compose) es el segundo par host/puerto reconocido, junto al
# `localhost:5433` de `compose.test.yml`.
export POSTGRES_DB='60segundos_smoke_test'
export POSTGRES_PASSWORD='docker-smoke-disposable-pw'
export DATABASE_URI="postgres://postgres:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
export PAYLOAD_SECRET='docker-smoke-disposable-payload-secret'
export PREVIEW_SECRET='docker-smoke-disposable-preview-secret'
export NEXT_PUBLIC_SITE_URL='http://localhost:3000'
export S3_ENDPOINT='http://host.docker.internal:9000'
export S3_REGION='us-east-1'
export S3_BUCKET='e2e-test-media'
export S3_ACCESS_KEY_ID='e2eminioadmin'
export S3_SECRET_ACCESS_KEY='e2eminioadmin'
export S3_PUBLIC_URL='http://localhost:9000/e2e-test-media'

# Guard de seguridad fail-closed: nunca confiar en que `$SMOKE_PROJECT`
# (una variable de shell) coincide con la realidad. Se vuelve a preguntar
# a Docker, por la etiqueta real de cada contenedor bajo ese nombre de
# proyecto, y se niega a limpiar si algo no cuadra - incluyendo el caso de
# no encontrar ningún contenedor (nada que limpiar, no es un error, pero
# tampoco se debe intentar `down -v` sobre un proyecto que Docker no
# reconoce como existente).
assert_smoke_project_is_active() {
  local ids
  ids=$(docker ps -aq --filter "label=com.docker.compose.project=${SMOKE_PROJECT}")
  if [ -z "$ids" ]; then
    echo "docker-smoke: ningún contenedor bajo el proyecto '${SMOKE_PROJECT}' - nada que limpiar." >&2
    return 1
  fi
  local id label
  for id in $ids; do
    label=$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' "$id")
    if [ "$label" != "$SMOKE_PROJECT" ]; then
      echo "docker-smoke: NIEGO la limpieza - contenedor ${id} tiene com.docker.compose.project='${label}', se esperaba '${SMOKE_PROJECT}'." >&2
      exit 1
    fi
  done
  return 0
}

cleanup() {
  echo '--- docker-smoke: verificando aislamiento antes de limpiar ---'
  if assert_smoke_project_is_active; then
    echo "--- docker-smoke: limpiando proyecto '${SMOKE_PROJECT}' ---"
    "${COMPOSE[@]}" down -v --remove-orphans
  fi
}
trap cleanup EXIT

echo "--- docker-smoke: construyendo y levantando db -> migrate -> app (proyecto '${SMOKE_PROJECT}') ---"
"${COMPOSE[@]}" up -d --build

echo '--- docker-smoke: esperando healthcheck de app ---'
app_container=$("${COMPOSE[@]}" ps -q app)
status='starting'
for _ in $(seq 1 30); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$app_container")
  if [ "$status" = 'healthy' ]; then
    break
  fi
  sleep 2
done
if [ "$status" != 'healthy' ]; then
  echo "docker-smoke: app nunca reportó 'healthy' (último estado: ${status})" >&2
  "${COMPOSE[@]}" logs app
  exit 1
fi

echo '--- docker-smoke: sembrando fixtures deterministas (sección 2) ---'
"${COMPOSE[@]}" run --rm --entrypoint 'pnpm payload run scripts/seed-e2e.ts' migrate

check_url() {
  local path="$1"
  local url="http://localhost:3000${path}"
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  if [ "$status" -ge 400 ]; then
    echo "docker-smoke: ${url} respondió ${status}" >&2
    exit 1
  fi
  echo "  ${path} -> ${status}"
}

echo '--- docker-smoke: verificando rutas públicas + Admin ---'
check_url '/api/health'
check_url '/'
check_url '/fixture-noticias'
check_url '/fixture-noticias/fixture-post-publicado'
check_url '/buscar'
check_url '/admin/login'

echo '--- docker-smoke: verificando que el proceso de "app" corre como usuario no-root ---'
container_user=$("${COMPOSE[@]}" exec -T app whoami)
if [ "$container_user" = 'root' ]; then
  echo "docker-smoke: el contenedor 'app' corre como root" >&2
  exit 1
fi
echo "  usuario del contenedor 'app': ${container_user}"

echo '--- docker-smoke: OK ---'
