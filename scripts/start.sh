#!/usr/bin/env bash
set -euo pipefail

PORT=3000

# Kill anything on this port
PID=$(lsof -ti tcp:$PORT || true)
if [ -n "$PID" ]; then
  echo "🔪 Killing process on port $PORT (PID=$PID)..."
  kill -9 $PID
fi

echo "🚀 Starting Next.js on port $PORT..."
yarn start -p $PORT
