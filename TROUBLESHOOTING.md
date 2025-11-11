# Troubleshooting Guide

## Issue: `concurrently: command not found`

### Problem
When running `npm run dev`, you get an error:
```
sh: concurrently: command not found
```

### Cause
This happens when `NODE_ENV` is set to `production`, which causes npm to skip installing `devDependencies` by default.

### Solution

**Option 1: Unset NODE_ENV (Recommended)**
```bash
unset NODE_ENV
npm install
npm run dev
```

**Option 2: Install dev dependencies explicitly**
```bash
npm install --include=dev
npm run dev
```

**Option 3: Use the install:all script**
```bash
npm run install:all
npm run dev
```

### Verification
After installing, verify concurrently is available:
```bash
./node_modules/.bin/concurrently --version
# Should output: 8.2.2 (or similar version)
```

## Issue: better-sqlite3 Module Version Mismatch

### Problem
```
Error: The module was compiled against a different Node.js version
NODE_MODULE_VERSION 115. This version of Node.js requires NODE_MODULE_VERSION 118.
```

### Solution
Rebuild the native module for Electron:
```bash
npm run rebuild
```

Or use the install:all script which includes rebuild:
```bash
npm run install:all
```

## Issue: MongoDB Connection Warnings

### Problem
```
Warning: useNewUrlParser is a deprecated option
Warning: useUnifiedTopology is a deprecated option
```

### Solution
These warnings are fixed in the latest code. The deprecated options have been removed from `backend/server.js`.

## Issue: Dependencies Not Installing

### Check NODE_ENV
```bash
echo $NODE_ENV
```

If it's set to `production`, unset it:
```bash
unset NODE_ENV
npm install
```

### Clean Install
If issues persist, try a clean install:
```bash
rm -rf node_modules package-lock.json
npm install --include=dev
```

## General Installation Steps

1. **Check NODE_ENV**:
   ```bash
   echo $NODE_ENV
   ```

2. **If NODE_ENV is set to production, unset it**:
   ```bash
   unset NODE_ENV
   ```

3. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Environment Variables

### For Development
```bash
# Unset NODE_ENV or set it to development
unset NODE_ENV
# or
export NODE_ENV=development
```

### For Production Build
```bash
# NODE_ENV=production is fine for building
npm run build
```

## Quick Fixes

### Reset Everything
```bash
# Unset NODE_ENV
unset NODE_ENV

# Clean install
rm -rf node_modules package-lock.json frontend/node_modules backend/node_modules
npm run install:all
```

### Verify Installation
```bash
# Check if concurrently is installed
test -d node_modules/concurrently && echo "✅ Installed" || echo "❌ Not installed"

# Check if electron is installed
test -d node_modules/electron && echo "✅ Installed" || echo "❌ Not installed"

# Check if better-sqlite3 is installed
test -d node_modules/better-sqlite3 && echo "✅ Installed" || echo "❌ Not installed"
```

## Common Commands

```bash
# Install all dependencies (including dev)
npm run install:all

# Rebuild native modules for Electron
npm run rebuild

# Start development server
npm run dev

# Build for production
npm run build
```

