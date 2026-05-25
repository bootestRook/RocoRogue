@echo off
setlocal
cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a Git repository.
  pause
  exit /b 1
)

git push -u origin main
if errorlevel 1 (
  echo git push failed.
  pause
  exit /b 1
)

echo Push complete.
pause
