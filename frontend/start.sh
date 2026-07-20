#!/bin/sh
# Start script for frontend (Next.js)
# Installs, builds and starts Next on the provided $PORT
npm ci
npm run build
npm run start -- -p "${PORT:-3000}"
