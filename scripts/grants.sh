#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="${GRANTS_DEV_LOG:-/tmp/grants-dev.log}"
URL="${GRANTS_DEV_URL:-http://localhost:3000}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl 이 필요합니다. 설치 후 다시 실행하세요."
  exit 1
fi

# 포트는 GRANTS_DEV_PORT가 우선, 없으면 URL에서 추출, 그래도 없으면 3000
PORT="${GRANTS_DEV_PORT:-}"
if [[ -z "$PORT" && "$URL" =~ :([0-9]+) ]]; then
  PORT="${BASH_REMATCH[1]}"
fi
PORT="${PORT:-3000}"

port_in_use() {
  if command -v ss >/dev/null 2>&1; then
    ss -tln | awk '{print $4}' | grep -q ":${PORT}\$"
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -i :"$PORT" -sTCP:LISTEN >/dev/null 2>&1
    return
  fi

  return 1
}

pid_on_port() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1
    return
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | awk '/:'"$PORT"' /{print $NF}' | sed -E 's/.*pid=([0-9]+).*/\1/' | head -n 1
    return
  fi
}

wait_for_ready() {
  for _ in $(seq 1 10); do
    if curl -fsS --max-time 2 "$URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

start_dev() {
  if port_in_use; then
    local pid
    pid="$(pid_on_port || true)"

    if wait_for_ready; then
      echo "포트 ${PORT}(pid=${pid:-?})에서 이미 서버가 응답 중입니다. 브라우저만 엽니다."
      return 0
    fi

    if [ -n "$pid" ]; then
      local cmdline
      cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"

      if [[ "$cmdline" == *"$ROOT_DIR"* ]] || [[ "$cmdline" == *"next"* ]]; then
        echo "포트 ${PORT} 프로세스(pid=$pid)가 응답하지 않습니다. 종료 후 재시작합니다."
        kill "$pid" 2>/dev/null || true
        sleep 1
      else
        echo "포트 ${PORT}는 다른 프로세스(pid=$pid, cmd: ${cmdline:-unknown})가 사용 중입니다. 강제 종료하지 않고 브라우저만 시도합니다."
        return 0
      fi
    else
      echo "포트 ${PORT}가 점유 중인데 PID를 찾지 못했습니다. 재시작을 시도합니다."
    fi
  fi

  (
    cd "$ROOT_DIR"
    npm run dev >"$LOG_FILE" 2>&1 &
  )

  if wait_for_ready; then
    echo "grants dev 서버를 시작했습니다. 로그: $LOG_FILE"
  else
    echo "dev 서버 응답을 확인하지 못했습니다. 로그를 확인하세요: $LOG_FILE"
  fi
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
