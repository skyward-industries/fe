#!/bin/bash

echo "Finding all files with nsn- links..."
echo ""

# Find all TypeScript/JavaScript files with nsn- references
grep -r "nsn-[0-9]\{4\}-[0-9]\{2\}-[0-9]\{3\}-[0-9]\{4\}" \
  --include="*.tsx" \
  --include="*.ts" \
  --include="*.jsx" \
  --include="*.js" \
  src/ components/ 2>/dev/null | \
  grep -v "node_modules" | \
  awk -F: '{print $1}' | \
  sort -u

echo ""
echo "To fix these, run:"
echo "grep -r 'nsn-' --include='*.tsx' --include='*.ts' src/ components/"