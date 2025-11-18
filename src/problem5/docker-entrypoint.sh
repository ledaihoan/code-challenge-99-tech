#!/bin/sh
set -e

echo "Running Prisma migrations..."
yarn prisma migrate deploy

echo "Starting application..."
exec node dist/server.js