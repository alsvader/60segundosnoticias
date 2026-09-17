#!/usr/bin/env bash
# Prueba de regresión para openspec/changes/payload-s3-importmap: el
# `importMap.js` comprometido en el repo es un único archivo compartido por
# TODOS los entornos (dev sin S3, producción/E2E con S3). Antes de este
# fix, `src/payload/plugins/media-storage.ts` registraba el plugin
# `s3Storage()` de forma condicional (`isS3Configured() ? [s3Storage(...)]
# : []`), así que dev y producción producían configuraciones de Payload
# ESTRUCTURALMENTE distintas - el archivo generado oscilaba según qué
# entorno lo regeneró por última vez, y cualquier build de producción con
# S3 heredaba una versión sin `S3ClientUploadHandler`, dejando el Admin sin
# hidratar (`/admin/login` en blanco). Ver design.md/tasks.md 6.9 para el
# incidente completo.
#
# El fix (media-storage.ts) llama a `s3Storage()` SIEMPRE, con
# `enabled: isS3Configured()` en vez de omitir el plugin. Esto invariante
# que este script prueba directamente: el import map generado debe ser
# BYTE-IDÉNTICO sin importar si las variables `S3_*` están presentes o no.
# Si algún cambio futuro reintroduce el registro condicional del plugin (o
# cualquier otra fuente de divergencia dev/prod en `config.admin.*`), este
# script falla en CI antes de que el import map committeado quede
# desincronizado de nuevo.
#
# No requiere Postgres real ni ningún servicio corriendo: `generate:importmap`
# solo resuelve `payload.config.ts` (aplica plugins) y enumera
# `config.admin.*` - nunca llama a `payload.init()` ni abre una conexión de
# base de datos real, confirmado empíricamente con un DATABASE_URI inválido.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

IMPORT_MAP_PATH='src/app/(payload)/admin/importMap.js'
PLACEHOLDER_DATABASE_URI='postgres://verify-importmap-unused:5432/verify-importmap-unused'
PLACEHOLDER_PAYLOAD_SECRET='verify-importmap-ci-placeholder-secret'

if [ ! -f "$IMPORT_MAP_PATH" ]; then
  echo "verify-importmap: no se encontró '${IMPORT_MAP_PATH}'" >&2
  exit 1
fi

# El blob tal como está en HEAD, no el archivo en disco: así el guard
# también detecta el caso "olvidé regenerar y commitear" localmente, no
# solo la divergencia dev/prod dentro de una misma corrida de CI.
committed_hash=$(git rev-parse "HEAD:${IMPORT_MAP_PATH}")

restore_working_tree() {
  git checkout -- "$IMPORT_MAP_PATH" 2>/dev/null || true
}
trap restore_working_tree EXIT

check_env() {
  local label="$1"
  shift
  echo "--- verify-importmap: regenerando con entorno '${label}' ---"
  env "$@" pnpm payload generate:importmap >/dev/null 2>&1 || {
    echo "verify-importmap: 'payload generate:importmap' falló para el entorno '${label}'" >&2
    exit 1
  }
  local new_hash
  new_hash=$(git hash-object "$IMPORT_MAP_PATH")
  if [ "$new_hash" != "$committed_hash" ]; then
    echo "verify-importmap: FALLO - '${IMPORT_MAP_PATH}' está desactualizado para el entorno '${label}'." >&2
    echo "  Ejecuta 'pnpm payload generate:importmap' localmente y commitea el resultado." >&2
    git diff --stat -- "$IMPORT_MAP_PATH" >&2 || true
    restore_working_tree
    exit 1
  fi
  echo "  OK - sin diferencias para '${label}'"
}

check_env 'sin S3 (forma de desarrollo)' \
  DATABASE_URI="$PLACEHOLDER_DATABASE_URI" \
  PAYLOAD_SECRET="$PLACEHOLDER_PAYLOAD_SECRET"

check_env 'con S3 (forma de producción/E2E)' \
  DATABASE_URI="$PLACEHOLDER_DATABASE_URI" \
  PAYLOAD_SECRET="$PLACEHOLDER_PAYLOAD_SECRET" \
  S3_ENDPOINT='http://localhost:9000' \
  S3_REGION='us-east-1' \
  S3_BUCKET='e2e-test-media' \
  S3_ACCESS_KEY_ID='e2eminioadmin' \
  S3_SECRET_ACCESS_KEY='e2eminioadmin' \
  S3_PUBLIC_URL='http://localhost:9000/e2e-test-media'

echo '--- verify-importmap: OK - el import map committeado converge en ambos entornos ---'
