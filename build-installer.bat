@echo off
REM Build Script for POS System Installers (Windows)
REM This script builds production-ready installers without exposing source code

echo =========================================
echo   POS System - Installer Builder
echo =========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js v18 or higher from nodejs.org
    exit /b 1
)

echo [OK] Node.js detected
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm run install:all
    echo [OK] Dependencies installed
    echo.
)

REM Build React frontend
echo Building React frontend...
cd frontend
call npm run build
cd ..
echo [OK] Frontend built
echo.

REM Build Windows installer
echo Building Windows installer...
call npm run build:win
echo.

echo =========================================
echo   Build Complete!
echo =========================================
echo.
echo Installers are in the 'dist' folder
echo.
echo Next steps:
echo 1. Test the installer on a clean system
echo 2. Distribute only the installer file(s) to clients
echo 3. Do NOT share source code or node_modules
echo.
echo Ready for distribution!
echo.

pause

