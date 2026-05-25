@echo off
setlocal
cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a Git repository.
  pause
  exit /b 1
)

git pull --rebase --autostash origin main
if errorlevel 1 (
  echo git pull failed.
  pause
  exit /b 1
)

git lfs pull
if errorlevel 1 (
  echo git lfs pull failed.
  pause
  exit /b 1
)

echo Pull complete.
pause
