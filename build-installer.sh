#!/bin/bash

# Build Script for POS System Installers
# This script builds production-ready installers without exposing source code

set -e

echo "========================================="
echo "  POS System - Installer Builder"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js v18 or higher from nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo ""
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm run install:all
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Build React frontend
echo ""
echo -e "${YELLOW}Building React frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built${NC}"

# Determine platform
PLATFORM=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PLATFORM="win"
else
    echo -e "${RED}Unknown platform: $OSTYPE${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Building installer for: $PLATFORM${NC}"

# Build installer
case $PLATFORM in
    mac)
        npm run build:mac
        ;;
    win)
        npm run build:win
        ;;
    linux)
        npm run build:linux
        ;;
esac

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Installers are in the 'dist' folder:"
echo ""

# List created files
if [ -d "dist" ]; then
    ls -lh dist/*.{exe,dmg,AppImage,deb} 2>/dev/null || echo "Check dist/ folder for installers"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the installer on a clean system"
echo "2. Distribute only the installer file(s) to clients"
echo "3. Do NOT share source code or node_modules"
echo ""
echo -e "${GREEN}Ready for distribution!${NC}"

