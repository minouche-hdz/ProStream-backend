#!/bin/sh
set -e

# Fix permissions for HLS temp directory and Logs
if [ -d "/app/hls_temp" ]; then
    chown -R nestjs:nodejs /app/hls_temp
fi

if [ -d "/app/logs" ]; then
    chown -R nestjs:nodejs /app/logs
fi

# Execute the command as the nestjs user
exec su-exec nestjs "$@"
