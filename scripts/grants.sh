#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="${GRANTS_DEV_LOG:-/tmp/grants-dev.log}"
URL="${GRANTS_DEV_URL:-http://localhost:3000}"

port_in_use() {
  if command -v ss >/dev/null 2>&1; then
    ss -tln | awk '{print $4}' | grep -q ":3000\$"
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1
    return
  fi

  return 1
}

start_dev() {
  if port_in_use; then
    echo "포트 3000이 이미 사용 중입니다. dev 서버가 떠 있을 수 있어요."
    return 0
  fi

  (
    cd "$ROOT_DIR"
    npm run dev >"$LOG_FILE" 2>&1 &
  )

  echo "grants dev 서버를 시작했습니다. 로그: $LOG_FILE"
}

open_url() {
  local url="$1"

  if command -v wslview >/dev/null 2>&1; then
    nohup wslview "$url" >/dev/null 2>&1 &
    return
  fi

  if command -v cmd.exe >/dev/null 2>&1; then
    nohup cmd.exe /C start "$url" >/dev/null 2>&1 &
    return
  fi

  if [ -x "/mnt/c/Windows/System32/cmd.exe" ]; then
    nohup "/mnt/c/Windows/System32/cmd.exe" /C start "$url" >/dev/null 2>&1 &
    return
  fi

  if command -v xdg-open >/dev/null 2>&1; then
    nohup xdg-open "$url" >/dev/null 2>&1 &
    return
  fi

  echo "$url 를 브라우저에서 열어주세요."
}

main() {
  start_dev
  sleep 2
  open_url "$URL"
}

main "$@"
