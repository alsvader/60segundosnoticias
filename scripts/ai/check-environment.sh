#!/usr/bin/env bash
set -u

PASS=0
WARN=0
FAIL=0

ok()   { printf '✓ %s\n' "$1"; PASS=$((PASS + 1)); }
warn() { printf '! %s\n' "$1"; WARN=$((WARN + 1)); }
fail() { printf '✗ %s\n' "$1"; FAIL=$((FAIL + 1)); }

has() { command -v "$1" >/dev/null 2>&1; }

printf '60 Segundos — AI development environment check\n\n'

if has git; then ok "Git: $(git --version)"; else fail 'Git is missing'; fi

if has node; then
  NODE_RAW="$(node -v 2>/dev/null | sed 's/^v//')"
  NODE_MAJOR="${NODE_RAW%%.*}"
  NODE_REST="${NODE_RAW#*.}"
  NODE_MINOR="${NODE_REST%%.*}"
  if [ "${NODE_MAJOR:-0}" -gt 20 ] || { [ "${NODE_MAJOR:-0}" -eq 20 ] && [ "${NODE_MINOR:-0}" -ge 19 ]; }; then
    ok "Node: v${NODE_RAW}"
  else
    fail "Node v${NODE_RAW} detected; OpenSpec currently requires Node 20.19+"
  fi
else
  fail 'Node is missing'
fi

if has pnpm; then ok "pnpm: $(pnpm --version)"; else fail 'pnpm is missing'; fi
if has npx; then ok "npx: available"; else fail 'npx is missing (required for project skill installation)'; fi
if has docker; then ok "Docker: $(docker --version)"; else fail 'Docker is missing'; fi

if docker compose version >/dev/null 2>&1; then
  ok "Docker Compose: $(docker compose version --short 2>/dev/null || docker compose version)"
else
  fail 'Docker Compose plugin is missing'
fi

if has openspec; then ok "OpenSpec: $(openspec --version 2>/dev/null | head -1)"; else warn 'OpenSpec CLI is not installed'; fi
if has graphify; then ok "Graphify: $(graphify --version 2>/dev/null | head -1)"; else warn 'Graphify CLI is not installed'; fi
if has uv; then ok "uv: $(uv --version 2>/dev/null | head -1)"; else warn 'uv is not installed (recommended for isolated Graphify installation)'; fi
if has claude; then ok "Claude Code: installed"; else warn 'Claude Code not found (optional if using another supported agent)'; fi
if has codex; then ok "Codex: installed"; else warn 'Codex not found (optional if using another supported agent)'; fi

if [ -f "skills-lock.json" ]; then
  ok "skills-lock.json: present"
else
  warn "skills-lock.json is missing"
fi

printf '\nSummary: %d passed, %d warning(s), %d failure(s).\n' "$PASS" "$WARN" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
