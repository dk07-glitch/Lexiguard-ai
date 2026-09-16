@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     LexiGuard AI - Push to GitHub Repository
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git is not detected in your PATH.
    echo [*] Attempting to install Git via winget...
    winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo [!] Please install Git manually from https://git-scm.com/downloads and rerun this script.
        pause
        exit /b 1
    )
    echo [*] Git installed successfully. Please restart your terminal if needed.
)

:: Check if git repo is already initialized
if not exist ".git" (
    echo [*] Initializing Git repository...
    git init -b main
)

echo [*] Staging files...
git add .

echo [*] Creating commit...
git commit -m "Initial commit: LexiGuard AI - GenAI Legal Document Intelligence Platform"

echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/lexiguard-ai.git): "

if "%REPO_URL%"=="" (
    echo [!] No URL entered. Repository committed locally.
    echo Run: git remote add origin ^<YOUR_REPO_URL^>
    echo Run: git push -u origin main
    pause
    exit /b 0
)

git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo [*] Pushing to GitHub main branch...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] LexiGuard AI has been published to GitHub!
) else (
    echo.
    echo [!] Push encountered an error. If the repository is not empty, try: git push -u origin main --force
)

pause
