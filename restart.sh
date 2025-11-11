#!/bin/bash

echo "🔄 Restarting POS System..."
echo ""

# Kill any running Electron processes
echo "1. Killing Electron processes..."
pkill -f electron || echo "   No Electron processes found"

# Wait a moment
sleep 2

# Start the dev server
echo "2. Starting dev server..."
echo ""
npm run dev

