#!/usr/bin/env bash
# Prueba de regresión para el incidente real documentado en
# openspec/changes/testing-qa-performance/design.md (sección Risks): el
# primer scripts/docker-smoke.sh destruyó la base de datos de desarrollo
# porque `compose.prod.yaml` corría bajo el mismo namespace de proyecto de
# Compose que `compose.yaml` (ninguno declaraba `name:`, y ambos
# reutilizan los mismos nombres de servicio `app`/`db`).
#
# Esta prueba reproduce la MISMA forma del problema (dos stacks
# compartiendo un nombre de servicio, "marker") con recursos
# completamente desechables y ajenos a cualquier stack real, y prueba el
# invariante exacto que scripts/docker-smoke.sh ahora depende: un
# proyecto de Compose con `-p` explícito nunca es afectado por `down -v`
# de otro proyecto, sin importar que compartan nombres de servicio -
# ver design.md, sección Risks, principio "nunca confiar en diferencias
# de nombre de servicio como aislamiento; el límite de seguridad es el
# namespace de proyecto".
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

COMPOSE_FILE='tests/fixtures/docker-isolation/marker-compose.yml'
FAKE_DEV_PROJECT='docker-isolation-test-fakedev'
FAKE_SMOKE_PROJECT='docker-isolation-test-fakesmoke'

cleanup() {
  echo '--- verify-docker-isolation: limpieza final de ambos proyectos desechables ---'
  docker compose -p "$FAKE_DEV_PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans || true
  docker compose -p "$FAKE_SMOKE_PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans || true
}
trap cleanup EXIT

echo "--- verify-docker-isolation: 1) simulando un stack de 'desarrollo' ya en ejecución (proyecto '${FAKE_DEV_PROJECT}') ---"
docker compose -p "$FAKE_DEV_PROJECT" -f "$COMPOSE_FILE" up -d
fakedev_container=$(docker compose -p "$FAKE_DEV_PROJECT" -f "$COMPOSE_FILE" ps -q marker)
fakedev_volume="${FAKE_DEV_PROJECT}_marker_data"

if [ -z "$fakedev_container" ]; then
  echo 'verify-docker-isolation: FALLO - no se pudo crear el marcador de "desarrollo"' >&2
  exit 1
fi
docker volume inspect "$fakedev_volume" > /dev/null

echo "--- verify-docker-isolation: 2) levantando el stack de 'smoke' bajo su propio proyecto aislado ('${FAKE_SMOKE_PROJECT}'), mismo archivo/servicio ---"
docker compose -p "$FAKE_SMOKE_PROJECT" -f "$COMPOSE_FILE" up -d
fakesmoke_container=$(docker compose -p "$FAKE_SMOKE_PROJECT" -f "$COMPOSE_FILE" ps -q marker)
fakesmoke_volume="${FAKE_SMOKE_PROJECT}_marker_data"

if [ "$fakesmoke_container" = "$fakedev_container" ]; then
  echo 'verify-docker-isolation: FALLO - el stack de "smoke" reutilizó el contenedor de "desarrollo" en vez de crear uno separado' >&2
  exit 1
fi

echo "--- verify-docker-isolation: 3) ejecutando la limpieza destructiva del stack de 'smoke' (mismo guard que scripts/docker-smoke.sh) ---"
assert_project_is_active() {
  local project="$1"
  local ids
  ids=$(docker ps -aq --filter "label=com.docker.compose.project=${project}")
  if [ -z "$ids" ]; then
    return 1
  fi
  local id label
  for id in $ids; do
    label=$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' "$id")
    if [ "$label" != "$project" ]; then
      echo "verify-docker-isolation: guard rechazaría la limpieza - contenedor ${id} tiene proyecto '${label}', se esperaba '${project}'" >&2
      exit 1
    fi
  done
  return 0
}

if assert_project_is_active "$FAKE_SMOKE_PROJECT"; then
  docker compose -p "$FAKE_SMOKE_PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans
fi

echo "--- verify-docker-isolation: 4) verificando que el stack de 'desarrollo' NO fue afectado ---"
if ! docker inspect "$fakedev_container" > /dev/null 2>&1; then
  echo 'verify-docker-isolation: FALLO - el contenedor de "desarrollo" fue eliminado por la limpieza del stack de "smoke"' >&2
  exit 1
fi
if ! docker volume inspect "$fakedev_volume" > /dev/null 2>&1; then
  echo 'verify-docker-isolation: FALLO - el volumen de "desarrollo" fue eliminado por la limpieza del stack de "smoke"' >&2
  exit 1
fi
dev_container_state=$(docker inspect --format '{{.State.Status}}' "$fakedev_container")
if [ "$dev_container_state" != 'running' ]; then
  echo "verify-docker-isolation: FALLO - el contenedor de 'desarrollo' ya no está 'running' (estado: ${dev_container_state})" >&2
  exit 1
fi

echo '--- verify-docker-isolation: OK - la limpieza del stack de "smoke" nunca afectó recursos del stack de "desarrollo" ---'
