@echo off
setlocal
cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a Git repository.
  pause
  exit /b 1
)

git status --short
if errorlevel 1 (
  pause
  exit /b 1
)

git add -A
if errorlevel 1 (
  echo git add failed.
  pause
  exit /b 1
)

git diff --cached --quiet
if not errorlevel 1 (
  echo No changes to commit.
  pause
  exit /b 0
)

if "%~1"=="" (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do set "COMMIT_MSG=Update %%i"
) else (
  set "COMMIT_MSG=%*"
)

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo git commit failed.
  pause
  exit /b 1
)

echo Commit complete.
pause
