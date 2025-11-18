#!/bin/bash

echo "📦 Copying assets..."

# Create directories
mkdir -p dist/docs

# Copy openapi.yaml
if [ -f "src/docs/openapi.yaml" ]; then
    cp src/docs/openapi.yaml dist/docs/openapi.yaml
    echo "✅ Copied openapi.yaml to dist/docs/"
else
    echo "⚠️  openapi.yaml not found"
    exit 1
fi

# Copy other assets if needed
# cp -r public dist/
# cp -r views dist/

echo "✅ Assets copied successfully"