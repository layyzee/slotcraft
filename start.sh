#!/usr/bin/env bash
# SlotCraft One-Click Launcher for macOS
# Runs on Port 3001 (Zero-Cost Local SQLite SaaS)

cd "$(dirname "$0")"

PORT=3001
echo "🏥 Starting SlotCraft Clinic SaaS on http://localhost:$PORT ..."

# Check if port is in use
if lsof -i :$PORT >/dev/null 2>&1; then
  echo "⚠️ Port $PORT is already running. Opening browser..."
else
  npm run start -- -p $PORT &
  sleep 2
fi

open "http://localhost:$PORT"
echo "✅ SlotCraft is live at http://localhost:$PORT"
