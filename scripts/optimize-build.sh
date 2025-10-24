#!/bin/bash

# Build optimization script to reduce disk space usage
echo "🚀 Starting build optimization..."

# Clean up any existing build artifacts
echo "🧹 Cleaning up existing build artifacts..."
rm -rf .next
rm -rf out
rm -rf build
rm -rf dist

# Clean up node_modules cache
echo "🧹 Cleaning up node_modules cache..."
rm -rf node_modules/.cache
rm -rf .npm
rm -rf .yarn

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# Clean up logs
echo "🧹 Cleaning up logs..."
rm -rf logs
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# Clean up coverage reports
echo "🧹 Cleaning up coverage reports..."
rm -rf coverage
rm -rf .nyc_output

# Clean up IDE files
echo "🧹 Cleaning up IDE files..."
rm -rf .vscode/settings.json
rm -rf .idea/workspace.xml
rm -rf .idea/tasks.xml

# Clean up Git files
echo "🧹 Cleaning up Git files..."
rm -rf .git/hooks
rm -rf .git/logs

echo "✅ Build optimization complete!"
echo "📊 Disk space saved:"
du -sh . 2>/dev/null || echo "Unable to calculate disk usage"
