#!/bin/bash

# Lint and fix all TypeScript files
echo "🔍 Running ESLint and Prettier on all files..."

# Fix ESLint issues
echo "📝 Fixing ESLint issues..."
npx eslint "src/**/*.ts" --fix

# Format with Prettier
echo "🎨 Formatting with Prettier..."
npx prettier --write "src/**/*.ts"

# Check for remaining issues
echo "✅ Checking for remaining issues..."
npx eslint "src/**/*.ts"

echo "🎉 Linting complete!"
