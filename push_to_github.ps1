# LexiGuard AI - Push to GitHub PowerShell Script
param(
    [string]$RepoUrl
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    LexiGuard AI - Push to GitHub Repository" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Git is not found on your system." -ForegroundColor Yellow
    Write-Host "[*] Installing Git via winget..." -ForegroundColor Green
    winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
    
    # Reload Path
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[!] Please install Git from https://git-scm.com/ and restart PowerShell." -ForegroundColor Red
        return
    }
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "[*] Initializing Git repository..." -ForegroundColor Green
    git init -b main
}

Write-Host "[*] Staging all files..." -ForegroundColor Green
git add .

Write-Host "[*] Committing files..." -ForegroundColor Green
git commit -m "Initial commit: LexiGuard AI - GenAI Legal Document Intelligence Platform"

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub Repository URL (e.g. https://github.com/username/lexiguard-ai.git)"
}

if ($RepoUrl) {
    git remote remove origin 2>$null
    git remote add origin $RepoUrl
    git branch -M main
    Write-Host "[*] Pushing to GitHub (main)..." -ForegroundColor Green
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] LexiGuard AI has been published to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "`n[!] Push failed. Check credentials or try: git push -u origin main --force" -ForegroundColor Yellow
    }
} else {
    Write-Host "[*] Committed locally. Run git remote add origin <URL> and git push -u origin main when ready." -ForegroundColor Cyan
}
