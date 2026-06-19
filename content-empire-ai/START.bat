@echo off
title Content Empire AI — Setup
color 0A

echo.
echo  ==========================================
echo   Content Empire AI — Auto Setup
echo  ==========================================
echo.

:: ── Check Git ──────────────────────────────
echo  Checking for Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  *** ERROR: Git is NOT installed ***
    echo.
    echo  Please install Git first:
    echo  https://git-scm.com/download/win
    echo.
    echo  After installing Git, close this window and double-click START.bat again.
    echo.
    pause
    exit /b 1
)
echo  Git found OK.

:: ── Check Node ─────────────────────────────
echo  Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  *** ERROR: Node.js is NOT installed ***
    echo.
    echo  Please install Node.js first:
    echo  https://nodejs.org  (click the LTS button)
    echo.
    echo  After installing Node.js, close this window and double-click START.bat again.
    echo.
    pause
    exit /b 1
)
echo  Node.js found OK.
echo.

:: ── Clone or update repo ────────────────────
if exist "fb-ad-creator1\content-empire-ai\package.json" (
    echo  Project folder already exists. Updating...
    cd fb-ad-creator1
    git checkout claude/content-empire-ai-o296rg 2>nul
    git pull origin claude/content-empire-ai-o296rg
    echo  Update complete.
) else (
    echo  Downloading Content Empire AI from GitHub...
    git clone https://github.com/chinorealestatela-boop/fb-ad-creator1.git
    if %errorlevel% neq 0 (
        echo.
        echo  *** ERROR: Could not download the project ***
        echo  Check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    cd fb-ad-creator1
    git checkout claude/content-empire-ai-o296rg
)

:: ── Enter app folder ────────────────────────
cd content-empire-ai
echo.
echo  Entered: %CD%
echo.

:: ── Env file ───────────────────────────────
if not exist ".env.local" (
    copy .env.example .env.local >nul
)

:: ── Install packages ───────────────────────
echo  Installing packages (takes 1-3 minutes the first time)...
echo  Please wait — do NOT close this window...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo  *** ERROR: npm install failed ***
    echo  Try running this window as Administrator.
    echo.
    pause
    exit /b 1
)

:: ── Launch ─────────────────────────────────
echo.
echo  ==========================================
echo.
echo   SUCCESS! Starting Content Empire AI...
echo.
echo   Your browser will open in 5 seconds at:
echo   http://localhost:3001
echo.
echo   Keep this window open while using the app.
echo   To stop: press Ctrl+C in this window.
echo.
echo  ==========================================
echo.

:: Wait 5 seconds then open browser
ping 127.0.0.1 -n 6 >nul
start http://localhost:3001

:: Start the server (keeps window open)
npm run dev
