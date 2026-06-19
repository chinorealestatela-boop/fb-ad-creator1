@echo off
title Content Empire AI — Setup & Launch
color 0A

echo.
echo  ==========================================
echo   Content Empire AI — Auto Setup
echo  ==========================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Git is not installed.
    echo  Download it from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download it from: https://nodejs.org
    pause
    exit /b 1
)

echo  [1/5] Checking if repo already exists...

if exist "fb-ad-creator1\content-empire-ai" (
    echo  Repo found. Pulling latest changes...
    cd fb-ad-creator1
    git fetch origin
    git checkout claude/content-empire-ai-o296rg
    git pull origin claude/content-empire-ai-o296rg
) else (
    echo  [1/5] Cloning repository...
    git clone https://github.com/chinorealestatela-boop/fb-ad-creator1.git
    cd fb-ad-creator1
    git checkout claude/content-empire-ai-o296rg
)

echo.
echo  [2/5] Entering Content Empire AI directory...
cd content-empire-ai

echo.
echo  [3/5] Setting up environment file...
if not exist ".env.local" (
    copy .env.example .env.local >nul
    echo  Created .env.local
) else (
    echo  .env.local already exists — skipping
)

echo.
echo  [4/5] Installing dependencies (this may take 1-2 minutes)...
call npm install

echo.
echo  [5/5] Starting Content Empire AI...
echo.
echo  ==========================================
echo   App is running at: http://localhost:3001
echo   Opening in your browser now...
echo   Press Ctrl+C to stop the server
echo  ==========================================
echo.

:: Open browser after 3 seconds
start "" timeout /t 3 /nobreak >nul & start http://localhost:3001

:: Start the dev server
call npm run dev
